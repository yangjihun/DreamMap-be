import { Router } from "express";
import userController from "@controllers/user.controller";

const router: Router = Router();

router.post("/", userController.createUser);

export default router;