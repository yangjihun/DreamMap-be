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
      },

  // Resume 전체 삭제
  deleteResume: async (req: Request, res: Response) => {
    try {
      const resumeId = req.params.id;
      const deletedResume = await Resume.findByIdAndDelete(resumeId);
      if (!deletedResume) {
        return res.status(404).json({status:'fail', error:'Resume not found'});
      }
      res.status(200).json({status: "success", message: "Resume deleted successfully"});
    } catch(error: any) {
      res.status(400).json({status:'fail',error:error.message});
    }
  },

  // Resume 기본 정보 수정 (title, score 등)
  updateResumeTitle: async (req: Request, res: Response) => {
    try {
      const resumeId = req.params.id;
      const { title } = req.body;
      
      const updateData: any = {};
      if (title) updateData.title = title;
      
      const updatedResume = await Resume.findByIdAndUpdate(
        resumeId, 
        updateData, 
        { new: true }
      );
      
      if (!updatedResume) {
        return res.status(404).json({status:'fail', error:'Resume not found'});
      }
      res.status(200).json({status: "success", data: updatedResume});
    } catch(error: any) {
      res.status(400).json({status:'fail',error:error.message});
    }
  },

  // Session 삭제 (session의 모든 items 삭제)
  deleteSession: async (req: Request, res: Response) => {
    try {
      const resumeId = req.params.id;
      const sessionKey = req.params.sessionKey as 'intro' | 'body' | 'closing';
      
      if (!['intro','body','closing'].includes(sessionKey)) {
        throw new Error('sessionKey가 intro|body|closing 이 아닙니다');
      }
      
      const resume = await Resume.findById(resumeId);
      if (!resume) {
        return res.status(404).json({status:'fail', error:'Resume not found'});
      }
      
      // 해당 session의 items를 빈 배열로 만들기
      const targetSession = resume.sessions.find((s: any) => s.key === sessionKey);
      if (targetSession) {
        targetSession.items = [];
        targetSession.wordCount = 0;
      }
      
      await resume.save();
      res.status(200).json({status: "success", message: "Session cleared successfully"});
    } catch(error: any) {
      res.status(400).json({status:'fail',error:error.message});
    }
  },

  // 특정 Item 삭제
  deleteItem: async (req: Request, res: Response) => {
    try {
      const resumeId = req.params.id;
      const itemIndex = parseInt(req.params.itemIndex);
      const sessionKey = req.params.sessionKey as 'intro' | 'body' | 'closing';
      
      if (!['intro','body','closing'].includes(sessionKey)) {
        throw new Error('sessionKey가 intro|body|closing 이 아닙니다');
      }
      
      const resume = await Resume.findById(resumeId);
      if (!resume) {
        return res.status(404).json({status:'fail', error:'Resume not found'});
      }
      
      const targetSession = resume.sessions.find((s: any) => s.key === sessionKey);
      if (!targetSession) {
        return res.status(404).json({status:'fail', error:'Session not found'});
      }
      
      if (itemIndex < 0 || itemIndex >= targetSession.items.length) {
        return res.status(404).json({status:'fail', error:'Item not found'});
      }
      
      // 해당 인덱스의 item 삭제
      targetSession.items.splice(itemIndex, 1);
      
      await resume.save();
      res.status(200).json({status: "success", message: "Item deleted successfully"});
    } catch(error: any) {
      res.status(400).json({status:'fail',error:error.message});
    }
  },

  // 특정 Item 수정
  updateItem: async (req: Request, res: Response) => {
    try {
      const resumeId = req.params.id;
      const itemIndex = parseInt(req.params.itemIndex);
      const sessionKey = req.params.sessionKey as 'intro' | 'body' | 'closing';
      const { title, text, startDate, endDate, review } = req.body;
      
      if (!['intro','body','closing'].includes(sessionKey)) {
        throw new Error('sessionKey가 intro|body|closing 이 아닙니다');
      }
      
      const resume = await Resume.findById(resumeId);
      if (!resume) {
        return res.status(404).json({status:'fail', error:'Resume not found'});
      }
      
      const targetSession = resume.sessions.find((s: any) => s.key === sessionKey);
      if (!targetSession) {
        return res.status(404).json({status:'fail', error:'Session not found'});
      }
      
      if (itemIndex < 0 || itemIndex >= targetSession.items.length) {
        return res.status(404).json({status:'fail', error:'Item not found'});
      }
      
      // 해당 인덱스의 item 수정
      const item = targetSession.items[itemIndex];
      if (title !== undefined) item.title = title;
      if (text !== undefined) item.text = text;
      if (startDate !== undefined) item.startDate = startDate;
      if (endDate !== undefined) item.endDate = endDate;
      if (review !== undefined) item.review = review;
      
      await resume.save();
      res.status(200).json({status: "success", data: item});
    } catch(error: any) {
      res.status(400).json({status:'fail',error:error.message});
    }
  }
};

export default resumeController;