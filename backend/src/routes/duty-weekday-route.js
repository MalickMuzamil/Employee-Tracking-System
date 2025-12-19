import express from "express";
import DutyWeeklyScheduleController from "../controller/duty-weekday-controller.js";

const router = express.Router();

router.get("/:employee_id/:month/:week", DutyWeeklyScheduleController.getByEmployeeMonthWeek);
router.post("/", DutyWeeklyScheduleController.save);
router.patch("/:id", DutyWeeklyScheduleController.update);
router.delete("/:id", DutyWeeklyScheduleController.delete);
router.post("/bulk", DutyWeeklyScheduleController.saveBulk);

export default router;
