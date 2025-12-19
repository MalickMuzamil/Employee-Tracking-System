import express from "express";
import ShiftController from "../controller/shift-controller.js";

const router = express.Router();

router.post("/", ShiftController.add);
router.delete("/:id", ShiftController.remove);

export default router;
