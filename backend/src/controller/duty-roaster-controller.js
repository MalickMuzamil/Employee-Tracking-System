import DutyToasterService from "../services/duty-roaster-service.js";
import AccessController from "./access-controller.js";

class DutyToasterController {

    // GET all assigned duties
    static async getAll(req, res) {
        try {
            const data = await DutyToasterService.getAll();
            return AccessController.send(res, 200, "All duties", data);
        } catch (err) {
            return AccessController.send(res, 500, err.message);
        }
    }

    static async saveMonthlyBulk(req, res) {
        try {
            const rows = req.body;

            if (!Array.isArray(rows) || rows.length === 0) {
                return AccessController.send(res, 400, "Invalid monthly payload");
            }

            await DutyToasterService.saveMonthlyBulk(rows);

            return AccessController.send(res, 200, "Monthly schedule saved successfully");

        } catch (err) {
            return AccessController.send(res, 500, err.message);
        }
    }

    static async getMonthlyByEmployee(req, res) {
        try {
            const { empId, month } = req.params;

            const data = await DutyToasterService.getMonthlyByEmployee(empId, month);

            return AccessController.send(res, 200, "Monthly duty", data);

        } catch (err) {
            return AccessController.send(res, 500, err.message);
        }
    }

}

export default DutyToasterController;
