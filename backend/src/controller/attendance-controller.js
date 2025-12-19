import AttendanceService from "../services/attendance-service.js";
import AccessController from "./access-controller.js";

class AttendanceController {

  // ----------------------------------
  // CHECK-IN
  // ----------------------------------
  static async checkIn(req, res) {
    try {
      const { employee_id } = req.body;

      const today = await AttendanceService.getTodayStatus(employee_id);

      // OFF DAY
      if (today.is_off === 1) {
        return AccessController.send(res, 400, "Cannot check-in on OFF day");
      }

      // Already checked in
      if (today.check_in) {
        return AccessController.send(res, 400, "Already checked-in today");
      }

      await AttendanceService.checkIn(employee_id);

      return AccessController.send(res, 200, "Checked-in successfully");

    } catch (err) {
      return AccessController.send(res, 500, err.message);
    }
  }

  // ----------------------------------
  // CHECK-OUT
  // ----------------------------------
  static async checkOut(req, res) {
    try {
      const { employee_id } = req.body;

      const today = await AttendanceService.getTodayStatus(employee_id);

      if (!today || !today.check_in) {
        return AccessController.send(res, 400, "No check-in found");
      }

      if (today.check_out) {
        return AccessController.send(res, 400, "Already checked-out today");
      }

      const checkIn = new Date(today.check_in);
      const checkOut = new Date();

      let diffMs = checkOut - checkIn;

      if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000; // midnight fix

      const hours = (diffMs / (1000 * 60 * 60)).toFixed(2);

      await AttendanceService.checkOut(today.id, hours);

      return AccessController.send(res, 200, "Checked-out successfully");

    } catch (err) {
      return AccessController.send(res, 500, err.message);
    }
  }

  // ----------------------------------
  // TODAY STATUS
  // ----------------------------------
  static async todayStatus(req, res) {
    try {
      const employee_id = req.params.id;

      const data = await AttendanceService.getTodayStatus(employee_id);

      return AccessController.send(res, 200, "Today's status", data);
    }
    catch (err) {
      return AccessController.send(res, 500, err.message);
    }
  }

  // ----------------------------------
  // ADMIN DAILY ATTENDANCE LIST
  // ----------------------------------
  static async adminAttendance(req, res) {
    try {
      const { date } = req.query;

      if (!date) {
        return AccessController.send(res, 400, "Date is required");
      }

      const data = await AttendanceService.getAdminAttendance(date);

      return AccessController.send(res, 200, "Admin attendance list", data);

    } catch (err) {
      return AccessController.send(res, 500, err.message);
    }
  }

}

export default AttendanceController;
