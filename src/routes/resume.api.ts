import express from "express";
import resumeController from "@controllers/resume.controller";
import {uploadPdf, pdfToText} from "@middlewares/upload";
const router = express.Router();

router.post("/", uploadPdf, pdfToText, resumeController.textUpload);

router.get("/", resumeController.getResume);

export default router;

