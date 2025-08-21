import { Router } from "express";
import geminiApi from "@routes/gemini.api";
import userApi from "./user.api";
import authApi from "./auth.api";

const router = Router();

router.use("/gemini", geminiApi);
router.use("/user", userApi);
router.use("/auth", authApi);



export default router;

