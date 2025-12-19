import PayrollService from "../services/payroll-service.js";
import AccessController from "./access-controller.js";
import db from "../config/db.js";

class PayrollController {

    static async generate(req, res) {
        try {
            const { employee_id, month } = req.body;

            if (!employee_id || !month) {
                return AccessController.send(res, 400, "Employee ID and Month are required.");
            }

            // 1) Load employee info
            const [[emp]] = await db.query(
                `SELECT e.*, d.department_name 
                 FROM employees e
                 LEFT JOIN departments d ON d.department_id = e.department_id
                 WHERE employee_id = ?`,
                [employee_id]
            );

            if (!emp) {
                return AccessController.send(res, 404, "Employee not found");
            }

            // 2) Generate payroll (calc only)
            const payroll = await PayrollService.generatePayroll(employee_id, month);

            // 3) Insert database payroll history
            const payrollId = await PayrollService.insertPayroll(payroll);

            // 4) Send raw payroll to frontend (no PDF)
            return AccessController.send(res, 200, "Payroll generated", {
                payrollId,
                employee: emp,
                payroll
            });

        } catch (err) {
            return AccessController.send(res, 500, err.message);
        }
    }
}

export default PayrollController;
