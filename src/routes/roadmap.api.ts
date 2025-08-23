import roadmapController from "@controllers/roadmap.controller";
import express from "express";

const router = express.Router();

router.post("/:id", roadmapController.createRoadmap);
router.get("/:id", roadmapController.getRoadmap);

export default router;
