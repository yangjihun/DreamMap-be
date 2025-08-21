import { Router } from "express";
import { validate } from "@middlewares/validate.middleware";
import { signUpSchema  } from "@dto/auth.dto";
import userController from "@controllers/user.controller";
import authController from "@controllers/auth.controller";

const router = Router();

router.post("/login", authController.loginWithEmail);
router.post("/signup", validate(signUpSchema), userController.createUser);
export default router;
