import DutyOverrideService from "../services/duty-override-service.js";
import AccessController from "./access-controller.js";

class DutyOverrideController {

    static async getAll(req, res) {
        try {
            const data = await DutyOverrideService.getAll();
            return AccessController.send(res, 200, "All overrides", data);
        } catch (err) {
            return AccessController.send(res, 500, err.message);
        }
    }

    static async create(req, res) {
        try {
            const { employee_id, date, duty_start, duty_end, reason } = req.body;

            if (!employee_id || !date || !duty_start || !duty_end) {
                return AccessController.send(res, 400, "All fields required");
            }

            await DutyOverrideService.create(employee_id, date, duty_start, duty_end, reason);

            return AccessController.send(res, 200, "Override saved");
        } catch (err) {
            return AccessController.send(res, 500, err.message);
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { employee_id, date, duty_start, duty_end, reason } = req.body;

            await DutyOverrideService.update(id, employee_id, date, duty_start, duty_end, reason);

            return AccessController.send(res, 200, "Override updated");
        } catch (err) {
            return AccessController.send(res, 500, err.message);
        }
    }

    static async delete(req, res) {
        try {
            await DutyOverrideService.delete(req.params.id);
            return AccessController.send(res, 200, "Override deleted");
        } catch (err) {
            return AccessController.send(res, 500, err.message);
        }
    }

    static async getByEmployeeDate(req, res) {
        try {
            const { employee_id, date } = req.params;

            const data = await DutyOverrideService.getByEmployeeDate(employee_id, date);

            return AccessController.send(res, 200, "Override loaded", data);
        } catch (err) {
            return AccessController.send(res, 500, err.message);
        }
    }
}


export default DutyOverrideController;
