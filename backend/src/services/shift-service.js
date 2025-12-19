import db from "../config/db.js";

class ShiftService {

  static async addOverride(data) {
    const sql = `
      INSERT INTO shift_overrides (employee_id, date, shift_start, shift_end)
      VALUES (?, ?, ?, ?)
    `;
    const params = [
      data.employee_id,
      data.date,
      data.shift_start,
      data.shift_end
    ];
    const [result] = await db.query(sql, params);
    return result.insertId;
  }

  static async getOverride(employee_id, date) {
    const sql = `
      SELECT * FROM shift_overrides
      WHERE employee_id = ? AND date = ?
    `;
    const [rows] = await db.query(sql, [employee_id, date]);
    return rows[0] || null;
  }

  static async deleteOverride(id) {
    const sql = `DELETE FROM shift_overrides WHERE id = ?`;
    const [result] = await db.query(sql, [id]);
    return result.affectedRows;
  }
}

export default ShiftService;
