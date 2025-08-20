import { Router } from "express";
import geminiApi from "@routes/gemini.api";
import resumeApi from "@routes/resume.api";
const router = Router();

router.use("/gemini", geminiApi);

router.use("/resume",resumeApi);

export default router;
