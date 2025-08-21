import multer from "multer";
import { Request, Response, NextFunction } from "express";
const pdfParse = require("pdf-parse");

export const uploadPdf = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: 20 * 1024 * 1024},
}).single("file");

export async function pdfToText(req: Request, res: Response, next: NextFunction) {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) return next();
    const isPdf = file.mimetype === 'application/pdf' || /\.pdf$/i.test(file.originalname || "");
    if (!isPdf) {
        throw new Error('PDF 파일만 업로드 가능합니다');
    }
    const parsed = await pdfParse(file.buffer);
    const text = (parsed?.text || "").trim();

    if (!text) {
        throw new Error('pdf에서 text를 추출하지 못했습니다');
    }

    if (!req.body) (req as any).body = {};
    req.body.text = req.body.text || text;
    // 파일명을 기본 제목으로 설정 (필요 시)
    req.body.itemTitle = req.body.itemTitle || `PDF: ${file.originalname ?? "uploaded.pdf"}`;

    return next();
  } catch (error: any) {
    return res.status(400).json({status:'fail', error: error.message});
  }
};

export default pdfToText;