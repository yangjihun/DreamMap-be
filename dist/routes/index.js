"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gemini_api_1 = __importDefault(require("@routes/gemini.api"));
const resume_api_1 = __importDefault(require("@routes/resume.api"));
const router = (0, express_1.Router)();
router.use("/gemini", gemini_api_1.default);
router.use("/resume", resume_api_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map