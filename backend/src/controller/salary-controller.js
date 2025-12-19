import SalaryService from "../services/salary-service.js";
import AccessController from "./access-controller.js";

class SalaryController {

    // ADD new salary version
    static async add(req, res) {
        try {
            const payload = req.body;

            const id = await SalaryService.addSalary(payload);

            return AccessController.send(res, 200, "Salary added successfully", { salary_id: id });

        } catch (err) {
            return AccessController.send(res, 400, err.message);
        }
    }

    // GET full salary history
    static async history(req, res) {
        try {
            const employee_id = req.params.id;

            const data = await SalaryService.getSalaryHistory(employee_id);

            return AccessController.send(res, 200, "Salary history", data);

        } catch (err) {
            return AccessController.send(res, 500, err.message);
        }
    }

    // Soft delete
    static async remove(req, res) {
        try {
            const id = req.params.id;
            const affected = await SalaryService.deleteSalary(id);

            return AccessController.send(res, 200, "Salary removed", { affected });

        } catch (err) {
            return AccessController.send(res, 400, err.message);
        }
    }
}

export default SalaryController;
