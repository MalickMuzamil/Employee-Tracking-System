import db from "../config/db.js";

class DashboardService {
    static async getStats() {
        const [[totalEmp]] = await db.query(
            "SELECT COUNT(*) AS total FROM employees"
        );

        const [[departments]] = await db.query(
            "SELECT COUNT(*) AS total FROM departments"
        );

        const [[salary]] = await db.query(
            "SELECT SUM(salary) AS total FROM employees"
        );

        const [recent] = await db.query(`
      SELECT e.name, d.department_name, e.salary
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.department_id
      ORDER BY e.employee_id DESC
      LIMIT 5
    `);

        return {
            totalEmployees: totalEmp.total,
            activeEmployees: totalEmp.total,
            departments: departments.total,
            monthlySalary: salary.total,
            recentEmployees: recent
        };
    }

    static async getReportData() {
        const [rows] = await db.query(`
      SELECT e.name, e.email, e.contact, d.department_name, s.designation_name
      FROM employees e
      LEFT JOIN departments d ON d.department_id = e.department_id
      LEFT JOIN designations s ON s.designation_id = e.designation_id
      ORDER BY e.employee_id DESC
    `);

        return rows;
    }
}

export default DashboardService;
