import express from "express";
import geminiController from "@controllers/gemini.controller";

const router = express.Router();

router.post("/", geminiController.generateContent);
router.post("/review", geminiController.generateReview);

export default router;
