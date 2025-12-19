import db from "../config/db.js";

class AttendanceService {

  // -------------------------------------------------------
  // GET TODAY STATUS — FULL PRIORITY LOGIC
  // -------------------------------------------------------
  static async getTodayStatus(employee_id) {

    // 1) Today's attendance entry
    const attendanceSql = `
      SELECT *
      FROM attendance
      WHERE employee_id = ?
      AND date = CURDATE()
      LIMIT 1
    `;
    const [attRes] = await db.query(attendanceSql, [employee_id]);
    const attendance = attRes[0] || null;

    // 2) DAILY OVERRIDE (highest priority)
    const overrideSql = `
      SELECT duty_start, duty_end, reason
      FROM duty_overrides
      WHERE employee_id = ?
      AND date = CURDATE()
      LIMIT 1
    `;
    const [overRes] = await db.query(overrideSql, [employee_id]);

    if (overRes.length > 0) {
      return {
        ...this._attendanceResponse(attendance),
        expected_start: overRes[0].duty_start,
        expected_end: overRes[0].duty_end,
        is_off: 0,
        override_reason: overRes[0].reason,
        source: "DAILY_OVERRIDE"
      };
    }

    // 3) WEEKLY SCHEDULE
    const weekSql = `
      SELECT 
        WEEK(CURDATE(), 3) - WEEK(DATE_FORMAT(CURDATE(), '%Y-%m-01'), 3) + 1 
        AS current_week
    `;
    const [weekRow] = await db.query(weekSql);
    const currentWeek = weekRow[0].current_week;

    const weekday = new Date().getDay();

    const weeklySql = `
      SELECT duty_start, duty_end, is_off
      FROM duty_weekly_schedule
      WHERE employee_id = ?
      AND month = DATE_FORMAT(CURDATE(), '%Y-%m')
      AND week = ?
      AND weekday = ?
      LIMIT 1
    `;
    const [weeklyRes] = await db.query(weeklySql, [
      employee_id,
      currentWeek,
      weekday
    ]);

    if (weeklyRes.length > 0) {

      if (weeklyRes[0].is_off === 1) {
        return {
          ...this._attendanceResponse(attendance),
          expected_start: null,
          expected_end: null,
          is_off: 1,
          source: "WEEKLY_SCHEDULE"
        };
      }

      return {
        ...this._attendanceResponse(attendance),
        expected_start: weeklyRes[0].duty_start,
        expected_end: weeklyRes[0].duty_end,
        is_off: 0,
        source: "WEEKLY_SCHEDULE"
      };
    }

    // 4) MONTHLY DAILY ROSTER (your updated table)
    const monthlySql = `
      SELECT duty_start, duty_end, is_off
      FROM duty_roster
      WHERE employee_id = ?
      AND date = CURDATE()
      LIMIT 1
    `;
    const [monthRes] = await db.query(monthlySql, [employee_id]);

    if (monthRes.length > 0) {

      if (monthRes[0].is_off === 1) {
        return {
          ...this._attendanceResponse(attendance),
          expected_start: null,
          expected_end: null,
          is_off: 1,
          source: "MONTHLY_DUTY"
        };
      }

      return {
        ...this._attendanceResponse(attendance),
        expected_start: monthRes[0].duty_start,
        expected_end: monthRes[0].duty_end,
        is_off: 0,
        source: "MONTHLY_DUTY"
      };
    }

    // 5) DEFAULT SHIFT
    const shiftSql = `
      SELECT shift_start, shift_end
      FROM employees
      WHERE employee_id = ?
      LIMIT 1
    `;
    const [shiftRes] = await db.query(shiftSql, [employee_id]);

    return {
      ...this._attendanceResponse(attendance),
      expected_start: shiftRes[0].shift_start,
      expected_end: shiftRes[0].shift_end,
      is_off: 0,
      source: "DEFAULT_SHIFT"
    };
  }

  // Common attendance formatting
  static _attendanceResponse(att) {
    if (!att) {
      return {
        id: null,
        check_in: null,
        check_out: null,
        total_hours: 0,
        early_minutes: 0,
        late_minutes: 0
      };
    }
    return {
      id: att.id,
      check_in: att.check_in,
      check_out: att.check_out,
      total_hours: att.total_hours,
      early_minutes: att.early_minutes || 0,
      late_minutes: att.late_minutes || 0,
    };
  }

  // -------------------------------------------------------
  // CHECK-IN
  // -------------------------------------------------------
  static async checkIn(employee_id) {

    const expected = await this.getTodayStatus(employee_id);

    const expectedStart = expected.expected_start || "00:00:00";

    const nowSql = `SELECT TIME(NOW()) AS now_time`;
    const [nowRes] = await db.query(nowSql);
    const now = nowRes[0].now_time;

    const diffSql = `
      SELECT TIMESTAMPDIFF(MINUTE, TIME(?), TIME(?)) AS diff
    `;
    const [diffRow] = await db.query(diffSql, [now, expectedStart]);

    let earlyMinutes = 0;
    let lateMinutes = 0;

    if (diffRow[0].diff < 0) earlyMinutes = Math.abs(diffRow[0].diff);
    else lateMinutes = diffRow[0].diff;

    const sql = `
      INSERT INTO attendance 
      (employee_id, date, check_in, early_minutes, late_minutes)
      VALUES (?, CURDATE(), NOW(), ?, ?)
      ON DUPLICATE KEY UPDATE 
        check_in = NOW(),
        early_minutes = VALUES(early_minutes),
        late_minutes = VALUES(late_minutes)
    `;

    await db.query(sql, [employee_id, earlyMinutes, lateMinutes]);

    return true;
  }

  // -------------------------------------------------------
  // CHECK-OUT
  // -------------------------------------------------------
  static async checkOut(attendance_id, hours) {
    const sql = `
      UPDATE attendance
      SET check_out = NOW(), total_hours = ?
      WHERE id = ?
    `;
    await db.query(sql, [hours, attendance_id]);
    return true;
  }

  // ADMIN ATTENDANCE LIST
  static async getAdminAttendance(date) {
    const sql = `
      SELECT 
        e.employee_id,
        e.name,
        d.department_name AS department,
        e.shift_start,
        e.shift_end,
        a.check_in,
        a.check_out,
        a.total_hours,
        a.late_minutes,
        a.early_minutes,
        a.date
      FROM employees e
      LEFT JOIN departments d ON d.department_id = e.department_id
      LEFT JOIN attendance a 
          ON a.employee_id = e.employee_id
          AND a.date = ?
      ORDER BY e.name ASC
    `;
    const [rows] = await db.query(sql, [date]);
    return rows;
  }

}

export default AttendanceService;
