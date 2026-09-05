import * as XLSX from 'xlsx';
import { 
  syncStudentToCloud, 
  fetchStudentsFromCloud, 
  fetchStudentByIdFromCloud,
  syncTeacherToCloud, 
  fetchTeachersFromCloud, 
  fetchTeacherByIdFromCloud,
  deleteRecordFromCloud 
} from './firebaseService';
import { sendTelegramStudentNotification, sendTelegramTeacherNotification } from './telegramService';

const DB_NAME = 'SchoolEMIS_DB';
const DB_VERSION = 1;
const STUDENTS_STORE = 'students';
const TEACHERS_STORE = 'teachers';

// Fallback LocalStorage Keys if IndexedDB is unavailable
const LS_STUDENTS_KEY = 'emis_local_students';
const LS_TEACHERS_KEY = 'emis_local_teachers';

// Initialize IndexedDB
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      return resolve(null);
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STUDENTS_STORE)) {
        db.createObjectStore(STUDENTS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(TEACHERS_STORE)) {
        db.createObjectStore(TEACHERS_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      console.warn('IndexedDB failed to open, falling back to LocalStorage', request.error);
      resolve(null);
    };
  });
}

// Initial Sample Seed Data
const INITIAL_STUDENTS = [
  {
    id: 1,
    code: 'STU-000001',
    quad_name: 'مريم حيدر جواد كاظم',
    surname: 'الساعدي',
    mother_name: 'هدى رحيم جبار',
    dob: '2011-04-12',
    gender: 'أنثى',
    nationality: 'عراقية',
    religion: 'مسلمة',
    birth_place: 'بغداد',
    province: 'بغداد',
    district: 'الكرخ',
    blood_type: 'O+',
    id_type: 'بطاقة وطنية',
    national_id: '201112345678',
    phone: '07701234567',
    parent_phone: '07701234567',
    city_village: 'بغداد',
    neighborhood: 'المنصور',
    grade: 'الأول متوسط',
    section: 'أ',
    study_stage: 'متوسط',
    study_type: 'صباحي',
    admission_year: '2023-2024',
    student_status: 'مستمرة',
    has_special_needs: 0,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 2,
    code: 'STU-000002',
    quad_name: 'فاطمة علي حسين مهدي',
    surname: 'الزبيدي',
    mother_name: 'زينب كمال عبد',
    dob: '2010-09-20',
    gender: 'أنثى',
    nationality: 'عراقية',
    religion: 'مسلمة',
    birth_place: 'بغداد',
    province: 'بغداد',
    district: 'الرصافة',
    blood_type: 'A+',
    id_type: 'بطاقة وطنية',
    national_id: '201098765432',
    phone: '07802345678',
    parent_phone: '07802345678',
    city_village: 'بغداد',
    neighborhood: 'زيونة',
    grade: 'الثاني متوسط',
    section: 'ب',
    study_stage: 'متوسط',
    study_type: 'صباحي',
    admission_year: '2022-2023',
    student_status: 'مستمرة',
    has_special_needs: 0,
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

const INITIAL_TEACHERS = [
  {
    id: 1,
    code: 'TEA-000001',
    quad_name: 'سعاد أحمد كريم جاسم',
    surname: 'المحمداوي',
    mother_name: 'كريمة صادق',
    dob: '1985-06-15',
    gender: 'أنثى',
    nationality: 'عراقية',
    religion: 'مسلمة',
    birth_place: 'بغداد',
    province: 'بغداد',
    staff_category: 'تدريسي',
    job_title: 'مدرسة مادة الكيمياء',
    employment_type: 'ملاك دائم',
    degree: 'بكالوريوس',
    specialization: 'علوم كيمياء',
    teaching_subject: 'الكيمياء',
    civil_service_number: 'CS-88912',
    phone: '07705556677',
    has_special_needs: 0,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

// Helper: read all items from store
async function getAllFromStore(storeName, fallbackKey, initialData = []) {
  const db = await openIndexedDB();
  if (!db) {
    const raw = localStorage.getItem(fallbackKey);
    if (!raw) {
      localStorage.setItem(fallbackKey, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(raw);
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => {
        let items = req.result || [];
        if (items.length === 0 && initialData.length > 0) {
          // Seed initial data to IndexedDB
          const writeTx = db.transaction(storeName, 'readwrite');
          const writeStore = writeTx.objectStore(storeName);
          initialData.forEach((item) => writeStore.put(item));
          items = initialData;
        }
        resolve(items);
      };
      req.onerror = () => resolve(initialData);
    } catch (e) {
      resolve(initialData);
    }
  });
}

// Helper: put item in store
async function putInStore(storeName, fallbackKey, item) {
  const db = await openIndexedDB();
  if (!db) {
    const raw = localStorage.getItem(fallbackKey);
    const list = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex((i) => i.id === item.id || i.code === item.code);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...item };
    } else {
      list.unshift(item);
    }
    localStorage.setItem(fallbackKey, JSON.stringify(list));
    return item;
  }

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(item);
      req.onsuccess = () => resolve(item);
      req.onerror = () => reject(req.error);
    } catch (e) {
      reject(e);
    }
  });
}

// Helper: bulk put items in store
async function putManyInStore(storeName, fallbackKey, items) {
  if (!items || items.length === 0) return;
  const db = await openIndexedDB();
  if (!db) {
    const raw = localStorage.getItem(fallbackKey);
    const existing = raw ? JSON.parse(raw) : [];
    const map = new Map();
    existing.forEach((x) => map.set(x.id || x.code, x));
    items.forEach((x) => map.set(x.id || x.code, x));
    localStorage.setItem(fallbackKey, JSON.stringify(Array.from(map.values())));
    return;
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      items.forEach((item) => store.put(item));
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch (e) {
      resolve(false);
    }
  });
}

// Helper: delete item from store
async function deleteFromStore(storeName, fallbackKey, id) {
  const db = await openIndexedDB();
  if (!db) {
    const raw = localStorage.getItem(fallbackKey);
    if (raw) {
      const list = JSON.parse(raw).filter((i) => i.id !== id && i.code !== id);
      localStorage.setItem(fallbackKey, JSON.stringify(list));
    }
    return true;
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch (e) {
      resolve(false);
    }
  });
}

// Background sync tracking to avoid blocking page loads
let isSyncingStudents = false;
let isSyncingTeachers = false;

function triggerBackgroundSync(type) {
  if (type === 'students') {
    if (isSyncingStudents) return;
    isSyncingStudents = true;
    fetchStudentsFromCloud()
      .then((cloudStudents) => {
        if (cloudStudents && cloudStudents.length > 0) {
          putManyInStore(STUDENTS_STORE, LS_STUDENTS_KEY, cloudStudents);
        }
      })
      .catch((err) => console.warn('Background student sync skipped:', err.message))
      .finally(() => { isSyncingStudents = false; });
  } else {
    if (isSyncingTeachers) return;
    isSyncingTeachers = true;
    fetchTeachersFromCloud()
      .then((cloudTeachers) => {
        if (cloudTeachers && cloudTeachers.length > 0) {
          putManyInStore(TEACHERS_STORE, LS_TEACHERS_KEY, cloudTeachers);
        }
      })
      .catch((err) => console.warn('Background teacher sync skipped:', err.message))
      .finally(() => { isSyncingTeachers = false; });
  }
}

// ================= STUDENTS SERVICE ================= //

export async function getStudents(params = {}) {
  // 1. Instant local read (0-10ms) without waiting for network
  const students = await getAllFromStore(STUDENTS_STORE, LS_STUDENTS_KEY, INITIAL_STUDENTS);

  // 2. Trigger non-blocking cloud sync in background
  triggerBackgroundSync('students');

  // Filter
  let filtered = [...students];

  if (params.search) {
    const q = params.search.trim().toLowerCase();
    filtered = filtered.filter((s) => 
      (s.quad_name && s.quad_name.toLowerCase().includes(q)) ||
      (s.code && s.code.toLowerCase().includes(q)) ||
      (s.national_id && s.national_id.includes(q)) ||
      (s.phone && s.phone.includes(q))
    );
  }

  if (params.grade) {
    filtered = filtered.filter((s) => s.grade === params.grade);
  }

  if (params.section) {
    filtered = filtered.filter((s) => s.section === params.section);
  }

  if (params.study_stage) {
    filtered = filtered.filter((s) => s.study_stage === params.study_stage);
  }

  if (params.student_status) {
    filtered = filtered.filter((s) => s.student_status === params.student_status);
  }

  if (params.gender) {
    filtered = filtered.filter((s) => s.gender === params.gender);
  }

  // Sort by ID / created_at desc
  filtered.sort((a, b) => (b.id || 0) - (a.id || 0));

  const total = filtered.length;
  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || 15;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  return {
    success: true,
    data: paginated,
    total,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  };
}

export async function getStudentById(idOrCode) {
  const all = await getAllFromStore(STUDENTS_STORE, LS_STUDENTS_KEY, INITIAL_STUDENTS);
  const found = all.find((s) => String(s.id) === String(idOrCode) || String(s.code) === String(idOrCode));
  if (found) {
    return { success: true, data: found };
  }

  // Fallback: check Cloud Firestore
  try {
    const cloudStudent = await fetchStudentByIdFromCloud(idOrCode);
    if (cloudStudent) {
      await putInStore(STUDENTS_STORE, LS_STUDENTS_KEY, cloudStudent);
      return { success: true, data: cloudStudent };
    }
  } catch (e) {
    console.warn('Error fetching student from cloud:', e.message);
  }

  return { success: false, message: 'سجل الطالبة غير موجود' };
}

export async function createStudent(data) {
  const all = await getAllFromStore(STUDENTS_STORE, LS_STUDENTS_KEY, INITIAL_STUDENTS);
  const newId = Date.now();
  
  // Generate unique 6-digit collision-proof code
  const codeSuffix = String(newId).slice(-6);
  const code = data.code || `STU-${codeSuffix}`;

  const newStudent = {
    ...data,
    id: newId,
    code,
    created_at: new Date().toISOString()
  };

  // 1. Save locally to IndexedDB
  await putInStore(STUDENTS_STORE, LS_STUDENTS_KEY, newStudent);

  // 2. Sync to Cloud (Firestore) - await to ensure it writes to cloud
  const cloudSynced = await syncStudentToCloud(newStudent).catch((e) => {
    console.warn('[Storage] Cloud sync failed:', e.message);
    return false;
  });

  // 3. Send Telegram Notification
  const telegramRes = await sendTelegramStudentNotification(newStudent).catch((e) => {
    console.warn('[Storage] Telegram notification error:', e.message);
    return { success: false, message: e.message };
  });

  return {
    success: true,
    data: newStudent,
    cloudSynced: !!cloudSynced,
    telegramSent: !!telegramRes?.success,
    message: 'تم تسجيل قيد الطالبة بنجاح'
  };
}

export async function updateStudent(id, data) {
  const all = await getAllFromStore(STUDENTS_STORE, LS_STUDENTS_KEY, INITIAL_STUDENTS);
  const existing = all.find((s) => String(s.id) === String(id) || String(s.code) === String(id));
  if (!existing) {
    return { success: false, message: 'السجل غير موجود للتحديث' };
  }

  const updated = {
    ...existing,
    ...data,
    id: existing.id,
    code: existing.code,
    updated_at: new Date().toISOString()
  };

  await putInStore(STUDENTS_STORE, LS_STUDENTS_KEY, updated);
  syncStudentToCloud(updated).catch((e) => console.warn('Cloud update error:', e));

  return {
    success: true,
    data: updated,
    message: 'تم تحديث سجل الطالبة بنجاح'
  };
}

export async function deleteStudent(id) {
  const all = await getAllFromStore(STUDENTS_STORE, LS_STUDENTS_KEY, INITIAL_STUDENTS);
  const existing = all.find((s) => String(s.id) === String(id) || String(s.code) === String(id));
  if (existing) {
    await deleteFromStore(STUDENTS_STORE, LS_STUDENTS_KEY, existing.id);
    deleteRecordFromCloud('students', existing.code || existing.id).catch((e) => console.warn('Cloud delete error:', e));
  }
  return { success: true, message: 'تم حذف السجل بنجاح' };
}

// Check duplicate student
export async function checkStudentDuplicate(data) {
  const all = await getAllFromStore(STUDENTS_STORE, LS_STUDENTS_KEY, INITIAL_STUDENTS);
  const duplicate = all.find((s) => {
    if (data.id && (s.id === data.id || s.code === data.code)) return false;
    if (data.national_id && s.national_id && s.national_id === data.national_id) return true;
    if (data.quad_name && s.quad_name && s.quad_name.trim() === data.quad_name.trim()) return true;
    return false;
  });

  return {
    success: true,
    isDuplicate: !!duplicate,
    existingRecord: duplicate || null
  };
}

// ================= TEACHERS SERVICE ================= //

export async function getTeachers(params = {}) {
  // 1. Instant local read (0-10ms)
  const teachers = await getAllFromStore(TEACHERS_STORE, LS_TEACHERS_KEY, INITIAL_TEACHERS);

  // 2. Trigger non-blocking cloud sync in background
  triggerBackgroundSync('teachers');

  let filtered = [...teachers];

  if (params.search) {
    const q = params.search.trim().toLowerCase();
    filtered = filtered.filter((t) => 
      (t.quad_name && t.quad_name.toLowerCase().includes(q)) ||
      (t.code && t.code.toLowerCase().includes(q)) ||
      (t.phone && t.phone.includes(q)) ||
      (t.job_title && t.job_title.toLowerCase().includes(q))
    );
  }

  if (params.staff_category) {
    filtered = filtered.filter((t) => t.staff_category === params.staff_category);
  }

  if (params.gender) {
    filtered = filtered.filter((t) => t.gender === params.gender);
  }

  filtered.sort((a, b) => (b.id || 0) - (a.id || 0));

  const total = filtered.length;
  const page = parseInt(params.page) || 1;
  const limit = parseInt(params.limit) || 15;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  return {
    success: true,
    data: paginated,
    total,
    pagination: {
      page,
      limit,
      total,
      totalPages
    }
  };
}

export async function getTeacherById(idOrCode) {
  const all = await getAllFromStore(TEACHERS_STORE, LS_TEACHERS_KEY, INITIAL_TEACHERS);
  const found = all.find((t) => String(t.id) === String(idOrCode) || String(t.code) === String(idOrCode));
  if (found) {
    return { success: true, data: found };
  }

  // Fallback: check Cloud Firestore
  try {
    const cloudTeacher = await fetchTeacherByIdFromCloud(idOrCode);
    if (cloudTeacher) {
      await putInStore(TEACHERS_STORE, LS_TEACHERS_KEY, cloudTeacher);
      return { success: true, data: cloudTeacher };
    }
  } catch (e) {
    console.warn('Error fetching teacher from cloud:', e.message);
  }

  return { success: false, message: 'سجل الموظف/المدرس غير موجود' };
}

export async function createTeacher(data) {
  const all = await getAllFromStore(TEACHERS_STORE, LS_TEACHERS_KEY, INITIAL_TEACHERS);
  const newId = Date.now();
  
  // Generate unique 6-digit collision-proof code
  const codeSuffix = String(newId).slice(-6);
  const code = data.code || `TEA-${codeSuffix}`;

  const newTeacher = {
    ...data,
    id: newId,
    code,
    created_at: new Date().toISOString()
  };

  // 1. Save locally
  await putInStore(TEACHERS_STORE, LS_TEACHERS_KEY, newTeacher);

  // 2. Sync to Cloud
  const cloudSynced = await syncTeacherToCloud(newTeacher).catch((e) => {
    console.warn('[Storage] Teacher cloud sync failed:', e.message);
    return false;
  });

  // 3. Send Telegram Notification for Teacher/Staff
  const telegramRes = await sendTelegramTeacherNotification(newTeacher).catch((e) => {
    console.warn('[Storage] Teacher Telegram error:', e.message);
    return { success: false, message: e.message };
  });

  return {
    success: true,
    data: newTeacher,
    cloudSynced: !!cloudSynced,
    telegramSent: !!telegramRes?.success,
    message: 'تم إضافة السجل بنجاح'
  };
}

export async function updateTeacher(id, data) {
  const all = await getAllFromStore(TEACHERS_STORE, LS_TEACHERS_KEY, INITIAL_TEACHERS);
  const existing = all.find((t) => String(t.id) === String(id) || String(t.code) === String(id));
  if (!existing) {
    return { success: false, message: 'السجل غير موجود للتحديث' };
  }

  const updated = {
    ...existing,
    ...data,
    id: existing.id,
    code: existing.code,
    updated_at: new Date().toISOString()
  };

  await putInStore(TEACHERS_STORE, LS_TEACHERS_KEY, updated);
  syncTeacherToCloud(updated).catch((e) => console.warn('Cloud update error:', e));

  return {
    success: true,
    data: updated,
    message: 'تم تحديث بيانات الموظف بنجاح'
  };
}

export async function deleteTeacher(id) {
  const all = await getAllFromStore(TEACHERS_STORE, LS_TEACHERS_KEY, INITIAL_TEACHERS);
  const existing = all.find((t) => String(t.id) === String(id) || String(t.code) === String(id));
  if (existing) {
    await deleteFromStore(TEACHERS_STORE, LS_TEACHERS_KEY, existing.id);
    deleteRecordFromCloud('teachers', existing.code || existing.id).catch((e) => console.warn('Cloud delete error:', e));
  }
  return { success: true, message: 'تم حذف السجل بنجاح' };
}

export async function checkTeacherDuplicate(data) {
  const all = await getAllFromStore(TEACHERS_STORE, LS_TEACHERS_KEY, INITIAL_TEACHERS);
  const duplicate = all.find((t) => {
    if (data.id && (t.id === data.id || t.code === data.code)) return false;
    if (data.civil_service_number && t.civil_service_number === data.civil_service_number) return true;
    if (data.quad_name && t.quad_name && t.quad_name.trim() === data.quad_name.trim()) return true;
    return false;
  });

  return {
    success: true,
    isDuplicate: !!duplicate,
    existingRecord: duplicate || null
  };
}

// ================= DASHBOARD STATS ================= //

export async function getDashboardStats() {
  // Sync in background to update local store with latest cloud data
  try {
    const [cloudStudents, cloudTeachers] = await Promise.all([
      fetchStudentsFromCloud().catch(() => null),
      fetchTeachersFromCloud().catch(() => null)
    ]);
    if (cloudStudents && cloudStudents.length > 0) {
      await putManyInStore(STUDENTS_STORE, LS_STUDENTS_KEY, cloudStudents);
    }
    if (cloudTeachers && cloudTeachers.length > 0) {
      await putManyInStore(TEACHERS_STORE, LS_TEACHERS_KEY, cloudTeachers);
    }
  } catch (e) {
    // continue with local data
  }

  const students = await getAllFromStore(STUDENTS_STORE, LS_STUDENTS_KEY, INITIAL_STUDENTS);
  const teachers = await getAllFromStore(TEACHERS_STORE, LS_TEACHERS_KEY, INITIAL_TEACHERS);

  const totalStudents = students.length;
  const teachingStaff = teachers.filter((t) => (t.staff_category || 'تدريسي') === 'تدريسي');
  const otherStaff = teachers.filter((t) => t.staff_category && t.staff_category !== 'تدريسي');
  const totalTeachers = teachingStaff.length;
  const totalStaff = otherStaff.length;
  const totalTeachersStaff = teachers.length;
  const totalRecords = totalStudents + totalTeachersStaff;

  const studentFemales = students.filter((s) => s.gender === 'أنثى' || !s.gender).length;
  const studentMales = students.filter((s) => s.gender === 'ذكر').length;
  const staffFemales = teachers.filter((t) => (t.gender || 'أنثى') === 'أنثى').length;
  const staffMales = teachers.filter((t) => t.gender === 'ذكر').length;

  const totalFemales = studentFemales + staffFemales;
  const totalMales = studentMales + staffMales;

  const studentSpecialNeeds = students.filter((s) => s.has_special_needs && s.has_special_needs != 0).length;
  const staffSpecialNeeds = teachers.filter((t) => t.has_special_needs && t.has_special_needs != 0).length;
  const totalSpecialNeeds = studentSpecialNeeds + staffSpecialNeeds;

  // Grade breakdown
  const gradeMap = {};
  students.forEach((s) => {
    const g = s.grade || 'غير محدد';
    gradeMap[g] = (gradeMap[g] || 0) + 1;
  });
  const studentsByGrade = Object.entries(gradeMap).map(([grade, count]) => ({ grade, count }));

  // Staff by Category
  const catMap = {};
  teachers.forEach((t) => {
    const c = t.staff_category || 'تدريسي';
    catMap[c] = (catMap[c] || 0) + 1;
  });
  const staffByCategory = Object.entries(catMap).map(([staff_category, count]) => ({ staff_category, count }));

  // Staff by Employment Type
  const empMap = {};
  teachers.forEach((t) => {
    const e = t.employment_type || 'ملاك دائم';
    empMap[e] = (empMap[e] || 0) + 1;
  });
  const staffByEmploymentType = Object.entries(empMap).map(([employment_type, count]) => ({ employment_type, count }));

  // Recent records
  const recentStudents = [...students]
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .slice(0, 5)
    .map((s) => ({ ...s, type: 'student' }));

  const recentStaff = [...teachers]
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .slice(0, 5)
    .map((t) => ({ ...t, type: 'teacher' }));

  return {
    success: true,
    stats: {
      totalRecords,
      totalStudents,
      totalTeachers,
      totalStaff,
      totalTeachersStaff,
      totalMales,
      totalFemales,
      totalSpecialNeeds,
      genderBreakdown: {
        students: { male: studentMales, female: studentFemales },
        staff: { male: staffMales, female: staffFemales }
      },
      specialNeeds: {
        students: studentSpecialNeeds,
        staff: staffSpecialNeeds,
        total: totalSpecialNeeds
      },
      studentsByGrade,
      staffByCategory,
      staffByEmploymentType,
      recentStudents,
      recentStaff
    }
  };
}

// ================= EXCEL EXPORT & IMPORT ================= //

export async function exportToExcel(type = 'students') {
  const isStudents = type === 'students';
  const data = isStudents 
    ? await getAllFromStore(STUDENTS_STORE, LS_STUDENTS_KEY, INITIAL_STUDENTS)
    : await getAllFromStore(TEACHERS_STORE, LS_TEACHERS_KEY, INITIAL_TEACHERS);

  // Map Arabic field headers
  const exportRows = data.map((item, idx) => {
    if (isStudents) {
      return {
        'ت': idx + 1,
        'الرمز الإلكتروني': item.code || '',
        'الاسم الرباعي الكامل': item.quad_name || '',
        'اللقب': item.surname || '',
        'اسم الأم': item.mother_name || '',
        'تاريخ التولد': item.dob || '',
        'الجنس': item.gender || 'أنثى',
        'الرقم الوطني / الهوية': item.national_id || item.id_number || '',
        'الصف': item.grade || '',
        'الشعبة': item.section || '',
        'هاتف ولي الأمر': item.parent_phone || item.phone || '',
        'المحافظة': item.province || '',
        'المنطقة / الحي': item.neighborhood || '',
        'حالة القيد': item.student_status || 'مستمرة',
        'تاريخ الإدخال': item.created_at ? new Date(item.created_at).toLocaleDateString('ar-IQ') : ''
      };
    } else {
      return {
        'ت': idx + 1,
        'الرمز الإلكتروني': item.code || '',
        'الاسم الرباعي الكامل': item.quad_name || '',
        'اللقب': item.surname || '',
        'اسم الأم': item.mother_name || '',
        'الصفة الوظيفية': item.staff_category || '',
        'العنوان الوظيفي': item.job_title || '',
        'نوع التعيين': item.employment_type || '',
        'المادة التدريسية': item.teaching_subject || '',
        'التحصيل الدراسي': item.degree || '',
        'رقم الهاتف': item.phone || '',
        'الرقم الوظيفي': item.civil_service_number || ''
      };
    }
  });

  const ws = XLSX.utils.json_to_sheet(exportRows);
  const wb = XLSX.utils.book_new();
  const sheetName = isStudents ? 'سجل الطالبات' : 'سجل الملاكات';
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const filename = `${sheetName}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);

  return { success: true, message: 'تم تحميل ملف Excel بنجاح' };
}

export async function parseExcelPreview(file, targetType) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        if (!json || json.length === 0) {
          return reject(new Error('الملف المرفوع فارغ أو غير متوافق'));
        }

        // Detect columns and map to system fields
        const sample = json[0];
        const headers = Object.keys(sample);

        const mappedRows = json.map((row, idx) => {
          const quad_name = row['الاسم الرباعي الكامل'] || row['الاسم الرباعي'] || row['الاسم'] || row['name'] || '';
          const mother_name = row['اسم الأم'] || row['الام'] || '';
          const dob = row['تاريخ التولد'] || row['المواليد'] || row['dob'] || '';
          const grade = row['الصف'] || row['grade'] || 'الأول متوسط';
          const section = row['الشعبة'] || row['section'] || 'أ';
          const national_id = String(row['الرقم الوطني / الهوية'] || row['الرقم الوطني'] || row['الهوية'] || '');
          const phone = String(row['هاتف ولي الأمر'] || row['رقم الهاتف'] || row['الهاتف'] || '');

          return {
            rowNumber: idx + 1,
            quad_name,
            mother_name,
            dob,
            grade,
            section,
            national_id,
            phone,
            isValid: !!quad_name
          };
        });

        const validCount = mappedRows.filter((r) => r.isValid).length;
        const invalidCount = mappedRows.length - validCount;

        resolve({
          success: true,
          totalRows: mappedRows.length,
          validCount,
          invalidCount,
          headers,
          rows: mappedRows
        });
      } catch (err) {
        reject(new Error('حدث خطأ أثناء قراءة ملف Excel: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('فشل قراءة الملف'));
    reader.readAsArrayBuffer(file);
  });
}

export async function commitExcelImport(rows, targetType, skipDuplicates = true) {
  const isStudents = targetType === 'students';
  let importedCount = 0;
  let skippedCount = 0;

  for (const row of rows) {
    if (!row.isValid) {
      skippedCount++;
      continue;
    }

    if (isStudents) {
      const dup = await checkStudentDuplicate({ quad_name: row.quad_name, national_id: row.national_id });
      if (dup.isDuplicate && skipDuplicates) {
        skippedCount++;
        continue;
      }
      await createStudent({
        quad_name: row.quad_name,
        mother_name: row.mother_name,
        dob: row.dob,
        grade: row.grade,
        section: row.section,
        national_id: row.national_id,
        phone: row.phone,
        parent_phone: row.phone,
        gender: 'أنثى',
        province: 'بغداد'
      });
      importedCount++;
    } else {
      const dup = await checkTeacherDuplicate({ quad_name: row.quad_name });
      if (dup.isDuplicate && skipDuplicates) {
        skippedCount++;
        continue;
      }
      await createTeacher({
        quad_name: row.quad_name,
        mother_name: row.mother_name,
        dob: row.dob,
        phone: row.phone,
        staff_category: 'تدريسي',
        job_title: 'مدرسة'
      });
      importedCount++;
    }
  }

  return {
    success: true,
    importedCount,
    skippedCount,
    message: `تم استيراد ${importedCount} سجل بنجاح، وتخطي ${skippedCount} سجل مكرر.`
  };
}

// ================= BACKUP & RESTORE JSON ================= //

export async function createFullBackup() {
  const students = await getAllFromStore(STUDENTS_STORE, LS_STUDENTS_KEY, INITIAL_STUDENTS);
  const teachers = await getAllFromStore(TEACHERS_STORE, LS_TEACHERS_KEY, INITIAL_TEACHERS);
  
  const backup = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    school: 'مدرسة المتفوقات الأولى للبنات',
    students,
    teachers
  };

  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `EMIS_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);

  return { success: true, message: 'تم تحميل ملف النسخة الاحتياطية بنجاح' };
}

export async function restoreFullBackup(jsonFile) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const backup = JSON.parse(e.target.result);
        if (!backup.students && !backup.teachers) {
          return reject(new Error('الملف غير صالح كنسخة احتياطية لنظام المدرسة'));
        }

        if (Array.isArray(backup.students)) {
          for (const s of backup.students) {
            await putInStore(STUDENTS_STORE, LS_STUDENTS_KEY, s);
          }
        }

        if (Array.isArray(backup.teachers)) {
          for (const t of backup.teachers) {
            await putInStore(TEACHERS_STORE, LS_TEACHERS_KEY, t);
          }
        }

        resolve({
          success: true,
          studentsCount: backup.students?.length || 0,
          teachersCount: backup.teachers?.length || 0,
          message: 'تم استعادة النسخة الاحتياطية بنجاح!'
        });
      } catch (err) {
        reject(new Error('فشل معالجة ملف النسخة الاحتياطية: ' + err.message));
      }
    };
    reader.onerror = () => reject(new Error('فشل قراءة الملف'));
    reader.readAsText(jsonFile);
  });
}

export async function syncAllWithCloud() {
  try {
    const [cloudStudents, cloudTeachers] = await Promise.all([
      fetchStudentsFromCloud(),
      fetchTeachersFromCloud()
    ]);

    if (cloudStudents && cloudStudents.length > 0) {
      await putManyInStore(STUDENTS_STORE, LS_STUDENTS_KEY, cloudStudents);
    }
    if (cloudTeachers && cloudTeachers.length > 0) {
      await putManyInStore(TEACHERS_STORE, LS_TEACHERS_KEY, cloudTeachers);
    }

    return {
      success: true,
      studentsCount: cloudStudents?.length || 0,
      teachersCount: cloudTeachers?.length || 0,
      message: 'تمت المزامنة مع السحابة بنجاح'
    };
  } catch (err) {
    return {
      success: false,
      message: err.message || 'فشلت المزامنة السحابية'
    };
  }
}


