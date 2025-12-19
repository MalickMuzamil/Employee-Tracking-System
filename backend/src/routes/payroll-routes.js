import express from "express";
import PayrollController from "../controller/payroll-controller.js";

const router = express.Router();

router.post("/generate", (req, res) => PayrollController.generate(req, res));

export default router;
