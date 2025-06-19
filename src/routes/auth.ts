import { AuthController } from "../controllers/authController";
import { Router } from "express";

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/refresh-token", AuthController.refreshToken);

export default router;
