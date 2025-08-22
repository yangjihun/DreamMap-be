import express from "express";
import resumeController from "@controllers/resume.controller";
import {uploadPdf, pdfToText} from "@middlewares/upload";
const router = express.Router();

// Resume 생성/업로드
router.post("/", uploadPdf, pdfToText, resumeController.textUpload);

// 사용자의 모든 Resume 목록 조회 (추후 다중 Resume 지원시)
router.get("/all", resumeController.getUserResumes);

// 특정 Resume 상세 조회 (resumeId로)
router.get("/:id", resumeController.getResumeById);

export default router;

