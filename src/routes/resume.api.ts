import express from "express";
import resumeController from "@controllers/resume.controller";
import {uploadPdf, pdfToText} from "@middlewares/upload";
const router = express.Router();
// userId 받아오는 미들웨어 추가 예정
// Resume 생성
router.post("/", uploadPdf, pdfToText, resumeController.textUpload);

// 사용자의 모든 Resume 목록 조회
router.get("/all", resumeController.getUserResumes);

// 특정 Resume 상세 조회 (resumeId)
router.get("/:id", resumeController.getResumeById);

// Resume title 수정 (resumeId)
router.put("/:id", resumeController.updateResumeTitle);

// 특정 Item 수정 (resumeId, sessionKey, itemIndex)
router.put("/:id/session/:sessionKey/item/:itemIndex", resumeController.updateItem);

// Resume 전체 삭제 (resumeId)
router.delete("/:id", resumeController.deleteResume);

// Session 내 모든 items 삭제 (resumeId, sessionKey)
router.delete("/:id/session/:sessionKey", resumeController.deleteSession);

// 특정 Item 삭제 (resumeId, sessionKey, itemIndex)
router.delete("/:id/session/:sessionKey/item/:itemIndex", resumeController.deleteItem);

export default router;

