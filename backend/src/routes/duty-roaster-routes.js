import express from "express";
import DutyToasterController from "../controller/duty-roaster-controller.js";

const router = express.Router();

router.get("/", (req, res) => DutyToasterController.getAll(req, res));
router.post("/monthly/bulk", (req, res) => DutyToasterController.saveMonthlyBulk(req, res));
router.get("/monthly/:empId/:month", (req, res) => DutyToasterController.getMonthlyByEmployee(req, res));


export default router;
