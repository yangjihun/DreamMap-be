import express from "express";
import resumeController from "@controllers/resume.controller";
import {uploadPdf, pdfToText} from "@middlewares/upload";
import { authenticate } from "@middlewares/auth.middleware";
const router = express.Router();
// userId 받아오는 미들웨어 추가 예정
// 새 Resume 생성 (섹션별 입력) 섹션 나누는 기능 생기면 변경 예정
router.post("/new/sections", authenticate, resumeController.createNewResumeWithSections);

// 새 Resume 생성
router.post("/new", authenticate, uploadPdf, pdfToText, resumeController.createNewResume);

// Resume 조회
router.get("/all", authenticate, resumeController.getUserResumes);
router.get("/:id", authenticate, resumeController.getResumeById);

// Resume 수정
router.put("/:id", authenticate, resumeController.updateResumeTitle);
router.put("/:id/star", authenticate, resumeController.toggleStarred);

// Resume에 아이템 추가
router.post("/:id/item", authenticate, resumeController.addItemToResume);

// Session 제목 수정 (resumeId, sessionKey)
router.put("/:id/session/:sessionKey", authenticate, resumeController.updateSessionTitle);

// 특정 Item 수정 (resumeId, sessionKey, itemIndex)
router.put("/:id/session/:sessionKey/item/:itemIndex", authenticate, resumeController.updateItem);

// Resume 전체 삭제 (resumeId)
router.delete("/:id", authenticate, resumeController.deleteResume);

export default router;