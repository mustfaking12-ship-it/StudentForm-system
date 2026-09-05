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
  serverTimestamp 
} from 'firebase/firestore';
import { getSettings } from './settingsService';

let dbInstance = null;

export function getFirestoreDB() {
  if (dbInstance) return dbInstance;

  const settings = getSettings();
  const config = settings.firebaseConfig;

  // Check if minimal required config is present
  if (!config || !config.apiKey || !config.projectId) {
    return null; // Firebase is not configured, fallback to IndexedDB
  }

  try {
    const app = !getApps().length ? initializeApp(config) : getApp();
    dbInstance = getFirestore(app);
    return dbInstance;
  } catch (err) {
    console.warn('Firebase initialization skipped or failed:', err);
    return null;
  }
}

export function resetFirebaseInstance() {
  dbInstance = null;
}

// Firestore operations
export async function syncStudentToCloud(student) {
  const db = getFirestoreDB();
  if (!db) return false;
  try {
    const docRef = doc(db, 'students', String(student.code || student.id));
    await setDoc(docRef, {
      ...student,
      updated_at: serverTimestamp()
    }, { merge: true });
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
    const snapshot = await getDocs(q);
    const list = [];
    snapshot.forEach((d) => list.push({ id: d.id, ...d.data() }));
    return list;
  } catch (err) {
    console.error('Error fetching students from Firestore:', err);
    return null;
  }
}

export async function syncTeacherToCloud(teacher) {
  const db = getFirestoreDB();
  if (!db) return false;
  try {
    const docRef = doc(db, 'teachers', String(teacher.code || teacher.id));
    await setDoc(docRef, {
      ...teacher,
      updated_at: serverTimestamp()
    }, { merge: true });
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
    const snapshot = await getDocs(q);
    const list = [];
    snapshot.forEach((d) => list.push({ id: d.id, ...d.data() }));
    return list;
  } catch (err) {
    console.error('Error fetching teachers from Firestore:', err);
    return null;
  }
}

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
