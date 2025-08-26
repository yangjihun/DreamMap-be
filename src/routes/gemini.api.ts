import express from "express";
import geminiController from "@controllers/gemini.controller";

const router = express.Router();

router.post("/roadmap", geminiController.generateRoadmapContent);
router.post("/review/:id", geminiController.generateReview);
router.post("/generate/:id", geminiController.generateResume);

export default router;
