import roadmapController from "@controllers/roadmap.controller";
import express from "express";

const router = express.Router();

router.post("/:id", roadmapController.createRoadmap);
router.get("/:id", roadmapController.getRoadmap);
router.put(
  "/:resumeId/resource/:resourceId/state",
  roadmapController.toggleComplete
);

export default router;
