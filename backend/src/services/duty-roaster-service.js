import db from "../config/db.js";

class DutyToasterService {

  // ----------------------------
  // GET all monthly duty rows
  // ----------------------------
  static async getAll() {
    const sql = `
      SELECT 
        dr.id,
        dr.employee_id,
        dr.date,
        dr.is_off,
        dr.duty_start,
        dr.duty_end,
        e.name,
        d.department_name
      FROM duty_roster dr
      JOIN employees e ON e.employee_id = dr.employee_id
      LEFT JOIN departments d ON d.department_id = e.department_id
      ORDER BY dr.date DESC, e.name ASC
    `;

    const [rows] = await db.query(sql);
    return rows;
  }

  // -----------------------------------------------------
  // 🔥 BULK SAVE FOR WHOLE MONTH (upsert day by day)
  // -----------------------------------------------------
  static async saveMonthlyBulk(rows) {

    const sql = `
      INSERT INTO duty_roster (employee_id, date, is_off, duty_start, duty_end)
      VALUES ?
      ON DUPLICATE KEY UPDATE 
        is_off = VALUES(is_off),
        duty_start = VALUES(duty_start),
        duty_end = VALUES(duty_end)
  `;

    const values = rows.map(r => [
      r.employee_id,
      r.date.toString().substring(0, 10),   // ALWAYS YYYY-MM-DD
      r.is_off ? 1 : 0,
      r.duty_start,
      r.duty_end
    ]);

    await db.query(sql, [values]);
  }


  static async getMonthlyByEmployee(employee_id, month) {

    const sql = `
        SELECT *
        FROM duty_roster
        WHERE employee_id = ?
        AND DATE_FORMAT(date, '%Y-%m') = ?
        ORDER BY date ASC
    `;

    const [rows] = await db.query(sql, [employee_id, month]);
    return rows;
  }

}

export default DutyToasterService;
