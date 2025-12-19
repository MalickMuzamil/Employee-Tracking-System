import db from "../config/db.js";

class SalaryService {

    // ADD new salary version with validation + auto effective_to update
    static async addSalary({ employee_id, amount, effective_from, note }) {

        // check if attendance/payroll is already generated for this month
        const [payroll] = await db.query(`
            SELECT * FROM payroll 
            WHERE employee_id = ? 
            AND month = DATE_FORMAT(?, '%Y-%m')
        `, [employee_id, effective_from]);

        if (payroll.length > 0) {
            throw new Error("Salary cannot be changed because payroll is already generated for this month.");
        }

        // Get latest salary record
        const [last] = await db.query(`
            SELECT * FROM salary_history 
            WHERE employee_id = ? 
            AND is_active = 1
            ORDER BY effective_from DESC
            LIMIT 1
        `, [employee_id]);

        if (last.length > 0) {
            const lastEffective = new Date(last[0].effective_from);
            const newEffective = new Date(effective_from);

            // Prevent overlapping effective dates
            if (newEffective <= lastEffective) {
                throw new Error(`New salary effective date must be greater than the last salary date (${last[0].effective_from}).`);
            }

            // Update previous salary effective_to
            await db.query(`
                UPDATE salary_history
                SET effective_to = DATE_SUB(?, INTERVAL 1 DAY)
                WHERE salary_id = ?
            `, [effective_from, last[0].salary_id]);
        }

        // Insert new version
        const [res] = await db.query(`
            INSERT INTO salary_history (employee_id, amount, effective_from, note)
            VALUES (?, ?, ?, ?)
        `, [employee_id, amount, effective_from, note]);

        return res.insertId;
    }

    // GET full salary history
    static async getSalaryHistory(employee_id) {
        const [rows] = await db.query(`
            SELECT *
            FROM salary_history
            WHERE employee_id = ?
            ORDER BY effective_from DESC
        `, [employee_id]);

        return rows;
    }

    // SOFT DELETE salary record
    static async deleteSalary(id) {

        // Get record to check if it's latest
        const [sal] = await db.query(`
            SELECT employee_id, effective_from FROM salary_history WHERE salary_id = ?
        `, [id]);

        if (!sal.length) throw new Error("Salary record not found");

        const employee_id = sal[0].employee_id;
        const effective_from = sal[0].effective_from;

        // Don't delete if payroll already generated
        const [payroll] = await db.query(`
            SELECT * FROM payroll 
            WHERE employee_id = ? 
            AND month = DATE_FORMAT(?, '%Y-%m')
        `, [employee_id, effective_from]);

        if (payroll.length > 0) {
            throw new Error("Cannot delete salary, payroll already generated.");
        }

        // Soft delete
        const [res] = await db.query(`
            UPDATE salary_history
            SET is_active = 0
            WHERE salary_id = ?
        `, [id]);

        return res.affectedRows;
    }

    // GET salary applicable for a particular month
    static async getSalaryForMonth(employee_id, month) {
        const [rows] = await db.query(`
            SELECT amount
            FROM salary_history
            WHERE employee_id = ?
            AND effective_from <= DATE(CONCAT(?, '-01'))
            AND (effective_to IS NULL OR effective_to >= DATE(CONCAT(?, '-01')))
            AND is_active = 1
            ORDER BY effective_from DESC
            LIMIT 1
        `, [employee_id, month, month]);

        return rows.length ? rows[0].amount : 0;
    }
}

export default SalaryService;
