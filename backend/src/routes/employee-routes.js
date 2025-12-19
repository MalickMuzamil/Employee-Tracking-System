import express from "express";
import EmployeeController from "../controller/employee-controller.js";
import { uploadEmployeeImage } from "../middleware/employee-upload.js";

const router = express.Router();

router.get("/", EmployeeController.getAll);
router.post("/", uploadEmployeeImage, EmployeeController.create);
router.patch("/:id", uploadEmployeeImage, EmployeeController.update);
router.delete("/:id", EmployeeController.remove);

export default router;
