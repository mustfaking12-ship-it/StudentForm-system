const { validateQuadName, cleanPhone } = require('../utils/arabicUtils');

function validateStudentInput(req, res, next) {
  const errors = {};
  const {
    quad_name,
    dob,
    grade,
    section,
    phone,
    guardian_quad_name,
    guardian_phone
  } = req.body;

  // 1. Validate Student Quad Name
  const quadCheck = validateQuadName(quad_name);
  if (!quadCheck.valid) {
    errors.quad_name = quadCheck.error;
  }

  // 2. DOB
  if (!dob) {
    errors.dob = 'يرجى إدخال تاريخ التولد';
  }

  // 3. Grade & Section
  if (!grade) {
    errors.grade = 'يرجى اختيار الصف الدراسي';
  }
  if (!section) {
    errors.section = 'يرجى تحديد الشعبة';
  }

  // 4. Student / Family Phone
  if (!phone || cleanPhone(phone).length < 10) {
    errors.phone = 'يرجى إدخال رقم هاتف صحيح (10 أرقام على الأقل)';
  }

  // 5. Guardian Quad Name
  const guardianCheck = validateQuadName(guardian_quad_name);
  if (!guardianCheck.valid) {
    errors.guardian_quad_name = `اسم ولي الأمر: ${guardianCheck.error}`;
  }

  // 6. Guardian Phone
  if (!guardian_phone || cleanPhone(guardian_phone).length < 10) {
    errors.guardian_phone = 'يرجى إدخال رقم هاتف ولي الأمر بشكل صحيح';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'توجد أخطاء في المدخلات، يرجى مراجعة الحقول المشار إليها',
      errors
    });
  }

  next();
}

function validateTeacherInput(req, res, next) {
  const errors = {};
  const {
    quad_name,
    dob,
    phone,
    employment_type,
    staff_category
  } = req.body;

  // 1. Teacher Quad Name
  const quadCheck = validateQuadName(quad_name);
  if (!quadCheck.valid) {
    errors.quad_name = quadCheck.error;
  }

  // 2. DOB
  if (!dob) {
    errors.dob = 'يرجى إدخال تاريخ التولد';
  }

  // 3. Phone
  if (!phone || cleanPhone(phone).length < 10) {
    errors.phone = 'يرجى إدخال رقم هاتف صحيح (10 أرقام على الأقل)';
  }

  // 4. Employment type & Staff category
  if (!employment_type) {
    errors.employment_type = 'يرجى تحديد نوع التوظيف (ملاك دائم، عقد...)';
  }
  if (!staff_category) {
    errors.staff_category = 'يرجى تحديد نوع الموظف (تدريسي، إداري...)';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'توجد أخطاء في المدخلات، يرجى مراجعة الحقول المشار إليها',
      errors
    });
  }

  next();
}

module.exports = {
  validateStudentInput,
  validateTeacherInput
};
