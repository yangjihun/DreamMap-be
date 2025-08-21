"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Resume = require("@models/Resume");
const pdfParse = require('pdf-parse');
const titleMap = {
    intro: "도입부",
    body: "본문",
    closing: "마무리",
};
// 섹션을 3개로
function threeSessions(resume) {
    ['intro', 'body', 'closing'].forEach((key) => {
        var _a;
        const exists = (_a = resume.sessions) === null || _a === void 0 ? void 0 : _a.some((s) => s.key === key);
        if (!exists) {
            resume.sessions.push({ key, title: titleMap[key], items: [], wordCount: 0 });
        }
    });
}
const resumeController = {
    textUpload: async (req, res) => {
        try {
            // const {userId} = req as Request & {userId: string};
            const userId = "66c3c1a9f53a8f0a6d2a7c11";
            const { text, sessionKey, itemTitle = "title", startDate, endDate, review, } = req.body;
            if (!text) {
                throw new Error('text를 입력하지 않았습니다');
            }
            if (!['intro', 'body', 'closing'].includes(sessionKey)) {
                throw new Error('sessionKey가 intro|body|closing 이 아닙니다');
            }
            let resume = await Resume.findOne({ userId });
            if (!resume) {
                resume = new Resume({ userId, title: 'title', sessions: [] });
                await resume.save();
            }
            threeSessions(resume);
            const session = resume.sessions.find((i) => i.key === sessionKey);
            if (!session) {
                resume.sessions.push({ key: sessionKey, title: sessionKey, items: [], wordCount: 0 });
            }
            const target = resume.sessions.find((s) => s.key === sessionKey);
            target.items.push({ title: itemTitle, text, startDate, endDate, review });
            await resume.save();
            res.status(200).json({ status: 'success', data: text });
        }
        catch (error) {
            res.status(400).json({ status: 'fail', error: error.message });
        }
    },
    // uploadPdf: async (req: Request, res: Response) => {
    //   try{
    //     const {userId} = req as Request & {userId: string};
    //     const file = (req as any).file as Express.Multer.File | undefined;
    //     const {sessionKey = "body", itemTitle = "PDF에서 추출한 텍스트"} = req.body as {
    //       sessionKey?: 'intro' | 'body' | 'closing';
    //       itemTitle?:string;
    //     };
    //     if (!file) {
    //       throw new Error('file이 없습니다');
    //     }
    //     // text 추출
    //     const parsed = await pdfParse(file.buffer);
    //     const text: string = parsed?.text?.trim() || '';
    //     if (!text) {
    //       throw new Error('pdf에서 텍스트를 추출하지 못했습니다.');
    //     }
    //     let resume = await Resume.findOne({userId});
    //   } catch (error: any) {
    //     res.status(400).json({status:'fail', error:error.message});
    //   }
    // },
    getResume: async (req, res) => {
        try {
            const { userId } = req;
            const resumeDoc = await Resume.findOne({ userId });
            res.status(200).json({ status: "success", data: resumeDoc });
        }
        catch (error) {
            res.status(400).json({ status: 'fail', error: error.message });
        }
    }
};
exports.default = resumeController;
//# sourceMappingURL=resume.controller.js.map