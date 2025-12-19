import express from "express";
import DutyOverrideController from "../controller/duty-override-controller.js";

const router = express.Router();

router.get("/", DutyOverrideController.getAll);
router.post("/", DutyOverrideController.create);
router.patch("/:id", DutyOverrideController.update);
router.delete("/:id", DutyOverrideController.delete);
router.get("/:employee_id/:date", DutyOverrideController.getByEmployeeDate);

export default router;