/**
 * Generates formatted unique codes: STU-000001 or TEA-000001
 */

function generateRecordCode(db, type) {
  const prefix = type === 'STUDENT' ? 'STU' : 'TEA';
  const table = type === 'STUDENT' ? 'students' : 'teachers_staff';

  const row = db.prepare(`SELECT code FROM ${table} WHERE code LIKE ? ORDER BY id DESC LIMIT 1`).get(`${prefix}-%`);

  let nextNum = 1;
  if (row && row.code) {
    const parts = row.code.split('-');
    if (parts.length === 2) {
      const parsed = parseInt(parts[1], 10);
      if (!isNaN(parsed)) {
        nextNum = parsed + 1;
      }
    }
  }

  return `${prefix}-${String(nextNum).padStart(6, '0')}`;
}

module.exports = {
  generateRecordCode
};
