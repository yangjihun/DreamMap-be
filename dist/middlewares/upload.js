"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPdf = void 0;
exports.pdfToText = pdfToText;
const multer_1 = __importDefault(require("multer"));
const pdfParse = require("pdf-parse");
exports.uploadPdf = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 },
}).single("file");
async function pdfToText(req, res, next) {
    var _a;
    try {
        const file = req.file;
        if (!file)
            return next();
        const isPdf = file.mimetype === 'application/pdf' || /\.pdf$/i.test(file.originalname || "");
        if (!isPdf) {
            throw new Error('PDF 파일만 업로드 가능합니다');
        }
        const parsed = await pdfParse(file.buffer);
        const text = ((parsed === null || parsed === void 0 ? void 0 : parsed.text) || "").trim();
        if (!text) {
            throw new Error('pdf에서 text를 추출하지 못했습니다');
        }
        if (!req.body)
            req.body = {};
        req.body.text = req.body.text || text;
        // 파일명을 기본 제목으로 설정 (필요 시)
        req.body.itemTitle = req.body.itemTitle || `PDF: ${(_a = file.originalname) !== null && _a !== void 0 ? _a : "uploaded.pdf"}`;
        return next();
    }
    catch (error) {
        return res.status(400).json({ status: 'fail', error: error.message });
    }
}
;
exports.default = pdfToText;
//# sourceMappingURL=upload.js.map