const db = require('../database/connection');
const { normalizeArabic, cleanPhone } = require('../utils/arabicUtils');
const { generateRecordCode } = require('../utils/codeGenerator');

// Check duplicate teacher/staff
exports.checkDuplicate = (req, res) => {
  try {
    const { quad_name, dob, national_id, phone, currentId } = req.body;
    const normalized = normalizeArabic(quad_name);
    const cleanedPhone = cleanPhone(phone);

    let match = null;

    // 1. Check by National ID / Document ID
    if (national_id && national_id.trim().length > 3) {
      match = db.prepare(`
        SELECT id, code, quad_name, dob, phone, job_title, 'رقم البطاقة الوطنية / الوثيقة' as match_reason
        FROM teachers_staff
        WHERE (national_id = ? OR id_number = ?)
        ${currentId ? 'AND id != ?' : ''}
        LIMIT 1
      `).get(national_id.trim(), national_id.trim(), ...(currentId ? [currentId] : []));
    }

    // 2. Check by Normalized Quad Name + DOB
    if (!match && normalized && dob) {
      match = db.prepare(`
        SELECT id, code, quad_name, dob, phone, job_title, 'الاسم الرباعي وتاريخ التولد' as match_reason
        FROM teachers_staff
        WHERE normalized_name = ? AND dob = ?
        ${currentId ? 'AND id != ?' : ''}
        LIMIT 1
      `).get(normalized, dob, ...(currentId ? [currentId] : []));
    }

    // 3. Check by Phone + Normalized Name
    if (!match && normalized && cleanedPhone && cleanedPhone.length >= 10) {
      match = db.prepare(`
        SELECT id, code, quad_name, dob, phone, job_title, 'الاسم ورقم الهاتف' as match_reason
        FROM teachers_staff
        WHERE normalized_name = ? AND phone = ?
        ${currentId ? 'AND id != ?' : ''}
        LIMIT 1
      `).get(normalized, cleanedPhone, ...(currentId ? [currentId] : []));
    }

    if (match) {
      return res.json({
        isDuplicate: true,
        message: `قد يكون هذا الموظف/المدرس مسجلاً مسبقاً بناءً على تطابق (${match.match_reason})`,
        matchedRecord: match
      });
    }

    return res.json({ isDuplicate: false });
  } catch (error) {
    console.error('Check duplicate teacher error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء فحص التكرار للمدرسين' });
  }
};

// Get all teachers and staff with search, filters, pagination
exports.getAll = (req, res) => {
  try {
    const {
      search,
      employment_type,
      staff_category,
      employment_status,
      gender,
      highest_degree,
      page = 1,
      limit = 15,
      sortBy = 'id',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const conditions = [];
    const params = [];

    // Smart Arabic Search
    if (search && search.trim()) {
      const normSearch = normalizeArabic(search);
      const cleanSearch = search.trim();
      conditions.push(`(
        normalized_name LIKE ? OR
        code LIKE ? OR
        phone LIKE ? OR
        national_id LIKE ? OR
        id_number LIKE ? OR
        job_number LIKE ?
      )`);
      params.push(
        `%${normSearch}%`,
        `%${cleanSearch}%`,
        `%${cleanSearch}%`,
        `%${cleanSearch}%`,
        `%${cleanSearch}%`,
        `%${cleanSearch}%`
      );
    }

    if (employment_type) {
      conditions.push('employment_type = ?');
      params.push(employment_type);
    }
    if (staff_category) {
      conditions.push('staff_category = ?');
      params.push(staff_category);
    }
    if (employment_status) {
      conditions.push('employment_status = ?');
      params.push(employment_status);
    }
    if (gender) {
      conditions.push('gender = ?');
      params.push(gender);
    }
    if (highest_degree) {
      conditions.push('highest_degree = ?');
      params.push(highest_degree);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const safeSortBy = ['id', 'code', 'quad_name', 'job_title', 'staff_category', 'created_at'].includes(sortBy) ? sortBy : 'id';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const countQuery = `SELECT COUNT(*) as total FROM teachers_staff ${whereClause}`;
    const total = db.prepare(countQuery).get(...params).total;

    const dataQuery = `
      SELECT * FROM teachers_staff
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT ? OFFSET ?
    `;
    const records = db.prepare(dataQuery).all(...params, parseInt(limit, 10), offset);

    res.json({
      success: true,
      data: records,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / parseInt(limit, 10))
      }
    });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء جلب سجلات المدرسين والموظفين' });
  }
};

// Get single teacher/staff by ID or Code
exports.getById = (req, res) => {
  try {
    const { id } = req.params;
    const isCode = isNaN(id);
    const query = isCode
      ? 'SELECT * FROM teachers_staff WHERE code = ?'
      : 'SELECT * FROM teachers_staff WHERE id = ?';

    const record = db.prepare(query).get(id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'سجل المدرس/الموظف غير موجود' });
    }

    res.json({ success: true, data: record });
  } catch (error) {
    console.error('Get teacher by id error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء جلب تفاصيل الموظف/المدرس' });
  }
};

// Create new teacher / staff record
exports.create = (req, res) => {
  try {
    const data = { ...req.body };
    const code = generateRecordCode(db, 'TEACHER');
    const normalized_name = normalizeArabic(data.quad_name);

    const stmt = db.prepare(`
      INSERT INTO teachers_staff (
        code, quad_name, normalized_name, surname, mother_name, dob, gender, nationality, religion, mother_tongue,
        birth_country, birth_place, province, district, sub_district, blood_type, social_status,
        id_type, id_number, national_id, record_number, page_number, family_number, id_issuer, issuer_country, id_issue_date,
        phone, alt_phone, email, city_village, neighborhood, mahalla, zuqaq, house_no, address_details, landmark, housing_type,
        emergency_contact_name, emergency_relationship, emergency_phone,
        has_special_needs, special_needs_type, special_needs_level, special_needs_details, special_needs_notes,
        employment_type, staff_category, employment_status, job_title, job_grade, classification, job_official_title, job_position,
        school_name, department, subject_taught, stages_taught, first_appointment_date, start_date, job_number, file_number,
        highest_degree, university, college_dept, specialization, grad_year, degree_name, training_courses, notes,
        photo_url
      ) VALUES (
        @code, @quad_name, @normalized_name, @surname, @mother_name, @dob, @gender, @nationality, @religion, @mother_tongue,
        @birth_country, @birth_place, @province, @district, @sub_district, @blood_type, @social_status,
        @id_type, @id_number, @national_id, @record_number, @page_number, @family_number, @id_issuer, @issuer_country, @id_issue_date,
        @phone, @alt_phone, @email, @city_village, @neighborhood, @mahalla, @zuqaq, @house_no, @address_details, @landmark, @housing_type,
        @emergency_contact_name, @emergency_relationship, @emergency_phone,
        @has_special_needs, @special_needs_type, @special_needs_level, @special_needs_details, @special_needs_notes,
        @employment_type, @staff_category, @employment_status, @job_title, @job_grade, @classification, @job_official_title, @job_position,
        @school_name, @department, @subject_taught, @stages_taught, @first_appointment_date, @start_date, @job_number, @file_number,
        @highest_degree, @university, @college_dept, @specialization, @grad_year, @degree_name, @training_courses, @notes,
        @photo_url
      )
    `);

    const result = stmt.run({
      code,
      quad_name: data.quad_name.trim(),
      normalized_name,
      surname: data.surname || '',
      mother_name: data.mother_name || '',
      dob: data.dob,
      gender: data.gender || 'أنثى',
      nationality: data.nationality || 'عراقي',
      religion: data.religion || 'مسلم',
      mother_tongue: data.mother_tongue || 'العربية',
      birth_country: data.birth_country || 'العراق',
      birth_place: data.birth_place || '',
      province: data.province || 'بغداد',
      district: data.district || '',
      sub_district: data.sub_district || '',
      blood_type: data.blood_type || '',
      social_status: data.social_status || 'متزوج/ة',
      id_type: data.id_type || 'بطاقة وطنية موحدة',
      id_number: data.id_number || '',
      national_id: data.national_id || '',
      record_number: data.record_number || '',
      page_number: data.page_number || '',
      family_number: data.family_number || '',
      id_issuer: data.id_issuer || '',
      issuer_country: data.issuer_country || 'العراق',
      id_issue_date: data.id_issue_date || '',
      phone: cleanPhone(data.phone),
      alt_phone: cleanPhone(data.alt_phone),
      email: data.email || '',
      city_village: data.city_village || '',
      neighborhood: data.neighborhood || '',
      mahalla: data.mahalla || '',
      zuqaq: data.zuqaq || '',
      house_no: data.house_no || '',
      address_details: data.address_details || '',
      landmark: data.landmark || '',
      housing_type: data.housing_type || 'ملك',
      emergency_contact_name: data.emergency_contact_name || '',
      emergency_relationship: data.emergency_relationship || '',
      emergency_phone: cleanPhone(data.emergency_phone),
      has_special_needs: data.has_special_needs ? 1 : 0,
      special_needs_type: data.special_needs_type || '',
      special_needs_level: data.special_needs_level || '',
      special_needs_details: data.special_needs_details || '',
      special_needs_notes: data.special_needs_notes || '',
      employment_type: data.employment_type || 'ملاك دائم',
      staff_category: data.staff_category || 'تدريسي',
      employment_status: data.employment_status || 'مستمر',
      job_title: data.job_title || '',
      job_grade: data.job_grade || '',
      classification: data.classification || 'معلم',
      job_official_title: data.job_official_title || '',
      job_position: data.job_position || 'مدرس',
      school_name: data.school_name || 'مدرسة المتفوقات الأولى للبنات',
      department: data.department || '',
      subject_taught: data.subject_taught || '',
      stages_taught: data.stages_taught || '',
      first_appointment_date: data.first_appointment_date || '',
      start_date: data.start_date || '',
      job_number: data.job_number || '',
      file_number: data.file_number || '',
      highest_degree: data.highest_degree || 'بكالوريوس',
      university: data.university || '',
      college_dept: data.college_dept || '',
      specialization: data.specialization || '',
      grad_year: data.grad_year || '',
      degree_name: data.degree_name || '',
      training_courses: data.training_courses || '',
      notes: data.notes || '',
      photo_url: data.photo_url || ''
    });

    const newTeacher = db.prepare('SELECT * FROM teachers_staff WHERE id = ?').get(result.lastInsertRowid);

    try {
      db.prepare(`
        INSERT INTO audit_logs (user_id, username, action, target_type, target_code, details, ip_address)
        VALUES (?, ?, 'CREATE', 'TEACHER', ?, ?, ?)
      `).run(
        req.user ? req.user.id : null,
        req.user ? req.user.username : 'نظام التقديم الإلكتروني',
        code,
        `تسجيل موظف/مدرس جديد: ${data.quad_name}`,
        req.ip || ''
      );
    } catch (e) {
      console.error('Audit log error:', e);
    }

    res.status(201).json({
      success: true,
      message: 'تم تسجيل بيانات الموظف/المدرس بنجاح، وتم إصدار الرقم الوظيفي الإلكتروني',
      data: newTeacher
    });
  } catch (error) {
    console.error('Create teacher error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء حفظ استمارة الموظف/المدرس' });
  }
};

// Update teacher
exports.update = (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM teachers_staff WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'سجل المدرس/الموظف غير موجود' });
    }

    const data = { ...req.body };
    const normalized_name = data.quad_name ? normalizeArabic(data.quad_name) : existing.normalized_name;

    const stmt = db.prepare(`
      UPDATE teachers_staff SET
        quad_name = @quad_name,
        normalized_name = @normalized_name,
        surname = @surname,
        mother_name = @mother_name,
        dob = @dob,
        gender = @gender,
        nationality = @nationality,
        religion = @religion,
        mother_tongue = @mother_tongue,
        birth_country = @birth_country,
        birth_place = @birth_place,
        province = @province,
        district = @district,
        sub_district = @sub_district,
        blood_type = @blood_type,
        social_status = @social_status,
        id_type = @id_type,
        id_number = @id_number,
        national_id = @national_id,
        record_number = @record_number,
        page_number = @page_number,
        family_number = @family_number,
        id_issuer = @id_issuer,
        issuer_country = @issuer_country,
        id_issue_date = @id_issue_date,
        phone = @phone,
        alt_phone = @alt_phone,
        email = @email,
        city_village = @city_village,
        neighborhood = @neighborhood,
        mahalla = @mahalla,
        zuqaq = @zuqaq,
        house_no = @house_no,
        address_details = @address_details,
        landmark = @landmark,
        housing_type = @housing_type,
        emergency_contact_name = @emergency_contact_name,
        emergency_relationship = @emergency_relationship,
        emergency_phone = @emergency_phone,
        has_special_needs = @has_special_needs,
        special_needs_type = @special_needs_type,
        special_needs_level = @special_needs_level,
        special_needs_details = @special_needs_details,
        special_needs_notes = @special_needs_notes,
        employment_type = @employment_type,
        staff_category = @staff_category,
        employment_status = @employment_status,
        job_title = @job_title,
        job_grade = @job_grade,
        classification = @classification,
        job_official_title = @job_official_title,
        job_position = @job_position,
        school_name = @school_name,
        department = @department,
        subject_taught = @subject_taught,
        stages_taught = @stages_taught,
        first_appointment_date = @first_appointment_date,
        start_date = @start_date,
        job_number = @job_number,
        file_number = @file_number,
        highest_degree = @highest_degree,
        university = @university,
        college_dept = @college_dept,
        specialization = @specialization,
        grad_year = @grad_year,
        degree_name = @degree_name,
        training_courses = @training_courses,
        notes = @notes,
        photo_url = @photo_url,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = @id
    `);

    stmt.run({
      id,
      quad_name: (data.quad_name || existing.quad_name).trim(),
      normalized_name,
      surname: data.surname !== undefined ? data.surname : existing.surname,
      mother_name: data.mother_name !== undefined ? data.mother_name : existing.mother_name,
      dob: data.dob || existing.dob,
      gender: data.gender || existing.gender,
      nationality: data.nationality || existing.nationality,
      religion: data.religion || existing.religion,
      mother_tongue: data.mother_tongue || existing.mother_tongue,
      birth_country: data.birth_country || existing.birth_country,
      birth_place: data.birth_place !== undefined ? data.birth_place : existing.birth_place,
      province: data.province || existing.province,
      district: data.district !== undefined ? data.district : existing.district,
      sub_district: data.sub_district !== undefined ? data.sub_district : existing.sub_district,
      blood_type: data.blood_type !== undefined ? data.blood_type : existing.blood_type,
      social_status: data.social_status || existing.social_status,
      id_type: data.id_type || existing.id_type,
      id_number: data.id_number !== undefined ? data.id_number : existing.id_number,
      national_id: data.national_id !== undefined ? data.national_id : existing.national_id,
      record_number: data.record_number !== undefined ? data.record_number : existing.record_number,
      page_number: data.page_number !== undefined ? data.page_number : existing.page_number,
      family_number: data.family_number !== undefined ? data.family_number : existing.family_number,
      id_issuer: data.id_issuer !== undefined ? data.id_issuer : existing.id_issuer,
      issuer_country: data.issuer_country || existing.issuer_country,
      id_issue_date: data.id_issue_date !== undefined ? data.id_issue_date : existing.id_issue_date,
      phone: data.phone ? cleanPhone(data.phone) : existing.phone,
      alt_phone: data.alt_phone !== undefined ? cleanPhone(data.alt_phone) : existing.alt_phone,
      email: data.email !== undefined ? data.email : existing.email,
      city_village: data.city_village !== undefined ? data.city_village : existing.city_village,
      neighborhood: data.neighborhood !== undefined ? data.neighborhood : existing.neighborhood,
      mahalla: data.mahalla !== undefined ? data.mahalla : existing.mahalla,
      zuqaq: data.zuqaq !== undefined ? data.zuqaq : existing.zuqaq,
      house_no: data.house_no !== undefined ? data.house_no : existing.house_no,
      address_details: data.address_details !== undefined ? data.address_details : existing.address_details,
      landmark: data.landmark !== undefined ? data.landmark : existing.landmark,
      housing_type: data.housing_type || existing.housing_type,
      emergency_contact_name: data.emergency_contact_name !== undefined ? data.emergency_contact_name : existing.emergency_contact_name,
      emergency_relationship: data.emergency_relationship !== undefined ? data.emergency_relationship : existing.emergency_relationship,
      emergency_phone: data.emergency_phone !== undefined ? cleanPhone(data.emergency_phone) : existing.emergency_phone,
      has_special_needs: data.has_special_needs !== undefined ? (data.has_special_needs ? 1 : 0) : existing.has_special_needs,
      special_needs_type: data.special_needs_type !== undefined ? data.special_needs_type : existing.special_needs_type,
      special_needs_level: data.special_needs_level !== undefined ? data.special_needs_level : existing.special_needs_level,
      special_needs_details: data.special_needs_details !== undefined ? data.special_needs_details : existing.special_needs_details,
      special_needs_notes: data.special_needs_notes !== undefined ? data.special_needs_notes : existing.special_needs_notes,
      employment_type: data.employment_type || existing.employment_type,
      staff_category: data.staff_category || existing.staff_category,
      employment_status: data.employment_status || existing.employment_status,
      job_title: data.job_title !== undefined ? data.job_title : existing.job_title,
      job_grade: data.job_grade !== undefined ? data.job_grade : existing.job_grade,
      classification: data.classification || existing.classification,
      job_official_title: data.job_official_title !== undefined ? data.job_official_title : existing.job_official_title,
      job_position: data.job_position || existing.job_position,
      school_name: data.school_name || existing.school_name,
      department: data.department !== undefined ? data.department : existing.department,
      subject_taught: data.subject_taught !== undefined ? data.subject_taught : existing.subject_taught,
      stages_taught: data.stages_taught !== undefined ? data.stages_taught : existing.stages_taught,
      first_appointment_date: data.first_appointment_date !== undefined ? data.first_appointment_date : existing.first_appointment_date,
      start_date: data.start_date !== undefined ? data.start_date : existing.start_date,
      job_number: data.job_number !== undefined ? data.job_number : existing.job_number,
      file_number: data.file_number !== undefined ? data.file_number : existing.file_number,
      highest_degree: data.highest_degree || existing.highest_degree,
      university: data.university !== undefined ? data.university : existing.university,
      college_dept: data.college_dept !== undefined ? data.college_dept : existing.college_dept,
      specialization: data.specialization !== undefined ? data.specialization : existing.specialization,
      grad_year: data.grad_year !== undefined ? data.grad_year : existing.grad_year,
      degree_name: data.degree_name !== undefined ? data.degree_name : existing.degree_name,
      training_courses: data.training_courses !== undefined ? data.training_courses : existing.training_courses,
      notes: data.notes !== undefined ? data.notes : existing.notes,
      photo_url: data.photo_url !== undefined ? data.photo_url : existing.photo_url
    });

    const updated = db.prepare('SELECT * FROM teachers_staff WHERE id = ?').get(id);

    try {
      db.prepare(`
        INSERT INTO audit_logs (user_id, username, action, target_type, target_code, details, ip_address)
        VALUES (?, ?, 'UPDATE', 'TEACHER', ?, ?, ?)
      `).run(
        req.user ? req.user.id : null,
        req.user ? req.user.username : 'إدارة المدرسة',
        existing.code,
        `تحديث بيانات الموظف/المدرس: ${updated.quad_name}`,
        req.ip || ''
      );
    } catch (e) {
      console.error('Audit log error:', e);
    }

    res.json({ success: true, message: 'تم تحديث بيانات المدرس/الموظف بنجاح', data: updated });
  } catch (error) {
    console.error('Update teacher error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء تعديل بيانات الموظف/المدرس' });
  }
};

// Delete teacher/staff
exports.delete = (req, res) => {
  try {
    const { id } = req.params;
    const teacher = db.prepare('SELECT * FROM teachers_staff WHERE id = ?').get(id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'سجل المدرس/الموظف غير موجود' });
    }

    db.prepare('DELETE FROM teachers_staff WHERE id = ?').run(id);

    try {
      db.prepare(`
        INSERT INTO audit_logs (user_id, username, action, target_type, target_code, details, ip_address)
        VALUES (?, ?, 'DELETE', 'TEACHER', ?, ?, ?)
      `).run(
        req.user.id,
        req.user.username,
        teacher.code,
        `حذف سجل المدرس/الموظف: ${teacher.quad_name}`,
        req.ip || ''
      );
    } catch (e) {
      console.error('Audit log error:', e);
    }

    res.json({ success: true, message: 'تم حذف سجل المدرس/الموظف بنجاح' });
  } catch (error) {
    console.error('Delete teacher error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء حذف سجل الموظف/المدرس' });
  }
};
