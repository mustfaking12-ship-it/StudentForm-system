import { getSettings } from './settingsService';

/**
 * Sends a rich, formatted notification message to Telegram Bot
 * @param {Object} student - Student record object
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function sendTelegramStudentNotification(student) {
  const settings = getSettings();
  const token = settings.telegramBotToken?.trim();
  const chatId = settings.telegramChatId?.trim();

  if (!token || !chatId || settings.telegramEnabled === false) {
    return { success: false, message: 'إعدادات التيليجرام غير مفعلة أو غير مكتملة' };
  }

  const messageText = `
🔔 <b>استمارة تسجيل قيد طالبة جديدة</b>
🏫 <b>مدرسة المتفوقات الأولى للبنات</b>
━━━━━━━━━━━━━━━━━━
👤 <b>اسم الطالبة الرباعي:</b> ${student.quad_name || '-'}
🏷️ <b>الرمز الإلكتروني:</b> <code>${student.code || '-'}</code>
👩 <b>اسم الأم:</b> ${student.mother_name || '-'}
📅 <b>تاريخ التولد:</b> ${student.dob || '-'}
🆔 <b>الرقم الوطني / الهوية:</b> ${student.national_id || student.id_number || '-'}
📚 <b>الصف والمرحلة:</b> ${student.grade || '-'} (${student.section || 'الشعبة العامة'})

📞 <b>رقم هاتف ولي الأمر:</b> <code>${student.parent_phone || student.phone || '-'}</code>
📍 <b>المحافظة والسكن:</b> ${student.province || 'بغداد'} - ${student.district || '-'} - ${student.neighborhood || '-'}
━━━━━━━━━━━━━━━━━━
⏰ <i>تاريخ التقديم: ${new Date().toLocaleString('ar-IQ')}</i>
`.trim();

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: 'HTML'
      })
    });

    const data = await response.json();
    if (data.ok) {
      return { success: true, message: 'تم إرسال إشعار التيليجرام بنجاح' };
    } else {
      console.warn('Telegram API error:', data);
      return { success: false, message: data.description || 'فشل إرسال رسالة التيليجرام' };
    }
  } catch (err) {
    console.error('Network error sending telegram:', err);
    return { success: false, message: 'خطأ في الاتصال بخادم تيليجرام' };
  }
}

/**
 * Sends a rich, formatted notification message for Teacher/Staff to Telegram Bot
 * @param {Object} teacher - Teacher/Staff record object
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function sendTelegramTeacherNotification(teacher) {
  const settings = getSettings();
  const token = settings.telegramBotToken?.trim();
  const chatId = settings.telegramChatId?.trim();

  if (!token || !chatId || settings.telegramEnabled === false) {
    return { success: false, message: 'إعدادات التيليجرام غير مفعلة أو غير مكتملة' };
  }

  const messageText = `
🔔 <b>استمارة تسجيل كادر جديدة</b>
🏫 <b>مدرسة المتفوقات الأولى للبنات</b>
━━━━━━━━━━━━━━━━━━
👤 <b>الاسم الرباعي:</b> ${teacher.quad_name || '-'}
🏷️ <b>الرمز الإلكتروني:</b> <code>${teacher.code || '-'}</code>
📋 <b>الصفة الوظيفية:</b> ${teacher.staff_category || 'تدريسي'} - ${teacher.job_title || '-'}
📚 <b>التخصص / المادة:</b> ${teacher.general_specialization || teacher.specific_specialization || '-'}
🎓 <b>التحصيل الدراسي:</b> ${teacher.academic_degree || '-'}
📞 <b>رقم الهاتف:</b> <code>${teacher.phone || '-'}</code>
🆔 <b>الرقم الوطني / الهوية:</b> ${teacher.national_id || teacher.id_number || '-'}
📍 <b>السكن:</b> ${teacher.province || 'بغداد'} - ${teacher.district || '-'} - ${teacher.neighborhood || '-'}
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
        text: messageText,
        parse_mode: 'HTML'
      })
    });

    const data = await response.json();
    if (data.ok) {
      return { success: true, message: 'تم إرسال إشعار التيليجرام بنجاح' };
    } else {
      console.warn('Telegram API error:', data);
      return { success: false, message: data.description || 'فشل إرسال رسالة التيليجرام' };
    }
  } catch (err) {
    console.error('Network error sending teacher telegram:', err);
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
ستصلك إشعارات الطالبات الجدد هنا تلقائياً فور تسجيلهن.
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
