import express from "express";
import resumeController from "@controllers/resume.controller";
import {uploadPdf, pdfToText} from "@middlewares/upload";
import { authenticate } from "@middlewares/auth.middleware";
const router = express.Router();

// 새 Resume 생성 (섹션별 입력) 섹션 나누는 기능 생기면 변경 예정
router.post("/new/sections", authenticate, resumeController.createNewResumeWithSections);

// 새 Resume 생성
router.post("/new", authenticate, uploadPdf, pdfToText, resumeController.createNewResume);

// Resume 조회
router.get("/all", authenticate, resumeController.getUserResumes);
router.get("/:id", authenticate, resumeController.getResumeById);

// 즐겨찾기 수정
router.put("/:id/star", authenticate, resumeController.toggleStarred);

// Resume 수정
router.patch("/:id", authenticate, resumeController.patchResume);

// session 삭제
router.delete("/:id/session/:sessionKey", authenticate, resumeController.deleteSession);

// Resume 삭제 (resumeId)
router.delete("/:id", authenticate, resumeController.deleteResume);

export default router;