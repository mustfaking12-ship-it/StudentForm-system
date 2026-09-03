const db = require('../database/connection');
const { normalizeArabic, cleanPhone } = require('../utils/arabicUtils');
const { generateRecordCode } = require('../utils/codeGenerator');

// Check duplicate student
exports.checkDuplicate = (req, res) => {
  try {
    const { quad_name, dob, national_id, phone, currentId } = req.body;
    const normalized = normalizeArabic(quad_name);
    const cleanedPhone = cleanPhone(phone);

    let match = null;

    // 1. Check by National ID / Document ID if present
    if (national_id && national_id.trim().length > 3) {
      match = db.prepare(`
        SELECT id, code, quad_name, dob, phone, grade, 'رقم البطاقة الوطنية / الوثيقة' as match_reason
        FROM students
        WHERE (national_id = ? OR id_number = ?)
        ${currentId ? 'AND id != ?' : ''}
        LIMIT 1
      `).get(national_id.trim(), national_id.trim(), ...(currentId ? [currentId] : []));
    }

    // 2. Check by Normalized Quad Name + DOB
    if (!match && normalized && dob) {
      match = db.prepare(`
        SELECT id, code, quad_name, dob, phone, grade, 'الاسم الرباعي وتاريخ الميلاد' as match_reason
        FROM students
        WHERE normalized_name = ? AND dob = ?
        ${currentId ? 'AND id != ?' : ''}
        LIMIT 1
      `).get(normalized, dob, ...(currentId ? [currentId] : []));
    }

    // 3. Check by Phone + Normalized Name (fuzzy)
    if (!match && normalized && cleanedPhone && cleanedPhone.length >= 10) {
      match = db.prepare(`
        SELECT id, code, quad_name, dob, phone, grade, 'الاسم ورقم الهاتف' as match_reason
        FROM students
        WHERE normalized_name = ? AND phone = ?
        ${currentId ? 'AND id != ?' : ''}
        LIMIT 1
      `).get(normalized, cleanedPhone, ...(currentId ? [currentId] : []));
    }

    if (match) {
      return res.json({
        isDuplicate: true,
        message: `قد يكون هذا الشخص مسجلاً مسبقاً بناءً على تطابق (${match.match_reason})`,
        matchedRecord: match
      });
    }

    return res.json({ isDuplicate: false });
  } catch (error) {
    console.error('Check duplicate student error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء فحص التكرار' });
  }
};

// Get all students with search, filters, and pagination
exports.getAll = (req, res) => {
  try {
    const {
      search,
      grade,
      section,
      study_stage,
      student_status,
      gender,
      page = 1,
      limit = 15,
      sortBy = 'id',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const conditions = [];
    const params = [];

    // Smart Search
    if (search && search.trim()) {
      const normSearch = normalizeArabic(search);
      const cleanSearch = search.trim();
      conditions.push(`(
        normalized_name LIKE ? OR
        code LIKE ? OR
        phone LIKE ? OR
        national_id LIKE ? OR
        id_number LIKE ?
      )`);
      params.push(
        `%${normSearch}%`,
        `%${cleanSearch}%`,
        `%${cleanSearch}%`,
        `%${cleanSearch}%`,
        `%${cleanSearch}%`
      );
    }

    if (grade) {
      conditions.push('grade = ?');
      params.push(grade);
    }
    if (section) {
      conditions.push('section = ?');
      params.push(section);
    }
    if (study_stage) {
      conditions.push('study_stage = ?');
      params.push(study_stage);
    }
    if (student_status) {
      conditions.push('student_status = ?');
      params.push(student_status);
    }
    if (gender) {
      conditions.push('gender = ?');
      params.push(gender);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const safeSortBy = ['id', 'code', 'quad_name', 'grade', 'gpa', 'created_at'].includes(sortBy) ? sortBy : 'id';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const countQuery = `SELECT COUNT(*) as total FROM students ${whereClause}`;
    const total = db.prepare(countQuery).get(...params).total;

    const dataQuery = `
      SELECT * FROM students
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT ? OFFSET ?
    `;
    const students = db.prepare(dataQuery).all(...params, parseInt(limit, 10), offset);

    res.json({
      success: true,
      data: students,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / parseInt(limit, 10))
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء جلب سجلات الطالبات' });
  }
};

// Get single student by ID or Code
exports.getById = (req, res) => {
  try {
    const { id } = req.params;
    const isCode = isNaN(id);
    const query = isCode
      ? 'SELECT * FROM students WHERE code = ?'
      : 'SELECT * FROM students WHERE id = ?';

    const student = db.prepare(query).get(id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'سجل الطالبة غير موجود' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    console.error('Get student by id error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء جلب بيانات الطالبة' });
  }
};

// Create new student record (Public or Admin)
exports.create = (req, res) => {
  try {
    const data = { ...req.body };
    const code = generateRecordCode(db, 'STUDENT');
    const normalized_name = normalizeArabic(data.quad_name);

    const stmt = db.prepare(`
      INSERT INTO students (
        code, quad_name, normalized_name, surname, mother_name, dob, gender, nationality, religion, mother_tongue,
        birth_country, birth_place, province, district, sub_district, blood_type,
        id_type, id_number, national_id, record_number, page_number, family_number, id_issuer, issuer_country, id_issue_date,
        phone, alt_phone, email, city_village, neighborhood, mahalla, zuqaq, house_no, address_details, landmark, housing_type, residence_notes,
        emergency_contact_name, emergency_relationship, emergency_phone,
        has_special_needs, special_needs_type, special_needs_level, special_needs_details, special_needs_notes,
        grade, section, study_stage, study_type, admission_year, enrollment_year, previous_school, gpa, student_status,
        student_school_id, file_number, academic_notes,
        guardian_quad_name, guardian_relationship, guardian_phone, guardian_job, guardian_workplace, guardian_address, guardian_email,
        photo_url
      ) VALUES (
        @code, @quad_name, @normalized_name, @surname, @mother_name, @dob, @gender, @nationality, @religion, @mother_tongue,
        @birth_country, @birth_place, @province, @district, @sub_district, @blood_type,
        @id_type, @id_number, @national_id, @record_number, @page_number, @family_number, @id_issuer, @issuer_country, @id_issue_date,
        @phone, @alt_phone, @email, @city_village, @neighborhood, @mahalla, @zuqaq, @house_no, @address_details, @landmark, @housing_type, @residence_notes,
        @emergency_contact_name, @emergency_relationship, @emergency_phone,
        @has_special_needs, @special_needs_type, @special_needs_level, @special_needs_details, @special_needs_notes,
        @grade, @section, @study_stage, @study_type, @admission_year, @enrollment_year, @previous_school, @gpa, @student_status,
        @student_school_id, @file_number, @academic_notes,
        @guardian_quad_name, @guardian_relationship, @guardian_phone, @guardian_job, @guardian_workplace, @guardian_address, @guardian_email,
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
      nationality: data.nationality || 'عراقية',
      religion: data.religion || 'مسلم',
      mother_tongue: data.mother_tongue || 'العربية',
      birth_country: data.birth_country || 'العراق',
      birth_place: data.birth_place || '',
      province: data.province || 'بغداد',
      district: data.district || '',
      sub_district: data.sub_district || '',
      blood_type: data.blood_type || '',
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
      residence_notes: data.residence_notes || '',
      emergency_contact_name: data.emergency_contact_name || '',
      emergency_relationship: data.emergency_relationship || '',
      emergency_phone: cleanPhone(data.emergency_phone),
      has_special_needs: data.has_special_needs ? 1 : 0,
      special_needs_type: data.special_needs_type || '',
      special_needs_level: data.special_needs_level || '',
      special_needs_details: data.special_needs_details || '',
      special_needs_notes: data.special_needs_notes || '',
      grade: data.grade,
      section: data.section,
      study_stage: data.study_stage || 'المتوسطة',
      study_type: data.study_type || 'صباحي',
      admission_year: data.admission_year || '',
      enrollment_year: data.enrollment_year || '',
      previous_school: data.previous_school || '',
      gpa: data.gpa ? parseFloat(data.gpa) : null,
      student_status: data.student_status || 'مستمرة',
      student_school_id: data.student_school_id || '',
      file_number: data.file_number || '',
      academic_notes: data.academic_notes || '',
      guardian_quad_name: data.guardian_quad_name.trim(),
      guardian_relationship: data.guardian_relationship || 'الأب',
      guardian_phone: cleanPhone(data.guardian_phone),
      guardian_job: data.guardian_job || '',
      guardian_workplace: data.guardian_workplace || '',
      guardian_address: data.guardian_address || '',
      guardian_email: data.guardian_email || '',
      photo_url: data.photo_url || ''
    });

    const newStudent = db.prepare('SELECT * FROM students WHERE id = ?').get(result.lastInsertRowid);

    // Audit log
    try {
      db.prepare(`
        INSERT INTO audit_logs (user_id, username, action, target_type, target_code, details, ip_address)
        VALUES (?, ?, 'CREATE', 'STUDENT', ?, ?, ?)
      `).run(
        req.user ? req.user.id : null,
        req.user ? req.user.username : 'نظام التقديم الإلكتروني',
        code,
        `تسجيل طالبة جديدة: ${data.quad_name}`,
        req.ip || ''
      );
    } catch (e) {
      console.error('Audit log error:', e);
    }

    res.status(201).json({
      success: true,
      message: 'تم تسجيل بيانات الطالبة بنجاح، وتم إصدار الرقم الإلكتروني',
      data: newStudent
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء حفظ استمارة الطالبة' });
  }
};

// Update student
exports.update = (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'سجل الطالبة غير موجود' });
    }

    const data = { ...req.body };
    const normalized_name = data.quad_name ? normalizeArabic(data.quad_name) : existing.normalized_name;

    const stmt = db.prepare(`
      UPDATE students SET
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
        residence_notes = @residence_notes,
        emergency_contact_name = @emergency_contact_name,
        emergency_relationship = @emergency_relationship,
        emergency_phone = @emergency_phone,
        has_special_needs = @has_special_needs,
        special_needs_type = @special_needs_type,
        special_needs_level = @special_needs_level,
        special_needs_details = @special_needs_details,
        special_needs_notes = @special_needs_notes,
        grade = @grade,
        section = @section,
        study_stage = @study_stage,
        study_type = @study_type,
        admission_year = @admission_year,
        enrollment_year = @enrollment_year,
        previous_school = @previous_school,
        gpa = @gpa,
        student_status = @student_status,
        student_school_id = @student_school_id,
        file_number = @file_number,
        academic_notes = @academic_notes,
        guardian_quad_name = @guardian_quad_name,
        guardian_relationship = @guardian_relationship,
        guardian_phone = @guardian_phone,
        guardian_job = @guardian_job,
        guardian_workplace = @guardian_workplace,
        guardian_address = @guardian_address,
        guardian_email = @guardian_email,
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
      residence_notes: data.residence_notes !== undefined ? data.residence_notes : existing.residence_notes,
      emergency_contact_name: data.emergency_contact_name !== undefined ? data.emergency_contact_name : existing.emergency_contact_name,
      emergency_relationship: data.emergency_relationship !== undefined ? data.emergency_relationship : existing.emergency_relationship,
      emergency_phone: data.emergency_phone !== undefined ? cleanPhone(data.emergency_phone) : existing.emergency_phone,
      has_special_needs: data.has_special_needs !== undefined ? (data.has_special_needs ? 1 : 0) : existing.has_special_needs,
      special_needs_type: data.special_needs_type !== undefined ? data.special_needs_type : existing.special_needs_type,
      special_needs_level: data.special_needs_level !== undefined ? data.special_needs_level : existing.special_needs_level,
      special_needs_details: data.special_needs_details !== undefined ? data.special_needs_details : existing.special_needs_details,
      special_needs_notes: data.special_needs_notes !== undefined ? data.special_needs_notes : existing.special_needs_notes,
      grade: data.grade || existing.grade,
      section: data.section || existing.section,
      study_stage: data.study_stage || existing.study_stage,
      study_type: data.study_type || existing.study_type,
      admission_year: data.admission_year !== undefined ? data.admission_year : existing.admission_year,
      enrollment_year: data.enrollment_year !== undefined ? data.enrollment_year : existing.enrollment_year,
      previous_school: data.previous_school !== undefined ? data.previous_school : existing.previous_school,
      gpa: data.gpa !== undefined ? (data.gpa ? parseFloat(data.gpa) : null) : existing.gpa,
      student_status: data.student_status || existing.student_status,
      student_school_id: data.student_school_id !== undefined ? data.student_school_id : existing.student_school_id,
      file_number: data.file_number !== undefined ? data.file_number : existing.file_number,
      academic_notes: data.academic_notes !== undefined ? data.academic_notes : existing.academic_notes,
      guardian_quad_name: (data.guardian_quad_name || existing.guardian_quad_name).trim(),
      guardian_relationship: data.guardian_relationship || existing.guardian_relationship,
      guardian_phone: data.guardian_phone ? cleanPhone(data.guardian_phone) : existing.guardian_phone,
      guardian_job: data.guardian_job !== undefined ? data.guardian_job : existing.guardian_job,
      guardian_workplace: data.guardian_workplace !== undefined ? data.guardian_workplace : existing.guardian_workplace,
      guardian_address: data.guardian_address !== undefined ? data.guardian_address : existing.guardian_address,
      guardian_email: data.guardian_email !== undefined ? data.guardian_email : existing.guardian_email,
      photo_url: data.photo_url !== undefined ? data.photo_url : existing.photo_url
    });

    const updated = db.prepare('SELECT * FROM students WHERE id = ?').get(id);

    try {
      db.prepare(`
        INSERT INTO audit_logs (user_id, username, action, target_type, target_code, details, ip_address)
        VALUES (?, ?, 'UPDATE', 'STUDENT', ?, ?, ?)
      `).run(
        req.user ? req.user.id : null,
        req.user ? req.user.username : 'إدارة المدرسة',
        existing.code,
        `تحديث بيانات الطالبة: ${updated.quad_name}`,
        req.ip || ''
      );
    } catch (e) {
      console.error('Audit log error:', e);
    }

    res.json({ success: true, message: 'تم تحديث بيانات الطالبة بنجاح', data: updated });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء تعديل بيانات الطالبة' });
  }
};

// Delete student
exports.delete = (req, res) => {
  try {
    const { id } = req.params;
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'سجل الطالبة غير موجود' });
    }

    db.prepare('DELETE FROM students WHERE id = ?').run(id);

    try {
      db.prepare(`
        INSERT INTO audit_logs (user_id, username, action, target_type, target_code, details, ip_address)
        VALUES (?, ?, 'DELETE', 'STUDENT', ?, ?, ?)
      `).run(
        req.user.id,
        req.user.username,
        student.code,
        `حذف سجل الطالبة: ${student.quad_name}`,
        req.ip || ''
      );
    } catch (e) {
      console.error('Audit log error:', e);
    }

    res.json({ success: true, message: 'تم حذف سجل الطالبة بنجاح' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء حذف سجل الطالبة' });
  }
};
