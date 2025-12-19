import express from "express";
import AuthController from "../controller/auth-controller.js";

const router = express.Router();

router.post("/signup", (req, res) => AuthController.signup(req, res));
router.post("/login", (req, res) => AuthController.login(req, res));

export default router;
