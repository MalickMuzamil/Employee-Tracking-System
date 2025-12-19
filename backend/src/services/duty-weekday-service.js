import db from "../config/db.js";

class DutyWeeklyScheduleService {

    // GET weekly schedule
    static async getByEmployeeMonthWeek(employee_id, month, week) {
        const sql = `
            SELECT *
            FROM duty_weekly_schedule
            WHERE employee_id = ?
              AND month = ?
              AND week = ?
            ORDER BY weekday ASC
        `;

        const [rows] = await db.query(sql, [employee_id, month, week]);
        return rows;
    }

    // ⭐ BULK SAVE week
    static async saveBulk(list) {

        const sql = `
            INSERT INTO duty_weekly_schedule 
                (id, employee_id, month, week, weekday, is_off, duty_start, duty_end)
            VALUES ?
            ON DUPLICATE KEY UPDATE
                is_off = VALUES(is_off),
                duty_start = VALUES(duty_start),
                duty_end = VALUES(duty_end)
        `;

        const values = list.map(row => [
            row.id || null,
            row.employee_id,
            row.month,
            row.week,
            row.weekday,
            row.is_off,
            row.duty_start,
            row.duty_end
        ]);

        await db.query(sql, [values]);
    }

    // SINGLE save (old)
    static async save(employee_id, month, week, weekday, is_off, duty_start, duty_end) {
        const sql = `
            INSERT INTO duty_weekly_schedule 
                (employee_id, month, week, weekday, is_off, duty_start, duty_end)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                is_off = VALUES(is_off),
                duty_start = VALUES(duty_start),
                duty_end = VALUES(duty_end)
        `;

        await db.query(sql, [
            employee_id,
            month,
            week,
            weekday,
            is_off,
            duty_start,
            duty_end
        ]);
    }

    static async update(id, employee_id, month, week, weekday, is_off, duty_start, duty_end) {
        const sql = `
            UPDATE duty_weekly_schedule
            SET employee_id=?, month=?, week=?, weekday=?,
                is_off=?, duty_start=?, duty_end=?
            WHERE id=?
        `;

        await db.query(sql, [
            employee_id,
            month,
            week,
            weekday,
            is_off,
            duty_start,
            duty_end,
            id
        ]);
    }

    static async delete(id) {
        await db.query(`DELETE FROM duty_weekly_schedule WHERE id=?`, [id]);
    }
}

export default DutyWeeklyScheduleService;
