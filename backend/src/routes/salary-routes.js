import express from "express";
import SalaryController from "../controller/salary-controller.js";

const router = express.Router();

router.post("/", SalaryController.add);

router.get("/history/:id", SalaryController.history);

router.delete("/:id", SalaryController.remove);

export default router;
