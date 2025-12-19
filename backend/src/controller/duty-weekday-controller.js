import DutyWeeklyScheduleService from "../services/duty-weekday-service.js";
import AccessController from "./access-controller.js";

class DutyWeeklyScheduleController {

    // GET weekly schedule for employee + month + week
    static async getByEmployeeMonthWeek(req, res) {
        try {
            const { employee_id, month, week } = req.params;
            const data = await DutyWeeklyScheduleService.getByEmployeeMonthWeek(
                employee_id,
                month,
                week
            );

            return AccessController.send(res, 200, "Weekly schedule loaded", data);

        } catch (err) {
            return AccessController.send(res, 500, err.message);
        }
    }

    // ⭐ BULK SAVE entire week
    static async saveBulk(req, res) {
        try {
            const list = req.body;

            if (!Array.isArray(list) || list.length === 0) {
                return AccessController.send(res, 400, "Invalid payload");
            }

            await DutyWeeklyScheduleService.saveBulk(list);

            return AccessController.send(res, 200, "Week schedule saved");

        } catch (err) {
            return AccessController.send(res, 500, err.message);
        }
    }


    // OLD single-day save (still exists but unused)
    static async save(req, res) {
        try {
            const { employee_id, month, week, weekday, is_off, duty_start, duty_end } = req.body;

            await DutyWeeklyScheduleService.save(
                employee_id, month, week, weekday, is_off, duty_start, duty_end
            );

            return AccessController.send(res, 200, "Weekly schedule saved");
        } catch (err) {
            return AccessController.send(res, 500, err.message);
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { employee_id, month, week, weekday, is_off, duty_start, duty_end } = req.body;

            await DutyWeeklyScheduleService.update(
                id,
                employee_id,
                month,
                week,
                weekday,
                is_off,
                duty_start,
                duty_end
            );

            return AccessController.send(res, 200, "Weekly schedule updated");
        } catch (err) {
            return AccessController.send(res, 500, err.message);
        }
    }

    static async delete(req, res) {
        try {
            await DutyWeeklyScheduleService.delete(req.params.id);
            return AccessController.send(res, 200, "Weekly schedule deleted");
        } catch (err) {
            return AccessController.send(res, 500, err.message);
        }
    }
}

export default DutyWeeklyScheduleController;
