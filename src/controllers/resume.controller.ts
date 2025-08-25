import { Request, Response } from "express";
import Resume from "@models/Resume";

type SectionKey = 'intro' | 'body' | 'closing';

const titleMap: Record<SectionKey, string> = {
  intro: "도입부",
  body: "본문", 
  closing: "마무리",
};

const validateSessionKey = (sessionKey: string) => {
  if (!['intro', 'body', 'closing'].includes(sessionKey)) {
    throw new Error('sessionKey가 intro|body|closing 이 아닙니다');
  }
  return sessionKey as SectionKey;
};

const validateText = (text: string) => {
  if (!text?.trim()) {
    throw new Error('text를 입력하지 않았습니다');
  }
};

const handleError = (res: Response, error: any) => {
  res.status(400).json({status: 'fail', error: error.message});
};

const handleNotFound = (res: Response, message: string) => {
  res.status(404).json({status: 'fail', error: message});
};

const threeSessions = (resume: any) => {
  (['intro', 'body', 'closing'] as SectionKey[]).forEach((key) => {
    if (!resume.sessions?.some((s: any) => s.key === key)) {
      resume.sessions.push({key, title: titleMap[key], items: [], wordCount: 0});
    }
  });
};

const resumeController = {
  createNewResumeWithSections: async (req: Request, res: Response) => {
    try {
      const userId = (req as Request & { userId?: string }).userId;
      const { resumeTitle = "새 이력서", sections } = req.body;
      
      if (!Object.values(sections || {}).some((s: any) => s?.text?.trim())) {
        throw new Error('적어도 하나의 섹션에는 내용을 입력해야 합니다');
      }

      const resume = new Resume({ userId, title: resumeTitle, sessions: [] });
      threeSessions(resume);

      Object.entries(sections || {}).forEach(([key, content]: [string, any]) => {
        if (content?.text?.trim()) {
          const session = resume.sessions.find((s: any) => s.key === key);
          if (session) {
            session.items.push({
              title: content.title || "title",
              text: content.text,
              startDate: undefined,
              endDate: undefined,
              review: undefined
            });
          }
        }
      });
      
      await resume.save();
      res.status(200).json({ status: 'success', data: resume });
    } catch(error: any) {
      handleError(res, error);
    }
  },

  createNewResume: async (req: Request, res: Response) => {
    try {
      const { text, sessionKey, itemTitle = "title", startDate, endDate, review, resumeTitle = "새 이력서" } = req.body;
      const userId = (req as Request & { userId?: string }).userId;
      validateText(text);
      validateSessionKey(sessionKey);

      const resume = new Resume({ userId, title: resumeTitle, sessions: [] });
      threeSessions(resume);

      const target = resume.sessions.find((s: any) => s.key === sessionKey);
      target?.items.push({title: itemTitle, text, startDate, endDate, review});
      
      await resume.save();
      res.status(200).json({ status: 'success', data: resume });
    } catch(error: any) {
      handleError(res, error);
    }
  },

  getResumeById: async (req: Request, res: Response) => {
    try {
      const resume = await Resume.findById(req.params.id);
      if (!resume) return handleNotFound(res, 'Resume not found');
      res.status(200).json({status: "success", data: resume});
    } catch(error: any) {
      handleError(res, error);
    }
  },

  getUserResumes: async (req: Request, res: Response) => {
    try {
      const userId = (req as Request & { userId?: string }).userId;
      const resumes = await Resume.find({userId});
      res.status(200).json({status: "success", data: resumes});
    } catch(error: any) {
      handleError(res, error);
    }
  },

  deleteResume: async (req: Request, res: Response) => {
    try {
      const deleted = await Resume.findByIdAndDelete(req.params.id);
      if (!deleted) return handleNotFound(res, 'Resume not found');
      res.status(200).json({status: "success", message: "Resume deleted successfully"});
    } catch(error: any) {
      handleError(res, error);
    }
  },

  updateResumeTitle: async (req: Request, res: Response) => {
    try {
      const { title } = req.body;
      const updated = await Resume.findByIdAndUpdate(req.params.id, {title}, {new: true});
      if (!updated) return handleNotFound(res, 'Resume not found');
      res.status(200).json({status: "success", data: updated});
    } catch(error: any) {
      handleError(res, error);
    }
  },

  updateItem: async (req: Request, res: Response) => {
    try {
      const { sessionKey, itemIndex } = req.params;
      const index = parseInt(itemIndex);
      const { title, text, startDate, endDate, review } = req.body;
      validateSessionKey(sessionKey);
      
      const resume = await Resume.findById(req.params.id);
      if (!resume) return handleNotFound(res, 'Resume not found');
      
      const session = resume.sessions.find((s: any) => s.key === sessionKey);
      if (!session) return handleNotFound(res, 'Session not found');
      if (index < 0 || index >= session.items.length) return handleNotFound(res, 'Item not found');
      
      const item = session.items[index];
      Object.assign(item, { title, text, startDate, endDate, review });
      
      await resume.save();
      res.status(200).json({status: "success", data: item});
    } catch(error: any) {
      handleError(res, error);
    }
  },

  updateSessionTitle: async (req: Request, res: Response) => {
    try {
      const { sessionKey } = req.params;
      const { title } = req.body;
      validateSessionKey(sessionKey);
      if (!title?.trim()) throw new Error('title이 필요합니다');
      
      const resume = await Resume.findById(req.params.id);
      if (!resume) return handleNotFound(res, 'Resume not found');
      
      const session = resume.sessions.find((s: any) => s.key === sessionKey);
      if (!session) return handleNotFound(res, 'Session not found');
      
      session.title = title.trim();
      await resume.save();
      res.status(200).json({status: "success", data: { sessionKey, title: session.title }});
    } catch(error: any) {
      handleError(res, error);
    }
  },

  toggleStarred: async (req: Request, res: Response) => {
    try {
      const resume = await Resume.findById(req.params.id);
      if (!resume) return handleNotFound(res, 'Resume not found');
      
      resume.starred = !resume.starred;
      await resume.save();
      res.status(200).json({status: "success", data: { id: req.params.id, starred: resume.starred }});
    } catch(error: any) {
      handleError(res, error);
    }
  },

  addItemToResume: async (req: Request, res: Response) => {
    try {
      const { text, sessionKey, itemTitle = "새 항목", startDate, endDate, review } = req.body;
      validateText(text);
      validateSessionKey(sessionKey);

      const resume = await Resume.findById(req.params.id);
      if (!resume) return handleNotFound(res, 'Resume not found');

      threeSessions(resume);
      const session = resume.sessions.find((s: any) => s.key === sessionKey);
      session?.items.push({title: itemTitle, text, startDate, endDate, review});
      
      await resume.save();
      res.status(200).json({ status: 'success', data: resume });
    } catch(error: any) {
      handleError(res, error);
    }
  }
};

export default resumeController;