import roadmapController from "@controllers/roadmap.controller";
import express from "express";

const router = express.Router();

router.post("/:id", roadmapController.createRoadmap);

export default router;
