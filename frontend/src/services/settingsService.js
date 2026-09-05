// Settings Service: Handles Telegram, Firebase, and System Settings in LocalStorage

const SETTINGS_KEY = 'emis_school_settings';

const DEFAULT_SETTINGS = {
  // Telegram Bot Settings
  telegramBotToken: import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '',
  telegramChatId: import.meta.env.VITE_TELEGRAM_CHAT_ID || '',
  telegramEnabled: true,
  
  // Firebase Configuration (Optional Cloud DB)
  firebaseConfig: {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
  },
  
  // School Info
  schoolName: 'مدرسة المتفوقات الأولى للبنات',
  directorate: 'المديرية العامة للتربية',
  adminPassword: 'admin123'
};

export function getSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(stored);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      firebaseConfig: {
        ...DEFAULT_SETTINGS.firebaseConfig,
        ...(parsed.firebaseConfig || {})
      }
    };
  } catch (e) {
    console.error('Error loading settings:', e);
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(newSettings) {
  try {
    const current = getSettings();
    const updated = {
      ...current,
      ...newSettings,
      firebaseConfig: {
        ...current.firebaseConfig,
        ...(newSettings.firebaseConfig || {})
      }
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return { success: true, settings: updated };
  } catch (e) {
    console.error('Error saving settings:', e);
    return { success: false, message: e.message };
  }
}
