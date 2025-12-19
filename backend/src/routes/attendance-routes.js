import express from "express";
import AttendanceController from "../controller/attendance-controller.js";

const router = express.Router();

router.post("/checkin", (req, res) => AttendanceController.checkIn(req, res));
router.post("/checkout", (req, res) => AttendanceController.checkOut(req, res));
router.get("/today/:id", (req, res) => AttendanceController.todayStatus(req, res));

router.get("/admin", (req, res) => AttendanceController.adminAttendance(req, res));

export default router;