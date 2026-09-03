-- Iraqi School Information Management System Schema
-- مدرسة المتفوقات الأولى للبنات - نظام إدارة استمارات الطالبات والملاكات التدريسية والإدارية

PRAGMA foreign_keys = ON;

-- جدول الطالبات
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL, -- STU-000001
  quad_name TEXT NOT NULL, -- الاسم الرباعي كاملاً في حقل واحد
  normalized_name TEXT, -- الاسم المطبع للبحث الذكي
  surname TEXT, -- اللقب
  mother_name TEXT, -- اسم الأم
  dob TEXT NOT NULL, -- تاريخ التولد (YYYY-MM-DD)
  gender TEXT DEFAULT 'أنثى', -- الجنس
  nationality TEXT DEFAULT 'عراقية', -- الجنسية
  religion TEXT DEFAULT 'مسلم', -- الديانة
  mother_tongue TEXT DEFAULT 'العربية', -- اللغة الأم
  birth_country TEXT DEFAULT 'العراق', -- دولة التولد
  birth_place TEXT, -- مسقط الرأس / مكان الولادة
  province TEXT DEFAULT 'بغداد', -- المحافظة
  district TEXT, -- القضاء
  sub_district TEXT, -- الناحية
  blood_type TEXT, -- فئة الدم

  -- الوثائق والهوية
  id_type TEXT DEFAULT 'بطاقة وطنية موحدة', -- نوع الوثيقة
  id_number TEXT, -- رقم الوثيقة / رقم الموحدة
  national_id TEXT, -- الرقم الوطني
  record_number TEXT, -- رقم السجل
  page_number TEXT, -- رقم الصحيفة
  family_number TEXT, -- الرقم العائلي
  id_issuer TEXT, -- جهة الإصدار
  issuer_country TEXT DEFAULT 'العراق', -- بلد الإصدار
  id_issue_date TEXT, -- تاريخ الإصدار

  -- السكن والاتصال
  phone TEXT NOT NULL, -- رقم الهاتف
  alt_phone TEXT, -- هاتف إضافي
  email TEXT, -- البريد الإلكتروني
  city_village TEXT, -- المدينة / القرية
  neighborhood TEXT, -- الحي
  mahalla TEXT, -- المحلة
  zuqaq TEXT, -- الزقاق
  house_no TEXT, -- الدار
  address_details TEXT, -- العنوان بالتفصيل
  landmark TEXT, -- أقرب نقطة دالة
  housing_type TEXT DEFAULT 'ملك', -- نوع السكن (ملك / إيجار / أخرى)
  residence_notes TEXT, -- ملاحظات السكن

  -- الطوارئ
  emergency_contact_name TEXT, -- اسم جهة الاتصال للطوارئ
  emergency_relationship TEXT, -- صلة القرابة
  emergency_phone TEXT, -- هاتف الطوارئ

  -- الاحتياجات الخاصة
  has_special_needs INTEGER DEFAULT 0, -- 0: لا يوجد, 1: يوجد
  special_needs_type TEXT, -- نوع الاحتياج
  special_needs_level TEXT, -- درجة الاحتياج
  special_needs_details TEXT, -- التفاصيل
  special_needs_notes TEXT, -- ملاحظات

  -- المعلومات الدراسية للطالبة
  grade TEXT NOT NULL, -- الصف الدراسي (الأول متوسط، الثاني متوسط...)
  section TEXT NOT NULL, -- الشعبة (أ، ب، ج...)
  study_stage TEXT DEFAULT 'المتوسطة', -- المرحلة الدراسية (المتوسطة / الإعدادية)
  study_type TEXT DEFAULT 'صباحي', -- نوع الدراسة
  admission_year TEXT, -- سنة القبول
  enrollment_year TEXT, -- سنة الالتحاق
  previous_school TEXT, -- المدرسة السابقة
  gpa REAL, -- المعدل الدراسي
  student_status TEXT DEFAULT 'مستمرة', -- الحالة: مستمرة، منقولة، متخرجة، مفصولة، متوقفة، أخرى
  student_school_id TEXT, -- الرقم المدرسي
  file_number TEXT, -- رقم الملف
  academic_notes TEXT, -- ملاحظات دراسية

  -- معلومات ولي الأمر (حقل الاسم الرباعي موحد أيضاً!)
  guardian_quad_name TEXT NOT NULL, -- الاسم الرباعي لولي الأمر
  guardian_relationship TEXT DEFAULT 'الأب', -- صلة القرابة
  guardian_phone TEXT NOT NULL, -- هاتف ولي الأمر
  guardian_job TEXT, -- مهنة ولي الأمر
  guardian_workplace TEXT, -- مكان العمل
  guardian_address TEXT, -- عنوان ولي الأمر
  guardian_email TEXT, -- البريد الإلكتروني

  -- الصورة الشخصية والمرفقات
  photo_url TEXT, -- مسار الصورة الشخصية

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- جدول المدرسين والموظفين
CREATE TABLE IF NOT EXISTS teachers_staff (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL, -- TEA-000001
  quad_name TEXT NOT NULL, -- الاسم الرباعي كاملاً في حقل واحد
  normalized_name TEXT, -- الاسم المطبع للبحث الذكي
  surname TEXT, -- اللقب
  mother_name TEXT, -- اسم الأم
  dob TEXT NOT NULL, -- تاريخ التولد (YYYY-MM-DD)
  gender TEXT DEFAULT 'أنثى', -- الجنس
  nationality TEXT DEFAULT 'عراقي', -- الجنسية
  religion TEXT DEFAULT 'مسلم', -- الديانة
  mother_tongue TEXT DEFAULT 'العربية', -- اللغة الأم
  birth_country TEXT DEFAULT 'العراق', -- دولة التولد
  birth_place TEXT, -- مسقط الرأس / مكان الولادة
  province TEXT DEFAULT 'بغداد', -- المحافظة
  district TEXT, -- القضاء
  sub_district TEXT, -- الناحية
  blood_type TEXT, -- فئة الدم
  social_status TEXT DEFAULT 'متزوج/ة', -- الحالة الاجتماعية: أعزب/ة، متزوج/ة، أرمل/ة، مطلق/ة

  -- الوثائق والهوية
  id_type TEXT DEFAULT 'بطاقة وطنية موحدة', -- نوع الوثيقة
  id_number TEXT, -- رقم الوثيقة / الموحدة
  national_id TEXT, -- الرقم الوطني
  record_number TEXT, -- رقم السجل
  page_number TEXT, -- رقم الصحيفة
  family_number TEXT, -- الرقم العائلي
  id_issuer TEXT, -- جهة الإصدار
  issuer_country TEXT DEFAULT 'العراق', -- بلد الإصدار
  id_issue_date TEXT, -- تاريخ الإصدار

  -- السكن والاتصال
  phone TEXT NOT NULL, -- رقم الهاتف
  alt_phone TEXT, -- هاتف إضافي
  email TEXT, -- البريد الإلكتروني
  city_village TEXT, -- المدينة / القرية
  neighborhood TEXT, -- الحي
  mahalla TEXT, -- المحلة
  zuqaq TEXT, -- الزقاق
  house_no TEXT, -- الدار / عنوان 1
  address_details TEXT, -- العنوان بالتفصيل
  landmark TEXT, -- أقرب نقطة دالة
  housing_type TEXT DEFAULT 'ملك', -- نوع السكن

  -- الطوارئ
  emergency_contact_name TEXT, -- جهة الاتصال للطوارئ
  emergency_relationship TEXT, -- صلة جهة الاتصال
  emergency_phone TEXT, -- رقم هاتف الطوارئ

  -- الاحتياجات الخاصة
  has_special_needs INTEGER DEFAULT 0,
  special_needs_type TEXT,
  special_needs_level TEXT,
  special_needs_details TEXT,
  special_needs_notes TEXT,

  -- المعلومات الوظيفية والمهنية (مطابقة لاستمارة EMIS)
  employment_type TEXT DEFAULT 'ملاك دائم', -- نوع التوظيف: ملاك دائم، عقد، محاضر، أجير، أخرى
  staff_category TEXT DEFAULT 'تدريسي', -- نوع الموظف: تدريسي، إداري، فني، خدمي، أخرى
  employment_status TEXT DEFAULT 'مستمر', -- الحالة الوظيفية: مستمر، متقاعد، مفصول، متوفي، إجازة دراسية/أمومة
  job_title TEXT, -- المسمى الوظيفي
  job_grade TEXT, -- الدرجة الوظيفية
  classification TEXT DEFAULT 'معلم', -- التصنيف: موظف / معلم / مدرس
  job_official_title TEXT, -- العنوان الوظيفي
  job_position TEXT DEFAULT 'مدرس', -- المنصب الحالي: مدير، معاون، مدرس، إداري، مشرف
  school_name TEXT DEFAULT 'مدرسة المتفوقات الأولى للبنات', -- اسم المدرسة
  department TEXT, -- القسم / الشعبة
  subject_taught TEXT, -- المادة التي يدرسها / الاختصاص
  stages_taught TEXT, -- المراحل التي يدرسها
  first_appointment_date TEXT, -- تاريخ أول تعيين
  start_date TEXT, -- تاريخ المباشرة بالمدرسة
  job_number TEXT, -- الرقم الوظيفي
  file_number TEXT, -- رقم الملف الوظيفي

  -- التحصيل الدراسي للمدرس / الموظف
  highest_degree TEXT DEFAULT 'بكالوريوس', -- أعلى تحصيل: دكتوراه، ماجستير، بكالوريوس، دبلوم، إعدادية
  university TEXT, -- اسم الجامعة / الكلية / المعهد
  college_dept TEXT, -- اسم القسم
  specialization TEXT, -- الاختصاص الدقيق
  grad_year TEXT, -- سنة التخرج
  degree_name TEXT, -- اسم الشهادة
  training_courses TEXT, -- الدورات التدريبية
  notes TEXT, -- ملاحظات

  -- الصورة الشخصية
  photo_url TEXT,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- جدول المستخدمين المصرح لهم (Admin / Staff)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'ADMIN', -- ADMIN, STAFF, TEACHER
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- سجل العمليات (Audit Logs)
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  username TEXT,
  action TEXT NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, EXPORT, IMPORT
  target_type TEXT, -- STUDENT, TEACHER, SYSTEM
  target_code TEXT,
  details TEXT,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء فهارس لتحسين سرعة البحث
CREATE INDEX IF NOT EXISTS idx_students_normalized_name ON students(normalized_name);
CREATE INDEX IF NOT EXISTS idx_students_code ON students(code);
CREATE INDEX IF NOT EXISTS idx_students_phone ON students(phone);
CREATE INDEX IF NOT EXISTS idx_students_national_id ON students(national_id);
CREATE INDEX IF NOT EXISTS idx_students_grade ON students(grade);

CREATE INDEX IF NOT EXISTS idx_teachers_normalized_name ON teachers_staff(normalized_name);
CREATE INDEX IF NOT EXISTS idx_teachers_code ON teachers_staff(code);
CREATE INDEX IF NOT EXISTS idx_teachers_phone ON teachers_staff(phone);
CREATE INDEX IF NOT EXISTS idx_teachers_staff_category ON teachers_staff(staff_category);
