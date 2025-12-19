// import db from "../config/db.js";

// class PayrollService {

//   // 🔵 Get salary active in the month
//   static async getActiveSalary(employee_id, month) {
//     const sql = `
//       SELECT amount 
//       FROM salary_history
//       WHERE employee_id = ?
//       AND is_active = 1
//       AND effective_from <= DATE(CONCAT(?, '-01'))
//       ORDER BY effective_from DESC
//       LIMIT 1
//     `;
//     const [rows] = await db.query(sql, [employee_id, month]);
//     return rows.length ? Number(rows[0].amount) : 0;
//   }

//   // 🔵 Full month attendance
//   static async getMonthlyAttendance(employee_id, month) {
//     const sql = `
//       SELECT *
//       FROM attendance
//       WHERE employee_id = ?
//       AND DATE_FORMAT(date, '%Y-%m') = ?
//       ORDER BY date ASC
//     `;
//     const [rows] = await db.query(sql, [employee_id, month]);
//     return rows;
//   }

//   // 🔵 Get duty for a specific date (Override → Weekly → Roster → Employee shift)
//   static async getDutyForDate(employee_id, date, month) {
//     const day = new Date(date).getDay();
//     const week = Math.ceil(new Date(date).getDate() / 7);

//     // 1) Daily override
//     const [override] = await db.query(
//       `SELECT duty_start, duty_end 
//        FROM duty_overrides 
//        WHERE employee_id = ? AND date = ? LIMIT 1`,
//       [employee_id, date]
//     );
//     if (override.length) {
//       return { ...override[0], is_off: 0 };
//     }

//     // 2) Weekly schedule
//     const [weekly] = await db.query(
//       `SELECT duty_start, duty_end, is_off 
//        FROM duty_weekly_schedule 
//        WHERE employee_id = ? AND month = ? AND week = ? AND weekday = ? LIMIT 1`,
//       [employee_id, month, week, day]
//     );
//     if (weekly.length) return weekly[0];

//     // 3) Roster (daily)
//     const [roster] = await db.query(
//       `SELECT duty_start, duty_end, is_off 
//        FROM duty_roster 
//        WHERE employee_id = ? AND date = ? LIMIT 1`,
//       [employee_id, date]
//     );
//     if (roster.length) return roster[0];

//     // 4) Employee default shift
//     const [[emp]] = await db.query(
//       `SELECT shift_start, shift_end
//        FROM employees WHERE employee_id = ?`,
//       [employee_id]
//     );

//     return {
//       is_off: 0,
//       duty_start: emp.shift_start ?? "09:00:00",
//       duty_end: emp.shift_end ?? "17:00:00"
//     };
//   }

//   // 🔵 Insert payroll record
//   static async insertPayroll(data) {
//     const sql = `
//       INSERT INTO payroll 
//       (employee_id, month, total_working_days, total_present, total_hours, overtime_hours,
//        basic_salary, overtime_pay, deductions, net_salary, total_absent)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     const params = [
//       data.employee_id,
//       data.month,
//       data.total_working_days,
//       data.total_present,
//       data.total_hours,
//       data.overtime_hours,
//       data.basic_salary,
//       data.overtime_pay,
//       data.deductions,
//       data.net_salary,
//       data.total_absent
//     ];

//     const [res] = await db.query(sql, params);
//     return res.insertId;
//   }

//   // 🔵 Final Payroll Calculation (BEST VERSION)
//   static async generatePayroll(employee_id, month) {

//     const salary = await this.getActiveSalary(employee_id, month);
//     const attendance = await this.getMonthlyAttendance(employee_id, month);

//     let present = 0, absent = 0;
//     let totalHours = 0, totalOvertime = 0;

//     for (const day of attendance) {

//       const duty = await this.getDutyForDate(employee_id, day.date, month);

//       // OFF day
//       if (duty.is_off == 1) continue;

//       if (!day.check_in || !day.check_out) {
//         absent++;
//         continue;
//       }

//       present++;

//       // Use accurate DB worked hours:
//       const workedHours = Number(day.total_hours) || 0;
//       totalHours += workedHours;

//       // Calculate shift hours
//       const shiftHours =
//         (new Date(`2000-01-01T${duty.duty_end}`) -
//           new Date(`2000-01-01T${duty.duty_start}`)) / (1000 * 60 * 60);

//       if (workedHours > shiftHours) {
//         totalOvertime += workedHours - shiftHours;
//       }
//     }

//     const workingDays = present + absent;

//     const dailyRate = salary / 30;
//     const basicSalary = dailyRate * present;

//     const overtimeRate = dailyRate / 8; // per hour
//     const overtimePay = totalOvertime * overtimeRate;

//     const netSalary = basicSalary + overtimePay;

//     return {
//       employee_id,
//       month,
//       total_working_days: workingDays,
//       total_present: present,
//       total_absent: absent,
//       total_hours: Number(totalHours).toFixed(2),
//       overtime_hours: Number(totalOvertime).toFixed(2),
//       basic_salary: Number(basicSalary).toFixed(2),
//       overtime_pay: Number(overtimePay).toFixed(2),
//       deductions: 0,
//       net_salary: Number(netSalary).toFixed(2)
//     };
//   }
// }

// export default PayrollService;






//Oper wala bilkul thk chal rha ha working hour shii calculate nahi ho rhy  jitna mujhe smjh aya ha mene db me hard coded values rkhy hain shayeed is liye msla kr rha ha 

import db from "../config/db.js";

class PayrollService {

  // ✔ Get correct salary of that month
  static async getActiveSalary(employee_id, month) {
    const sql = `
      SELECT amount 
      FROM salary_history
      WHERE employee_id = ?
      AND is_active = 1
      AND effective_from <= DATE(CONCAT(?, '-01'))
      ORDER BY effective_from DESC
      LIMIT 1
    `;
    const [rows] = await db.query(sql, [employee_id, month]);
    return rows.length ? Number(rows[0].amount) : 0;
  }

  // ✔ Get all attendance records of the month
  static async getMonthlyAttendance(employee_id, month) {
    const sql = `
      SELECT *
      FROM attendance
      WHERE employee_id = ?
      AND DATE_FORMAT(date, '%Y-%m') = ?
      ORDER BY date ASC
    `;
    const [rows] = await db.query(sql, [employee_id, month]);
    return rows;
  }

  // ✔ Duty resolver (Override → Weekly → Daily → Default)
  static async getDutyForDate(employee_id, date, month) {
    const weekday = new Date(date).getDay();
    const week = Math.ceil(new Date(date).getDate() / 7);

    // 1) Override
    const [override] = await db.query(
      `SELECT duty_start, duty_end FROM duty_overrides
       WHERE employee_id = ? AND date = ? LIMIT 1`,
      [employee_id, date]
    );
    if (override.length) return { ...override[0], is_off: 0 };

    // 2) Weekly schedule
    const [weekly] = await db.query(
      `SELECT duty_start, duty_end, is_off 
       FROM duty_weekly_schedule
       WHERE employee_id = ? AND month = ? AND week = ? AND weekday = ?
       LIMIT 1`,
      [employee_id, month, week, weekday]
    );
    if (weekly.length) return weekly[0];

    // 3) Roster
    const [roster] = await db.query(
      `SELECT duty_start, duty_end, is_off 
       FROM duty_roster
       WHERE employee_id = ? AND date = ?
       LIMIT 1`,
      [employee_id, date]
    );
    if (roster.length) return roster[0];

    // 4) Default employee shift
    const [[emp]] = await db.query(`
      SELECT shift_start, shift_end
      FROM employees WHERE employee_id = ?
    `, [employee_id]);

    return {
      is_off: 0,
      duty_start: emp.shift_start ?? "09:00:00",
      duty_end: emp.shift_end ?? "17:00:00",
    };
  }

  // ✔ Insert payroll in DB
  static async insertPayroll(data) {
    const sql = `
      INSERT INTO payroll 
      (employee_id, month, total_working_days, total_present, total_hours, overtime_hours,
       basic_salary, overtime_pay, deductions, net_salary, total_absent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      data.employee_id,
      data.month,
      data.total_working_days,
      data.total_present,
      data.total_hours,
      data.overtime_hours,
      data.basic_salary,
      data.overtime_pay,
      data.deductions,
      data.net_salary,
      data.total_absent
    ];

    const [res] = await db.query(sql, params);
    return res.insertId;
  }

  // ✔ Main Payroll Calculation (Final Version)
  static async generatePayroll(employee_id, month) {

    const salary = await this.getActiveSalary(employee_id, month);
    const attendance = await this.getMonthlyAttendance(employee_id, month);

    let present = 0,
      absent = 0,
      totalHours = 0,
      totalOvertime = 0;

    for (const day of attendance) {

      const duty = await this.getDutyForDate(employee_id, day.date, month);

      // OFF day → skip completely
      if (duty.is_off == 1) continue;

      // ABSENT
      if (!day.check_in || !day.check_out) {
        absent++;
        continue;
      }

      present++;

      // ⭐ ACCURATE WORKED HOURS (same logic as UI)
      let workedHours = 0;
      if (day.check_in && day.check_out) {
        const start = new Date(day.check_in);
        const end = new Date(day.check_out);
        workedHours = (end - start) / (1000 * 60 * 60); // convert ms → hours

        if (workedHours < 0) workedHours = 0;
      }

      totalHours += workedHours;

      // ⭐ SHIFT HOURS
      const shiftHours =
        (new Date(`2000-01-01T${duty.duty_end}`) -
          new Date(`2000-01-01T${duty.duty_start}`)) / (1000 * 60 * 60);

      // ⭐ OVERTIME
      if (workedHours > shiftHours) {
        totalOvertime += workedHours - shiftHours;
      }
    }

    const workingDays = present + absent;

    // ⭐ Salary Calculations
    const dailyRate = salary / 30;
    const basicSalary = dailyRate * present;

    const overtimeRate = dailyRate / 8;
    const overtimePay = totalOvertime * overtimeRate;

    const netSalary = basicSalary + overtimePay;

    return {
      employee_id,
      month,
      total_working_days: workingDays,
      total_present: present,
      total_absent: absent,
      total_hours: totalHours.toFixed(2),
      overtime_hours: totalOvertime.toFixed(2),
      basic_salary: basicSalary.toFixed(2),
      overtime_pay: overtimePay.toFixed(2),
      deductions: 0,
      net_salary: netSalary.toFixed(2),
    };
  }
}

export default PayrollService;
