import { Request, Response, NextFunction  } from "express";
import Resume from "@models/Resume";
import azureService from "@services/azure.service";
import geminiService from "@services/gemini.service";
import { constrainedMemory } from "process";

function ensureSession(resume: any, key: string, defaultTitle?: string) {
  let session = resume.sessions.find((s: any) => s.key === key);
  if (!session) {
    session = { key, title: defaultTitle ?? key, items: [], wordCount: 0 };
    resume.sessions.push(session);
  }
  return session;
}

function sanitizeItem(item: any) {
  return {
    title: String(item?.title ?? "새 항목"),
    text: String(item?.text ?? ""),
    startDate: item?.startDate || undefined,
    endDate: item?.endDate || undefined,
    review: item?.review || undefined,
    companyAddress: item?.companyAddress || undefined,
  };
}

function calculateTotalCount(sessions: any[]): number {
  return sessions.reduce((total, session) => total + (session.wordCount || 0), 0);
}

function sanitizeSession(s: any) {
  const key = String(s?.key ?? "");
  const title = String(s?.title ?? key);
  const items = Array.isArray(s?.items) ? s.items.map(sanitizeItem) : [];
  const wordCount = items.reduce((a: number, it: { text?: string }) => {
    const cleanText = it.text?.replace(/^•\s*/gm, "").trim() || "";
    return a + cleanText.length;
  }, 0);
  return { key, title, items, wordCount };
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const resumeController = {
  patchResume: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { title, starred, score, sessions, replaceSessions } = req.body ?? {};

      const resume = await Resume.findById(id);
      if (!resume) throw new Error("Resume not found");

      if (typeof title !== "undefined") resume.title = String(title);
      if (typeof starred === "boolean") resume.starred = starred;
      if (typeof score === "number") resume.score = score;

      if (Array.isArray(sessions)) {
        if (replaceSessions) {
          (resume as any).sessions = (sessions as any[]).map(sanitizeSession) as any;
        } else {
          for (const s of sessions) {
            const key = String(s?.key ?? "");
            if (!key) continue;
            const session = ensureSession(resume, key, s?.title);
            if (typeof s?.title !== "undefined") {
              session.title = String(s.title);
            }
            if (Array.isArray(s?.items)) {
              session.items = s.items.map(sanitizeItem);
              session.wordCount = session.items.reduce(
                (a: number, it: { text?: string }) => {
                  const cleanText = it.text?.replace(/^•\s*/gm, "").trim() || "";
                  return a + cleanText.length;
                },
                0
              );
            }
          }
        }
        resume.totalCount = calculateTotalCount(resume.sessions);
      }

      await resume.save();
      return res.status(200).json({ status: "success", data: resume });
    } catch (error: any) {
      return res.status(400).json({ status: "fail", error: error.message });
    }
  },

  deleteSession: async (req: Request, res: Response) => {
    try {
      const { id, sessionKey } = req.params as { id: string; sessionKey: string };
      const resume = await Resume.findById(id);
      if (!resume) throw new Error("Resume not found");
      const before = resume.sessions.length;
      resume.sessions = resume.sessions.filter((s: any) => s.key !== sessionKey);
      if (resume.sessions.length === before) throw new Error("Session not found");
      resume.totalCount = calculateTotalCount(resume.sessions);
      
      await resume.save();
      return res.status(200).json({ status: "success", data: resume });
    } catch (error: any) {
      return res.status(400).json({ status: "fail", error: error.message });
    }
  },
  createNewResumeWithSections: async (req: Request, res: Response) => {
    try {
      const userId = (req as Request & { userId?: string }).userId;
      const { resumeTitle = "새 이력서", sections } = req.body;

      if (!Object.values(sections || {}).some((s: any) => 
        Array.isArray(s?.items) && s.items.some((item: any) => item?.text?.trim())
      )) {
        throw new Error("섹션 내용을 입력해야 합니다");
      }

      const resume = new Resume({ userId, title: resumeTitle, sessions: [] });

      Object.entries(sections || {}).forEach(([key, sectionData]: [string, any]) => {
        if (sectionData?.title?.trim() && Array.isArray(sectionData.items) && sectionData.items.length > 0) {
          const validItems = sectionData.items.filter((item: any) => item?.text?.trim());
          
          if (validItems.length > 0) {
            const session = {
              key,
              title: sectionData.title.trim(),
              items: validItems.map((item: any) => ({
                title: item.title?.trim() || "새 항목",
                text: item.text.trim(),
                startDate: item.startDate || undefined,
                endDate: item.endDate || undefined,
                review: undefined,
                companyAddress: item.companyAddress || undefined,
              })),
              wordCount: validItems.reduce((acc: number, item: any) => {
                const cleanText = item.text?.replace(/^•\s*/gm, "").trim() || "";
                return acc + cleanText.length;
              }, 0),
            };
            resume.sessions.push(session);
          }
        }
      });
      resume.totalCount = calculateTotalCount(resume.sessions);
      await resume.save();
      res.status(200).json({ status: "success", data: resume });
    } catch (error: any) {
      return res.status(400).json({ status: "fail", error: error.message });
    }
  },

  createNewResume: async (req: Request, res: Response) => {
    try {
      const {
        text,
        sessionKey,
        itemTitle = "title",
        startDate,
        endDate,
        review,
        resumeTitle = "새 이력서",
      } = req.body;

      const userId = (req as Request & { userId?: string }).userId;
      if (!text?.trim()) throw new Error("text를 입력하지 않았습니다");

      const resume = new Resume({ userId, title: resumeTitle, sessions: [] });
      const key = (sessionKey || "general").trim();

      const newItem = {
        title: itemTitle,
        text,
        startDate,
        endDate,
        review,
        companyAddress: req.body.companyAddress,
      };

      let session = resume.sessions.find((s: any) => s.key === key);

      if (!session) {
        session = {
          key,
          title: itemTitle || key,
          items: [newItem],
          wordCount: text.replace(/^•\s*/gm, "").trim().length,
        };
        resume.sessions.push(session);
      } else {
        session.items.push(newItem);
        session.wordCount = session.items.reduce(
          (a: number, it: { text?: string }) => {
            const cleanText = it.text?.replace(/^•\s*/gm, "").trim() || "";
            return a + cleanText.length;
          },
          0
        );
      }
      
      resume.totalCount = calculateTotalCount(resume.sessions);
      
      await resume.save();
      res.status(200).json({ status: "success", data: resume });
    } catch (error: any) {
      return res.status(400).json({ status: "fail", error: error.message });
    }
  },

  getResumeById: async (req: Request, res: Response) => {
    try {
      const resume = await Resume.findById(req.params.id);
      if (!resume) throw new Error("Resume not found");
      res.status(200).json({ status: "success", data: resume });
    } catch (error: any) {
      return res.status(400).json({ status: "fail", error: error.message });
    }
  },

  getUserResumes: async (req: Request, res: Response) => {
    try {
      const userId = (req as Request & { userId?: string }).userId;
      const name = req.query.name as string | undefined;
      const cond: any = {};
      if (name && name.trim()) {
      const re = new RegExp(escapeRegex(name), "i");
      cond.title = re;
    }
      if (userId) cond.userId = userId;
      let resumes = await Resume.find(cond);
      res.status(200).json({ status: "success", data: resumes });
    } catch (error: any) {
      return res.status(400).json({ status: "fail", error: error.message });
    }
  },

  deleteResume: async (req: Request, res: Response) => {
    try {
      const deleted = await Resume.findByIdAndDelete(req.params.id);
      if (!deleted) throw new Error("Resume not found");
      res
        .status(200)
        .json({ status: "success", message: "Resume deleted successfully" });
    } catch (error: any) {
      return res.status(400).json({ status: "fail", error: error.message });
    }
  },

  toggleStarred: async (req: Request, res: Response) => {
    try {
      const resume = await Resume.findById(req.params.id);
      if (!resume) throw new Error("Resume not found");

      resume.starred = !resume.starred;
      await resume.save();
      res.status(200).json({
        status: "success",
        data: { id: req.params.id, starred: resume.starred },
      });
    } catch (error: any) {
      return res.status(400).json({ status: "fail", error: error.message });
    }
  },

  // createFromPdf: async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const { parsedSections, resumeTitle } = req.body;
  //     const userId = (req as any).userId;

  //     if (!parsedSections || !resumeTitle || !userId) {
  //       return next(new AppError('분석된 데이터, 제목, 사용자 정보가 필요합니다.', 400));
  //     }

  //     // 1. 실제 로직은 서비스에 위임합니다.
  //     const newResume = await resumeService.createFromPdf(userId, resumeTitle, parsedSections);

  //     // 2. 컨트롤러는 성공 응답만 보냅니다.
  //     res.status(201).json({ status: 'success', data: newResume.toJSON() });

  //   } catch (error) {
  //     return next(error);
  //   }
  // },

  createResumeFromPdf: async (req: Request, res: Response) => {
    try {
      const userId = (req as Request & { userId?: string }).userId;
      const file = req.file; // multer와 같은 미들웨어가 파일을 req.file에 담아준다고 가정
  
      if (!userId) {
        return res
          .status(401)
          .json({ status: "fail", message: "인증이 필요합니다." });
      }
  
      if (!file) {
        return res
          .status(400)
          .json({ status: "fail", message: "PDF 파일이 필요합니다." });
      }
  
      // 1. 수정된 Azure 서비스를 호출하여 PDF에서 전체 텍스트를 추출합니다.
      console.log("1. Analyzing PDF with Azure AI...");
      const fullText = await azureService.analyzePdfLayout(file.buffer);
      console.log("2. PDF analysis complete. Extracted text.");
  
      // 2. 추출된 텍스트를 신규 Gemini 서비스에 전달하여 이력서를 생성하고 저장합니다.
      console.log("3. Generating resume from text with Gemini AI...");
      const newResume = await geminiService.createResumeFromText(fullText, userId);
      console.log("4. Resume generation complete.");
  
      // 3. 생성된 이력서 데이터를 클라이언트에 반환합니다.
      return res.status(201).json({ status: "success", data: newResume });
    } catch (error: any) {
      console.error("Error creating resume from PDF:", error);
      res.status(500).json({ status: "fail", message: error.message });
    }
  }  
};

export default resumeController;