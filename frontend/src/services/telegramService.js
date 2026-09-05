import { getSettings, syncSettingsFromCloud } from './settingsService';

/**
 * Escapes special HTML characters for Telegram HTML parse_mode
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (str === null || str === undefined || str === '') return '-';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Helper to fetch token and chatId, attempting cloud sync if missing
 */
async function getTelegramCredentials() {
  let settings = getSettings();
  let token = settings.telegramBotToken?.trim();
  let chatId = settings.telegramChatId?.trim();

  if (!token || !chatId) {
    try {
      const refreshed = await syncSettingsFromCloud();
      token = refreshed.telegramBotToken?.trim();
      chatId = refreshed.telegramChatId?.trim();
      settings = refreshed;
    } catch (e) {
      // ignore
    }
  }

  return { token, chatId, enabled: settings.telegramEnabled !== false };
}

/**
 * Sends a rich, formatted notification message to Telegram Bot
 * @param {Object} student - Student record object
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function sendTelegramStudentNotification(student) {
  const { token, chatId, enabled } = await getTelegramCredentials();

  if (!token || !chatId || !enabled) {
    console.warn('[Telegram] Skipped: Bot token or Chat ID not configured');
    return { success: false, message: 'إعدادات التيليجرام غير مفعلة أو غير مكتملة' };
  }

  const guardianInfo = student.guardian_quad_name 
    ? `${escapeHtml(student.guardian_quad_name)} (${escapeHtml(student.guardian_relationship || 'ولي الأمر')})`
    : '-';

  const address = [
    student.province,
    student.district,
    student.neighborhood,
    student.mahalla ? `م ${student.mahalla}` : '',
    student.zuqaq ? `ز ${student.zuqaq}` : '',
    student.house_no ? `دار ${student.house_no}` : ''
  ].filter(Boolean).join(' - ') || '-';

  const messageHtml = `
🔔 <b>استمارة تسجيل قيد طالبة جديدة</b>
🏫 <b>مدرسة المتفوقات الأولى للبنات</b>
━━━━━━━━━━━━━━━━━━
👤 <b>اسم الطالبة:</b> ${escapeHtml(student.quad_name)}
🏷️ <b>الرمز الإلكتروني:</b> <code>${escapeHtml(student.code)}</code>
👩 <b>اسم الأم:</b> ${escapeHtml(student.mother_name)}
📅 <b>تاريخ التولد:</b> ${escapeHtml(student.dob)}
🆔 <b>الرقم الوطني / الهوية:</b> <code>${escapeHtml(student.national_id || student.id_number)}</code>
📚 <b>الصف والمرحلة:</b> ${escapeHtml(student.grade)} (${escapeHtml(student.section || 'أ')})

👨‍👧 <b>ولي الأمر:</b> ${guardianInfo}
📞 <b>هاتف ولي الأمر:</b> <code>${escapeHtml(student.guardian_phone || student.parent_phone || student.phone)}</code>
📍 <b>السكن:</b> ${escapeHtml(address)}
${student.has_special_needs ? `♿ <b>احتياجات خاصة:</b> ${escapeHtml(student.special_needs_type || 'نعم')}\n` : ''}━━━━━━━━━━━━━━━━━━
⏰ <i>تاريخ التقديم: ${new Date().toLocaleString('ar-IQ')}</i>
`.trim();

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageHtml,
        parse_mode: 'HTML'
      })
    });

    const data = await response.json();
    if (data.ok) {
      console.log('[Telegram] Student notification sent successfully');
      return { success: true, message: 'تم إرسال إشعار التيليجرام بنجاح' };
    } else {
      console.warn('[Telegram] API error with HTML, trying plain text fallback:', data);
      // Fallback: Send plain text if HTML parsing fails
      const plainText = `استمارة طالبة جديدة: ${student.quad_name} - رمز: ${student.code} - هاتف: ${student.phone || student.parent_phone}`;
      const fallbackRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: plainText
        })
      });
      const fallbackData = await fallbackRes.json();
      return {
        success: fallbackData.ok,
        message: fallbackData.ok ? 'تم الإرسال بنجاح' : (fallbackData.description || 'فشل إرسال التيليجرام')
      };
    }
  } catch (err) {
    console.error('[Telegram] Network error:', err);
    return { success: false, message: 'خطأ في الاتصال بخادم تيليجرام' };
  }
}

/**
 * Sends a rich, formatted notification message for Teacher/Staff to Telegram Bot
 * @param {Object} teacher - Teacher/Staff record object
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function sendTelegramTeacherNotification(teacher) {
  const { token, chatId, enabled } = await getTelegramCredentials();

  if (!token || !chatId || !enabled) {
    console.warn('[Telegram] Skipped: Bot token or Chat ID not configured');
    return { success: false, message: 'إعدادات التيليجرام غير مفعلة أو غير مكتملة' };
  }

  const messageHtml = `
🔔 <b>استمارة تسجيل كادر جديدة</b>
🏫 <b>مدرسة المتفوقات الأولى للبنات</b>
━━━━━━━━━━━━━━━━━━
👤 <b>الاسم الرباعي:</b> ${escapeHtml(teacher.quad_name)}
🏷️ <b>الرمز الإلكتروني:</b> <code>${escapeHtml(teacher.code)}</code>
📋 <b>الصفة الوظيفية:</b> ${escapeHtml(teacher.staff_category || 'تدريسي')} - ${escapeHtml(teacher.job_title)}
📚 <b>التخصص / المادة:</b> ${escapeHtml(teacher.teaching_subject || teacher.specialization || teacher.general_specialization)}
🎓 <b>التحصيل الدراسي:</b> ${escapeHtml(teacher.degree || teacher.academic_degree)}
📞 <b>رقم الهاتف:</b> <code>${escapeHtml(teacher.phone)}</code>
🆔 <b>الرقم الوطني / الهوية:</b> <code>${escapeHtml(teacher.national_id || teacher.id_number)}</code>
📍 <b>السكن:</b> ${escapeHtml(teacher.province || 'بغداد')} - ${escapeHtml(teacher.district)} - ${escapeHtml(teacher.neighborhood)}
━━━━━━━━━━━━━━━━━━
⏰ <i>تاريخ الإضافة: ${new Date().toLocaleString('ar-IQ')}</i>
`.trim();

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageHtml,
        parse_mode: 'HTML'
      })
    });

    const data = await response.json();
    if (data.ok) {
      console.log('[Telegram] Teacher notification sent successfully');
      return { success: true, message: 'تم إرسال إشعار التيليجرام بنجاح' };
    } else {
      console.warn('[Telegram] API error:', data);
      return { success: false, message: data.description || 'فشل إرسال رسالة التيليجرام' };
    }
  } catch (err) {
    console.error('[Telegram] Network error:', err);
    return { success: false, message: 'خطأ في الاتصال بخادم تيليجرام' };
  }
}

/**
 * Test Telegram bot connection and chat_id
 * @param {string} token 
 * @param {string} chatId 
 */
export async function testTelegramConnection(token, chatId) {
  if (!token || !chatId) {
    return { success: false, message: 'يرجى إدخال التوكن ومعرف الشات (Chat ID)' };
  }

  const testMessage = `
✅ <b>اختبار اتصال بوت نظام مدرسة المتفوقات الأولى للبنات</b>
━━━━━━━━━━━━━━━━━━
تم ربط البوت بنجاح بنظام استمارات الطلاب!
ستصلك إشعارات الطالبات والموظفين الجدد هنا تلقائياً فور تسجيلهم.
⏰ <i>التاريخ: ${new Date().toLocaleString('ar-IQ')}</i>
`.trim();

  try {
    const url = `https://api.telegram.org/bot${token.trim()}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId.trim(),
        text: testMessage,
        parse_mode: 'HTML'
      })
    });

    const data = await response.json();
    if (data.ok) {
      return { success: true, message: 'تم إرسال رسالة الاختبار بنجاح إلى التيليجرام!' };
    } else {
      return { success: false, message: `خطأ من تيليجرام: ${data.description}` };
    }
  } catch (err) {
    return { success: false, message: `فشل الاتصال: ${err.message}` };
  }
}
