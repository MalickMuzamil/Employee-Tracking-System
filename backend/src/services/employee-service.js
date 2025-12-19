import db from "../config/db.js";

class EmployeeService {

  static async getAll() {
    const sql = `
      SELECT e.*, d.department_name, des.designation_name, g.grade_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.department_id
      LEFT JOIN designations des ON e.designation_id = des.designation_id
      LEFT JOIN grades g ON e.grade_id = g.grade_id
      WHERE e.is_active = 1
    `;

    const [rows] = await db.query(sql);
    return rows;
  }

  static async getMappedIds(body) {
    const [department] = await db.query(
      "SELECT department_id FROM departments WHERE department_name = ?",
      [body.department]
    );

    const [designation] = await db.query(
      "SELECT designation_id FROM designations WHERE designation_name = ?",
      [body.designation]
    );

    const [grade] = await db.query(
      "SELECT grade_id FROM grades WHERE grade_name = ?",
      [body.grade]
    );

    return {
      department_id: department[0]?.department_id ?? null,
      designation_id: designation[0]?.designation_id ?? null,
      grade_id: grade[0]?.grade_id ?? null
    };
  }

  static async create(data) {
    const sql = `INSERT INTO employees SET ?`;
    const [result] = await db.query(sql, data);
    return result.insertId;
  }

  static async update(id, data) {
    const sql = `UPDATE employees SET ? WHERE employee_id = ?`;
    const [result] = await db.query(sql, [data, id]);
    return result.affectedRows;
  }

  static async delete(id) {
    const sql = `UPDATE employees SET is_active = 0 WHERE employee_id = ?`;
    const [result] = await db.query(sql, [id]);
    return result.affectedRows;
  }
}

export default EmployeeService;
