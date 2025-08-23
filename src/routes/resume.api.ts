import express from "express";
import resumeController from "@controllers/resume.controller";
import {uploadPdf, pdfToText} from "@middlewares/upload";
const router = express.Router();
// userId 받아오는 미들웨어 추가 예정
// 새 Resume 생성 (섹션별 입력)
router.post("/new/sections", resumeController.createNewResumeWithSections);

// 새 Resume 생성
router.post("/new", uploadPdf, pdfToText, resumeController.createNewResume);

// Resume 조회
router.get("/all", resumeController.getUserResumes);
router.get("/:id", resumeController.getResumeById);

// Resume 수정
router.put("/:id", resumeController.updateResumeTitle);
router.put("/:id/star", resumeController.toggleStarred);

// Resume에 아이템 추가 (통합)
router.post("/:id/item", resumeController.addItemToResume);

// Session 제목 수정 (resumeId, sessionKey)
router.put("/:id/session/:sessionKey", resumeController.updateSessionTitle);

// 특정 Item 수정 (resumeId, sessionKey, itemIndex)
router.put("/:id/session/:sessionKey/item/:itemIndex", resumeController.updateItem);

// Resume 전체 삭제 (resumeId)
router.delete("/:id", resumeController.deleteResume);

// Session 내 모든 items 삭제 (resumeId, sessionKey)
router.delete("/:id/session/:sessionKey", resumeController.deleteSession);

export default router;