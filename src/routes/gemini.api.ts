import express from "express";
import geminiController from "@controllers/gemini.controller";

const router = express.Router();

router.post("/", geminiController.generateContent);
export default router;
