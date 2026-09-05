// Settings Service: Handles Telegram, Firebase, and System Settings
import { 
  DEFAULT_FIREBASE_CONFIG, 
  saveSystemSettingsToCloud, 
  fetchSystemSettingsFromCloud 
} from './firebaseService';

const SETTINGS_KEY = 'emis_school_settings';

export const DEFAULT_SETTINGS = {
  // Telegram Bot Settings (Official Linked Bot)
  telegramBotToken: import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '8685239302:AAF8EKoJtqEzwP8qVKCDkJaJtRF6bU2aA8c',
  telegramChatId: import.meta.env.VITE_TELEGRAM_CHAT_ID || '116804737',
  telegramEnabled: true,
  
  // Firebase Configuration (Google Cloud DB - schoolinfo-7abbc)
  firebaseConfig: { ...DEFAULT_FIREBASE_CONFIG },
  
  // School Info
  schoolName: 'مدرسة المتفوقات الأولى للبنات',
  directorate: 'المديرية العامة للتربية',
  adminPassword: 'admin123'
};

// In-memory cache
let cachedSettings = null;

export function getSettings() {
  if (cachedSettings) return cachedSettings;

  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) {
      cachedSettings = { ...DEFAULT_SETTINGS };
      return cachedSettings;
    }
    const parsed = JSON.parse(stored);
    cachedSettings = {
      ...DEFAULT_SETTINGS,
      ...parsed,
      telegramBotToken: parsed.telegramBotToken || DEFAULT_SETTINGS.telegramBotToken,
      telegramChatId: parsed.telegramChatId || DEFAULT_SETTINGS.telegramChatId,
      firebaseConfig: {
        ...DEFAULT_FIREBASE_CONFIG,
        ...(parsed.firebaseConfig || {})
      }
    };
    return cachedSettings;
  } catch (e) {
    console.error('Error loading settings:', e);
    cachedSettings = { ...DEFAULT_SETTINGS };
    return cachedSettings;
  }
}

export function saveSettings(newSettings, syncToCloud = true) {
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
    cachedSettings = updated;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));

    // Also sync to cloud Firestore if enabled so all other devices receive the changes
    if (syncToCloud) {
      saveSystemSettingsToCloud(updated).catch((err) => {
        console.warn('Could not sync settings to cloud:', err.message);
      });
    }

    return { success: true, settings: updated };
  } catch (e) {
    console.error('Error saving settings:', e);
    return { success: false, message: e.message };
  }
}

// Background sync to pull newest settings (e.g. if admin changed telegram token)
export async function syncSettingsFromCloud() {
  try {
    const cloudSettings = await fetchSystemSettingsFromCloud();
    if (cloudSettings) {
      const current = getSettings();
      const merged = {
        ...current,
        ...cloudSettings,
        firebaseConfig: current.firebaseConfig // Preserve firebase config
      };
      cachedSettings = merged;
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch (e) {
    console.warn('Background settings sync skipped:', e.message);
  }
  return getSettings();
}

// Initialize cloud settings sync in background once on load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    syncSettingsFromCloud().catch(() => {});
  }, 1000);
}
