/**
 * Arabic Text Utilities for Iraqi School Management System
 * Includes Smart Arabic Search Normalization and Quad-Name Validation
 */

// Strip diacritics / tashkeel
function stripDiacritics(text) {
  if (!text) return '';
  return text.replace(/[\u064B-\u065F\u0670]/g, '');
}

// Normalize Arabic text for fuzzy search matching
function normalizeArabic(text) {
  if (!text) return '';
  return text
    .trim()
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove diacritics
    .replace(/[ـ]/g, '')                   // remove tatweel / kashida
    .replace(/[إأآٱ]/g, 'ا')               // normalize Alefs
    .replace(/[ى]/g, 'ي')                  // normalize Alef Maksura to Yeh
    .replace(/[ة]/g, 'ه')                  // normalize Teh Marbuta to Heh
    .replace(/[ؤ]/g, 'و')                  // normalize Waw with Hamza
    .replace(/[ئ]/g, 'ي')                  // normalize Yeh with Hamza
    .replace(/\s+/g, ' ');                 // collapse multiple spaces
}

/**
 * Validate Quad Name (الاسم الرباعي)
 * Must be at least 4 meaningful Arabic words
 * Returns { valid: boolean, error?: string, wordsCount: number }
 */
function validateQuadName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'حقل الاسم الرباعي مطلوب ولا يمكن تركه فارغاً', wordsCount: 0 };
  }

  const clean = name.trim().replace(/\s+/g, ' ');
  const words = clean.split(' ').filter(w => w.length > 0);

  if (words.length < 4) {
    return {
      valid: false,
      error: `الاسم المدخل يتكون من ${words.length} أسماء فقط. يجب إدخال الاسم الرباعي كاملاً (4 كلمات على الأقل، مثال: مصطفى حسن جاسم محمد)`,
      wordsCount: words.length
    };
  }

  // Ensure each word has at least 2 letters and contains Arabic characters
  const arabicWordRegex = /^[\u0600-\u06FF\s]+$/;
  if (!arabicWordRegex.test(clean)) {
    return {
      valid: false,
      error: 'يجب أن يحتوي الاسم على أحرف عربية صحيحة فقط',
      wordsCount: words.length
    };
  }

  for (const word of words) {
    if (word.length < 2) {
      return {
        valid: false,
        error: `المقطع "${word}" غير صالح كاسم. يرجى كتابة الأسماء بشكل كامل`,
        wordsCount: words.length
      };
    }
  }

  return { valid: true, wordsCount: words.length, cleanedName: clean };
}

/**
 * Clean and format Iraqi Phone Number
 */
function cleanPhone(phone) {
  if (!phone) return '';
  return phone.toString().replace(/[^\d+]/g, '').trim();
}

module.exports = {
  stripDiacritics,
  normalizeArabic,
  validateQuadName,
  cleanPhone
};
