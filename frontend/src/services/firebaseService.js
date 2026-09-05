import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  onSnapshot,
  limit
} from 'firebase/firestore';

export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDZ3TYSR1k3KknQQvYoHZGS6iAXvewQcH0',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'schoolinfo-7abbc.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'schoolinfo-7abbc',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'schoolinfo-7abbc.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '461250944820',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:461250944820:web:f9cd5bd7c007f1b44bcf61',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-ZTMRN3Q6MJ'
};

let dbInstance = null;

function getStoredFirebaseConfig() {
  try {
    const raw = localStorage.getItem('emis_school_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.firebaseConfig && parsed.firebaseConfig.apiKey && parsed.firebaseConfig.projectId) {
        return parsed.firebaseConfig;
      }
    }
  } catch (e) {
    // fallback to default
  }
  return DEFAULT_FIREBASE_CONFIG;
}

export function getFirestoreDB() {
  if (dbInstance) return dbInstance;

  const config = getStoredFirebaseConfig();

  if (!config || !config.apiKey || !config.projectId) {
    return null;
  }

  try {
    const app = !getApps().length ? initializeApp(config) : getApp();
    dbInstance = getFirestore(app);
    return dbInstance;
  } catch (err) {
    console.warn('Firebase initialization error:', err);
    return null;
  }
}

export function resetFirebaseInstance() {
  dbInstance = null;
}

function withTimeout(promise, ms = 7000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase network timeout')), ms))
  ]);
}

// Student Cloud Operations
export async function syncStudentToCloud(student) {
  const db = getFirestoreDB();
  if (!db) {
    console.warn('Cannot sync student: Firestore DB not initialized');
    return false;
  }
  try {
    const docId = String(student.code || student.id);
    const docRef = doc(db, 'students', docId);
    await withTimeout(setDoc(docRef, {
      ...student,
      updated_at: serverTimestamp()
    }, { merge: true }), 8000);
    console.log(`[Firebase] Student ${docId} synced successfully`);
    return true;
  } catch (err) {
    console.error('Error syncing student to Firestore:', err);
    return false;
  }
}

export async function fetchStudentsFromCloud() {
  const db = getFirestoreDB();
  if (!db) return null;
  try {
    const colRef = collection(db, 'students');
    const q = query(colRef, orderBy('code', 'desc'));
    const snapshot = await withTimeout(getDocs(q), 6000);
    const list = [];
    snapshot.forEach((d) => list.push({ id: d.id, ...d.data() }));
    return list;
  } catch (err) {
    console.warn('Skipping cloud sync (timeout or offline):', err.message);
    return null;
  }
}

export async function fetchStudentByIdFromCloud(idOrCode) {
  const db = getFirestoreDB();
  if (!db) return null;
  try {
    const docRef = doc(db, 'students', String(idOrCode));
    const snap = await withTimeout(getDoc(docRef), 5000);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
  } catch (e) {
    // try fallback search
  }
  return null;
}

// Teacher Cloud Operations
export async function syncTeacherToCloud(teacher) {
  const db = getFirestoreDB();
  if (!db) return false;
  try {
    const docId = String(teacher.code || teacher.id);
    const docRef = doc(db, 'teachers', docId);
    await withTimeout(setDoc(docRef, {
      ...teacher,
      updated_at: serverTimestamp()
    }, { merge: true }), 8000);
    console.log(`[Firebase] Teacher ${docId} synced successfully`);
    return true;
  } catch (err) {
    console.error('Error syncing teacher to Firestore:', err);
    return false;
  }
}

export async function fetchTeachersFromCloud() {
  const db = getFirestoreDB();
  if (!db) return null;
  try {
    const colRef = collection(db, 'teachers');
    const q = query(colRef, orderBy('code', 'desc'));
    const snapshot = await withTimeout(getDocs(q), 6000);
    const list = [];
    snapshot.forEach((d) => list.push({ id: d.id, ...d.data() }));
    return list;
  } catch (err) {
    console.warn('Skipping teacher cloud sync (timeout or offline):', err.message);
    return null;
  }
}

export async function fetchTeacherByIdFromCloud(idOrCode) {
  const db = getFirestoreDB();
  if (!db) return null;
  try {
    const docRef = doc(db, 'teachers', String(idOrCode));
    const snap = await withTimeout(getDoc(docRef), 5000);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
  } catch (e) {
    // ignore
  }
  return null;
}

// Delete Record
export async function deleteRecordFromCloud(collectionName, recordId) {
  const db = getFirestoreDB();
  if (!db) return false;
  try {
    const docRef = doc(db, collectionName, String(recordId));
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error(`Error deleting from Firestore (${collectionName}):`, err);
    return false;
  }
}

// System Settings Cloud Operations (Telegram, School Info)
export async function saveSystemSettingsToCloud(settings) {
  const db = getFirestoreDB();
  if (!db) return false;
  try {
    const docRef = doc(db, 'settings', 'system');
    const { firebaseConfig, adminPassword, ...safeSettings } = settings;
    await withTimeout(setDoc(docRef, {
      ...safeSettings,
      updated_at: serverTimestamp()
    }, { merge: true }), 5000);
    console.log('[Firebase] System settings saved to cloud');
    return true;
  } catch (err) {
    console.warn('Error saving settings to cloud:', err.message);
    return false;
  }
}

export async function fetchSystemSettingsFromCloud() {
  const db = getFirestoreDB();
  if (!db) return null;
  try {
    const docRef = doc(db, 'settings', 'system');
    const snapshot = await withTimeout(getDoc(docRef), 5000);
    if (snapshot.exists()) {
      return snapshot.data();
    }
    return null;
  } catch (err) {
    console.warn('Could not fetch cloud settings:', err.message);
    return null;
  }
}

// Real-Time Subscriptions for Dashboard Live Notifications
export function subscribeToNewStudents(onNewStudent) {
  const db = getFirestoreDB();
  if (!db) return () => {};

  try {
    const colRef = collection(db, 'students');
    const q = query(colRef, orderBy('created_at', 'desc'), limit(20));
    let initialLoad = true;
    const knownIds = new Set();

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (initialLoad) {
        snapshot.forEach((doc) => knownIds.add(doc.id));
        initialLoad = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' && !knownIds.has(change.doc.id)) {
          knownIds.add(change.doc.id);
          const student = { id: change.doc.id, ...change.doc.data() };
          onNewStudent(student);
        }
      });
    }, (err) => {
      console.warn('[Firestore] Live student subscription warning:', err.message);
    });

    return unsubscribe;
  } catch (err) {
    console.warn('Failed to subscribe to students:', err);
    return () => {};
  }
}

export function subscribeToNewTeachers(onNewTeacher) {
  const db = getFirestoreDB();
  if (!db) return () => {};

  try {
    const colRef = collection(db, 'teachers');
    const q = query(colRef, orderBy('created_at', 'desc'), limit(20));
    let initialLoad = true;
    const knownIds = new Set();

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (initialLoad) {
        snapshot.forEach((doc) => knownIds.add(doc.id));
        initialLoad = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' && !knownIds.has(change.doc.id)) {
          knownIds.add(change.doc.id);
          const teacher = { id: change.doc.id, ...change.doc.data() };
          onNewTeacher(teacher);
        }
      });
    }, (err) => {
      console.warn('[Firestore] Live teacher subscription warning:', err.message);
    });

    return unsubscribe;
  } catch (err) {
    console.warn('Failed to subscribe to teachers:', err);
    return () => {};
  }
}

