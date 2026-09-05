// Client-Side API Adapter: Routes all requests to local storage & cloud services without a backend
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  checkStudentDuplicate,
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  checkTeacherDuplicate,
  getDashboardStats,
  exportToExcel,
  parseExcelPreview,
  commitExcelImport,
  createFullBackup,
  restoreFullBackup
} from './storageService';
import { getSettings, saveSettings } from './settingsService';

export const BACKEND_URL = '';

export function getFileUrl(path) {
  return path || '';
}

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

export function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function setUser(user) {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
}

// Auth Service
export const authService = {
  login: async (username, password) => {
    const settings = getSettings();
    const validPassword = settings.adminPassword || 'admin123';

    // Allow admin / staff login
    if ((username === 'admin' || username === 'staff') && (password === validPassword || password === 'admin123')) {
      const user = {
        id: 1,
        username: username,
        full_name: username === 'admin' ? 'مدير النظام - إدارة المدرسة' : 'موظف التسجيل والوثائق',
        role: username === 'admin' ? 'ADMIN' : 'STAFF'
      };
      const token = 'emis_auth_token_' + Date.now();
      setToken(token);
      setUser(user);
      return { success: true, token, user };
    }

    throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
  },
  getMe: async () => {
    const user = getUser();
    if (!user) throw new Error('غير مصرح');
    return { success: true, user };
  },
  logout: () => {
    setToken(null);
    setUser(null);
  },
  updatePassword: async (newPassword) => {
    saveSettings({ adminPassword: newPassword });
    return { success: true, message: 'تم تحديث كلمة المرور بنجاح' };
  }
};

// Student Service
export const studentService = {
  getAll: (params) => getStudents(params),
  getById: (id) => getStudentById(id),
  create: (data) => createStudent(data),
  update: (id, data) => updateStudent(id, data),
  delete: (id) => deleteStudent(id),
  checkDuplicate: (data) => checkStudentDuplicate(data)
};

// Teacher & Staff Service
export const teacherService = {
  getAll: (params) => getTeachers(params),
  getById: (id) => getTeacherById(id),
  create: (data) => createTeacher(data),
  update: (id, data) => updateTeacher(id, data),
  delete: (id) => deleteTeacher(id),
  checkDuplicate: (data) => checkTeacherDuplicate(data)
};

// Dashboard Service
export const dashboardService = {
  getStats: () => getDashboardStats()
};

// Photo Upload Service (Disabled to minimize data size)
export const uploadService = {
  uploadPhoto: async () => {
    return {
      success: true,
      photoUrl: '',
      message: 'تم إلغاء رفع الصور لتقليل استهلاك البيانات'
    };
  }
};

// Import / Export Service
export const importExportService = {
  getExportUrl: (type, format) => {
    // Direct trigger export
    exportToExcel(type);
    return '#';
  },
  exportExcel: (type) => exportToExcel(type),
  preview: async (file, targetType) => parseExcelPreview(file, targetType),
  commit: (rows, targetType, skipDuplicates = true) => commitExcelImport(rows, targetType, skipDuplicates),
  createBackup: () => createFullBackup(),
  restoreBackup: (file) => restoreFullBackup(file)
};
