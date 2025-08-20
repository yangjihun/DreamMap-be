import { Router } from "express";
import geminiApi from "@routes/gemini.api";
const router = Router();

router.use("/gemini", geminiApi);
export default router;
