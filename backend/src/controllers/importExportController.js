const XLSX = require('xlsx');
const db = require('../database/connection');
const { normalizeArabic, validateQuadName, cleanPhone } = require('../utils/arabicUtils');
const { generateRecordCode } = require('../utils/codeGenerator');

// Export to Excel / CSV
exports.exportRecords = (req, res) => {
  try {
    const { type = 'students', format = 'xlsx' } = req.query;

    if (type === 'students') {
      const records = db.prepare('SELECT * FROM students ORDER BY id ASC').all();
      const exportData = records.map(r => ({
        'الرمز التعريفي': r.code,
        'الاسم الرباعي': r.quad_name,
        'اللقب': r.surname || '',
        'اسم الأم': r.mother_name || '',
        'تاريخ التولد': r.dob,
        'الجنس': r.gender,
        'المحافظة': r.province || '',
        'رقم الهاتف': r.phone,
        'هاتف إضافي': r.alt_phone || '',
        'الصف الدراسي': r.grade,
        'الشعبة': r.section,
        'المرحلة': r.study_stage || '',
        'المعدل': r.gpa || '',
        'الحالة': r.student_status,
        'اسم ولي الأمر الرباعي': r.guardian_quad_name,
        'صلة القرابة': r.guardian_relationship,
        'هاتف ولي الأمر': r.guardian_phone,
        'مهنة ولي الأمر': r.guardian_job || '',
        'نوع الوثيقة': r.id_type || '',
        'رقم البطاقة الوطنية': r.national_id || r.id_number || '',
        'العنوان بالتفصيل': r.address_details || '',
        'أقرب نقطة دالة': r.landmark || '',
        'احتياجات خاصة': r.has_special_needs ? 'يوجد' : 'لا يوجد',
        'تاريخ التسجيل': r.created_at
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'الطالبات');

      if (format === 'csv') {
        const csv = XLSX.utils.sheet_to_csv(ws);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="students_almutafawwiqat.csv"');
        return res.send('\uFEFF' + csv); // Include BOM for Excel Arabic compatibility
      } else {
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="students_almutafawwiqat.xlsx"');
        return res.send(buffer);
      }
    } else {
      const records = db.prepare('SELECT * FROM teachers_staff ORDER BY id ASC').all();
      const exportData = records.map(r => ({
        'الرمز التعريفي': r.code,
        'الاسم الرباعي': r.quad_name,
        'اللقب': r.surname || '',
        'اسم الأم': r.mother_name || '',
        'تاريخ التولد': r.dob,
        'الجنس': r.gender,
        'رقم الهاتف': r.phone,
        'المسمى الوظيفي': r.job_title || '',
        'نوع الموظف': r.staff_category || '',
        'نوع التوظيف': r.employment_type || '',
        'الحالة الوظيفية': r.employment_status || '',
        'المادة التي يدرسها': r.subject_taught || '',
        'المراحل': r.stages_taught || '',
        'تاريخ التعيين': r.first_appointment_date || '',
        'الرقم الوظيفي': r.job_number || '',
        'أعلى تحصيل دراسي': r.highest_degree || '',
        'الجامعة/المعهد': r.university || '',
        'الاختصاص': r.specialization || '',
        'سنة التخرج': r.grad_year || '',
        'رقم البطاقة الوطنية': r.national_id || r.id_number || '',
        'العنوان': r.address_details || '',
        'احتياجات خاصة': r.has_special_needs ? 'يوجد' : 'لا يوجد',
        'تاريخ التسجيل': r.created_at
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'الكادر التدريسي والوظيفي');

      if (format === 'csv') {
        const csv = XLSX.utils.sheet_to_csv(ws);
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="teachers_almutafawwiqat.csv"');
        return res.send('\uFEFF' + csv);
      } else {
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="teachers_almutafawwiqat.xlsx"');
        return res.send(buffer);
      }
    }
  } catch (error) {
    console.error('Export records error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء تصدير البيانات' });
  }
};

// Preview uploaded Excel/CSV before importing
exports.previewImport = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'يرجى اختيار ملف Excel أو CSV لرفعه' });
    }

    const { targetType = 'students' } = req.body;
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json(sheet);

    if (!rawRows || rawRows.length === 0) {
      return res.status(400).json({ success: false, message: 'الملف المرفوع فارغ أو لا يحتوي على صفوف صالحة' });
    }

    const processedRows = [];
    let duplicateCount = 0;
    let invalidCount = 0;

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      // Normalize field mapping (handling Arabic column keys or English)
      const quadName = row['الاسم الرباعي'] || row['اسم الطالبة'] || row['اسم المدرس'] || row['quad_name'] || '';
      const dob = row['تاريخ التولد'] || row['تاريخ الميلاد'] || row['dob'] || '';
      const phone = cleanPhone(row['رقم الهاتف'] || row['الهاتف'] || row['phone'] || '');
      const nationalId = row['رقم البطاقة الوطنية'] || row['الرقم الوطني'] || row['national_id'] || '';

      const quadValidation = validateQuadName(quadName);
      const errors = [];
      if (!quadValidation.valid) errors.push(quadValidation.error);
      if (!dob) errors.push('تاريخ التولد غير محدد');

      // Duplicate Check against DB
      let isDuplicate = false;
      let duplicateReason = '';

      if (targetType === 'students') {
        const norm = normalizeArabic(quadName);
        if (norm && dob) {
          const match = db.prepare('SELECT code, quad_name FROM students WHERE normalized_name = ? AND dob = ? LIMIT 1').get(norm, dob);
          if (match) {
            isDuplicate = true;
            duplicateReason = `مطابق لسجل الطالبة (${match.code} - ${match.quad_name})`;
          }
        }
      } else {
        const norm = normalizeArabic(quadName);
        if (norm && dob) {
          const match = db.prepare('SELECT code, quad_name FROM teachers_staff WHERE normalized_name = ? AND dob = ? LIMIT 1').get(norm, dob);
          if (match) {
            isDuplicate = true;
            duplicateReason = `مطابق لسجل (${match.code} - ${match.quad_name})`;
          }
        }
      }

      if (isDuplicate) duplicateCount++;
      if (errors.length > 0) invalidCount++;

      processedRows.push({
        rowIndex: i + 1,
        quad_name: quadName,
        dob: dob.toString(),
        phone,
        national_id: nationalId.toString(),
        grade: row['الصف الدراسي'] || row['الصف'] || row['grade'] || 'الأول متوسط',
        section: row['الشعبة'] || row['section'] || 'أ',
        guardian_quad_name: row['اسم ولي الأمر الرباعي'] || row['ولي الأمر'] || row['guardian_quad_name'] || '',
        guardian_phone: cleanPhone(row['هاتف ولي الأمر'] || row['guardian_phone'] || ''),
        job_title: row['المسمى الوظيفي'] || row['الوظيفة'] || row['job_title'] || '',
        staff_category: row['نوع الموظف'] || row['staff_category'] || 'تدريسي',
        employment_type: row['نوع التوظيف'] || row['employment_type'] || 'ملاك دائم',
        isDuplicate,
        duplicateReason,
        isValid: errors.length === 0,
        errors
      });
    }

    res.json({
      success: true,
      summary: {
        totalRows: processedRows.length,
        validRows: processedRows.length - invalidCount,
        invalidRows: invalidCount,
        duplicateRows: duplicateCount
      },
      rows: processedRows
    });
  } catch (error) {
    console.error('Preview import error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء قراءة ملف الاستيراد' });
  }
};

// Commit imported rows to database
exports.commitImport = (req, res) => {
  try {
    const { rows, targetType = 'students', skipDuplicates = true } = req.body;
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ success: false, message: 'لا توجد بيانات صالحة للاستيراد' });
    }

    let importedCount = 0;
    let skippedCount = 0;

    const runTransaction = db.transaction(() => {
      for (const row of rows) {
        if (!row.isValid) {
          skippedCount++;
          continue;
        }

        if (row.isDuplicate && skipDuplicates) {
          skippedCount++;
          continue;
        }

        const normalized_name = normalizeArabic(row.quad_name);

        if (targetType === 'students') {
          const code = generateRecordCode(db, 'STUDENT');
          db.prepare(`
            INSERT INTO students (
              code, quad_name, normalized_name, dob, phone, grade, section,
              guardian_quad_name, guardian_phone, national_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            code,
            row.quad_name.trim(),
            normalized_name,
            row.dob,
            cleanPhone(row.phone),
            row.grade || 'الأول متوسط',
            row.section || 'أ',
            row.guardian_quad_name || 'ولي أمر الطالبة',
            cleanPhone(row.guardian_phone || row.phone),
            row.national_id || ''
          );
          importedCount++;
        } else {
          const code = generateRecordCode(db, 'TEACHER');
          db.prepare(`
            INSERT INTO teachers_staff (
              code, quad_name, normalized_name, dob, phone, job_title,
              staff_category, employment_type, national_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            code,
            row.quad_name.trim(),
            normalized_name,
            row.dob,
            cleanPhone(row.phone),
            row.job_title || 'مدرس',
            row.staff_category || 'تدريسي',
            row.employment_type || 'ملاك دائم',
            row.national_id || ''
          );
          importedCount++;
        }
      }
    });

    runTransaction();

    res.json({
      success: true,
      message: `تم استيراد ${importedCount} سجل بنجاح${skippedCount > 0 ? ` (تم تجاوز ${skippedCount} سجل غير صالح أو مكرر)` : ''}`,
      importedCount,
      skippedCount
    });
  } catch (error) {
    console.error('Commit import error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء حفظ السجلات المستوردة' });
  }
};
