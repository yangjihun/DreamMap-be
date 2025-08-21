"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const resume_controller_1 = __importDefault(require("@controllers/resume.controller"));
const upload_1 = require("@middlewares/upload");
const router = express_1.default.Router();
router.post("/", upload_1.uploadPdf, upload_1.pdfToText, resume_controller_1.default.textUpload);
router.get("/", resume_controller_1.default.getResume);
exports.default = router;
//# sourceMappingURL=resume.api.js.map