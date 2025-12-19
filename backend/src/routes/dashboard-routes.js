import express from "express";
import DashboardController from "../controller/dashboard-controller.js";

const router = express.Router();

router.get("/stats", DashboardController.getStats);
router.get("/report", DashboardController.generateReport);

export default router;
