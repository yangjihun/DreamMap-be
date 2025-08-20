import express from "express";
import resumeController from "@controllers/resume.controller";
const router = express.Router();

router.post("/", resumeController.textUpload);

// router.get("/", getResume);

export default router;

