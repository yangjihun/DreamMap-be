import { Request, Response } from "express";
import Resume from "@models/Resume";
const pdfParse = require('pdf-parse');

type SectionKey = 'intro' | 'body' | 'closing';
type AuthedRequest = Request & {userId: string};

const titleMap: Record<SectionKey, string> = {
  intro: "도입부",
  body: "본문",
  closing: "마무리",
};

// 섹션을 3개로
function threeSessions(resume: any) {
  (['intro', 'body', 'closing'] as SectionKey[]).forEach((key) => {
    const exists = resume.sessions?.some((s: any) => s.key === key);
    if (!exists) {
      resume.sessions.push({key, title: titleMap[key], items: [], wordCount: 0})
    }
  });
}

const resumeController = {
  textUpload: async (req: Request, res: Response) => {
    try {
      // const {userId} = req as Request & {userId: string};
      const userId = "66c3c1a9f53a8f0a6d2a7c11";
    
        const {
          text,
          sessionKey,
          itemTitle = "title",
          startDate,
          endDate,
          review,
        } = req.body as {
          text: string;
          sessionKey: 'intro' | 'body' | 'closing';
          itemTitle?: string;
          startDate?: string;
          endDate?: string;
          review?: string;
        };
        if (!text) {
          throw new Error('text를 입력하지 않았습니다');
        }

        if (!['intro','body','closing'].includes(sessionKey)) {
          throw new Error('sessionKey가 intro|body|closing 이 아닙니다');
        }

        let resume = await Resume.findOne({userId});
        if (!resume) {
          resume = new Resume({userId, title: 'title', sessions: []});
          await resume.save();
        }
        threeSessions(resume);

        let target = resume.sessions.find((s: any) => s.key === sessionKey);
        if (!target) {
          target = {key: sessionKey, title: titleMap[sessionKey], items: [], wordCount: 0};
          resume.sessions.push(target);
        }
        target.items.push({title: itemTitle, text, startDate, endDate, review});
        
        await resume.save();
        res.status(200).json({ status:'success', data:text});
    } catch(error: any) {
        res.status(400).json({status:'fail',error:error.message});
    }
  },

  getResumeById: async (req: Request, res: Response) => {
    try {
        const resumeId = req.params.id;
        const resumeDoc = await Resume.findById(resumeId);
        if (!resumeDoc) {
          return res.status(404).json({status:'fail', error:'Resume not found'});
        }
        res.status(200).json({status: "success", data: resumeDoc});
    } catch(error: any) {
      res.status(400).json({status:'fail',error:error.message});
    }
  },

  getUserResumes: async (req: Request, res: Response) => {
    try {        
        // const {userId} = req as Request & {userId: string};
        const userId = "66c3c1a9f53a8f0a6d2a7c11";
        const resumeDocs = await Resume.find({userId});
        res.status(200).json({status: "success", data: resumeDocs});
    } catch(error: any) {
      res.status(400).json({status:'fail',error:error.message});
    }
  }
};

export default resumeController;