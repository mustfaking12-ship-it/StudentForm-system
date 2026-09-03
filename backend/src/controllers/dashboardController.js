const db = require('../database/connection');

exports.getStats = (req, res) => {
  try {
    // 1. Total counts
    const totalStudents = db.prepare('SELECT COUNT(*) as count FROM students').get().count;
    const totalTeachers = db.prepare("SELECT COUNT(*) as count FROM teachers_staff WHERE staff_category = 'تدريسي'").get().count;
    const totalStaff = db.prepare("SELECT COUNT(*) as count FROM teachers_staff WHERE staff_category != 'تدريسي'").get().count;
    const totalTeachersStaff = totalTeachers + totalStaff;
    const totalRecords = totalStudents + totalTeachersStaff;

    // 2. Gender distribution
    const studentMales = db.prepare("SELECT COUNT(*) as count FROM students WHERE gender = 'ذكر'").get().count;
    const studentFemales = db.prepare("SELECT COUNT(*) as count FROM students WHERE gender = 'أنثى'").get().count;
    const staffMales = db.prepare("SELECT COUNT(*) as count FROM teachers_staff WHERE gender = 'ذكر'").get().count;
    const staffFemales = db.prepare("SELECT COUNT(*) as count FROM teachers_staff WHERE gender = 'أنثى'").get().count;

    const totalMales = studentMales + staffMales;
    const totalFemales = studentFemales + staffFemales;

    // 3. Students by Grade
    const studentsByGrade = db.prepare(`
      SELECT grade, COUNT(*) as count
      FROM students
      GROUP BY grade
      ORDER BY count DESC
    `).all();

    // 4. Staff by Category
    const staffByCategory = db.prepare(`
      SELECT staff_category, COUNT(*) as count
      FROM teachers_staff
      GROUP BY staff_category
      ORDER BY count DESC
    `).all();

    // 5. Staff by Employment Type
    const staffByEmploymentType = db.prepare(`
      SELECT employment_type, COUNT(*) as count
      FROM teachers_staff
      GROUP BY employment_type
      ORDER BY count DESC
    `).all();

    // 6. Special needs count
    const studentSpecialNeeds = db.prepare('SELECT COUNT(*) as count FROM students WHERE has_special_needs = 1').get().count;
    const staffSpecialNeeds = db.prepare('SELECT COUNT(*) as count FROM teachers_staff WHERE has_special_needs = 1').get().count;

    // 7. Recent registrations
    const recentStudents = db.prepare(`
      SELECT id, code, quad_name, grade, section, phone, created_at, 'student' as type
      FROM students
      ORDER BY id DESC LIMIT 5
    `).all();

    const recentStaff = db.prepare(`
      SELECT id, code, quad_name, job_title, staff_category, phone, created_at, 'teacher' as type
      FROM teachers_staff
      ORDER BY id DESC LIMIT 5
    `).all();

    res.json({
      success: true,
      stats: {
        totalRecords,
        totalStudents,
        totalTeachers,
        totalStaff,
        totalTeachersStaff,
        totalMales,
        totalFemales,
        genderBreakdown: {
          students: { male: studentMales, female: studentFemales },
          staff: { male: staffMales, female: staffFemales }
        },
        specialNeeds: {
          students: studentSpecialNeeds,
          staff: staffSpecialNeeds,
          total: studentSpecialNeeds + staffSpecialNeeds
        },
        studentsByGrade,
        staffByCategory,
        staffByEmploymentType,
        recentStudents,
        recentStaff
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء جلب إحصائيات لوحة التحكم' });
  }
};
