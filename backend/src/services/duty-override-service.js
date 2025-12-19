import db from "../config/db.js";

class DutyOverrideService {

    static async getAll() {
        const sql = `
      SELECT o.*, e.name, d.department_name
      FROM duty_overrides o
      JOIN employees e ON e.employee_id = o.employee_id
      LEFT JOIN departments d ON d.department_id = e.department_id
      ORDER BY date DESC
    `;
        const [rows] = await db.query(sql);
        return rows;
    }

    static async getByEmployeeDate(employee_id, date) {
        const sql = `
        SELECT *
        FROM duty_overrides
        WHERE employee_id = ?
          AND date = ?
        LIMIT 1
    `;
        const [rows] = await db.query(sql, [employee_id, date]);
        return rows.length ? rows[0] : null;
    }

    static async create(employee_id, date, duty_start, duty_end, reason) {
        const sql = `
      INSERT INTO duty_overrides (employee_id, date, duty_start, duty_end, reason)
      VALUES (?, ?, ?, ?, ?)
    `;
        await db.query(sql, [employee_id, date, duty_start, duty_end, reason]);
    }

    static async update(id, employee_id, date, duty_start, duty_end, reason) {
        const sql = `
      UPDATE duty_overrides
      SET employee_id = ?, date = ?, duty_start = ?, duty_end = ?, reason = ?
      WHERE id = ?
    `;
        await db.query(sql, [
            employee_id,
            date,
            duty_start,
            duty_end,
            reason,
            id,
        ]);
    }

    static async delete(id) {
        await db.query(`DELETE FROM duty_overrides WHERE id = ?`, [id]);
    }
}

export default DutyOverrideService;
