import { Router } from "express";
import { validate } from "@middlewares/validate.middleware";
import { signUpSchema, loginSchema } from "@dto/auth.dto";
import authController from "@controllers/auth.controller";

const router = Router();

router.post("/login", validate(loginSchema), authController.loginWithEmail);
router.post("/signup", validate(signUpSchema), authController.register);

export default router;
