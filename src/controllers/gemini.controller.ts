import { GoogleGenAI, Type } from "@google/genai";
import { Request, Response, NextFunction } from "express";
import geminiService from "@services/gemini.service";
import config from "@config/config";
import {
  roadmapPrompt,
  experienceItemPrompt,
  projectItemPrompt,
  itemPatchPrompt,
  resumeReviewPrompt,
  extractTextToJSON,
  relatedItemPrompt,
} from "@utils/aiPromptMessage";
import { roadmapGeminiSchema } from "@utils/geminiResSchema";
import Resume from "@models/Resume";

const resumeJsonSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    totalCount: { type: "number" },
    score: { type: "number" },
    starred: { type: "boolean" },
    sessions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          key: { type: "string" },
          title: { type: "string" },
          wordCount: { type: "number" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                text: { type: "string" },
                startDate: { type: "string" },
                endDate: { type: "string" },
                review: { type: "string" },
                companyAddress: { type: "string" },
                oldText: { type: "string" },
                degree: { type: "string" },
              },
              required: ["title", "text"],
            },
          },
        },
        required: ["key", "title", "items"],
      },
    },
    status: { type: "string" },
    lastModified: { type: "string" },
    review: { type: "string" },
  },
  required: ["title", "sessions"],
};

const ai = new GoogleGenAI({
  apiKey: config.gemini.apiKey,
});

const geminiController = {
  generateRoadmapContent: async ({
    location,
    interestJob,
  }: {
    location: String;
    interestJob: String;
  }) => {
    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: roadmapPrompt(location, interestJob), // 명령문
      config: {
        thinkingConfig: {
          thinkingBudget: 0, // Disables thinking -> 속도개선
        },
        systemInstruction:
          "당신은 커리어 로드맵 설계와 지역 맞춤 학습자료 큐레이션에 특화된 전문가입니다.",
        responseMimeType: "application/json",
        responseSchema: roadmapGeminiSchema,
      },
    });
    if (!aiResponse.text) throw new Error("AI 응답이 없습니다.");

    const formatData = JSON.parse(aiResponse.text);
    const mappedData = formatData.map((item: any) => ({
      period: item.period,
      paths: item.plan.paths,
    }));
    return mappedData;
  },
  generateReview: async (req: Request, res: Response, next: NextFunction) => {
    try {
      let item;
      let length = 0,
        wordCount = 0;
      const constant = ["Work", "Leadership", "리더십", "경력"];
      const resumeId = req.params.id;
      let resume = await Resume.findById(resumeId);
      if (!resume) {
        throw new Error("resume not found");
      }
      for (let i = 0; i < resume.sessions.length; i++) {
        for (let j = 0; j < resume.sessions[i].items.length; j++) {
          let sessionTitle = resume.sessions[i].title;
          item = resume.sessions[i].items[j];
          length += item.text.length;
          wordCount += item.text.length;
          let prompt;
          if (constant.some((k) => sessionTitle.includes(k))) {
            prompt = experienceItemPrompt(item);
          } else if (sessionTitle === "Project") {
            prompt = projectItemPrompt(item);
          } else if (["관련", "연관"].some((k) => sessionTitle.includes(k))) {
            prompt = relatedItemPrompt(item);
          } else {
            prompt = ""; // fallback
          }
          if (prompt !== "") {
            const aiResponse = await ai.models.generateContent({
              model: "gemini-2.5-flash",
              contents: prompt,
              config: {
                thinkingConfig: {
                  thinkingBudget: 0, // Disables thinking -> 속도개선
                },
              },
            });
            if (aiResponse.text) {
              item.review = aiResponse.text;
              if (item.oldText) item.oldText = undefined;
            }
          }
        }
        resume.sessions[i].wordCount = wordCount;
        wordCount = 0;
      }
      resume.totalCount = length;
      await resume.save();
      next();
    } catch (error: any) {
      res.status(400).json({ status: "fail", message: error.message });
    }
  },
  generateResume: async (req: Request, res: Response) => {
    try {
      const resumeId = req.params.id;
      let item;
      const resume = await Resume.findById(resumeId);
      if (!resume) throw new Error("Resume not found");

      for (let i = 0; i < resume.sessions.length; i++) {
        for (let j = 0; j < resume.sessions[i].items.length; j++) {
          let sessionTitle = resume.sessions[i].title;
          item = resume.sessions[i].items[j];
          if (item.review !== "선택된 항목에 대한 이전 AI 리뷰가 없습니다.") {
            {
              if (!(item.oldText == item.text)) {
                const aiResponse = await ai.models.generateContent({
                  model: "gemini-2.5-flash",
                  contents: itemPatchPrompt(item),
                });
                if (aiResponse.text) {
                  item.oldText = item.text;
                  item.text = aiResponse.text;
                }
              }
            }
          }
        }
        await resume.save();
        return res.status(200).json({ status: "success", data: resume });
      }
    } catch (error: any) {
      res.status(400).json({ status: "fail", message: error.message });
    }
  },
  generateReviewWhole: async (req: Request, res: Response) => {
    try {
      const resumeId = req.params.id;
      const resume = await Resume.findById(resumeId);
      if (!resume) throw new Error("Resume not found");
      const aiResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: resumeReviewPrompt(resume),
        config: {
          thinkingConfig: {
            thinkingBudget: 0, // Disables thinking -> 속도개선
          },
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              review: { type: "string" },
              score: { type: "number" },
            },
            required: ["review", "score"],
            additionalProperties: false,
          },
        },
      });
      if (!aiResponse.text) throw new Error("AI 응답이 없습니다.");

      const formatData = JSON.parse(aiResponse.text);
      resume.review = formatData.review;
      resume.score = formatData.score;
      console.log("review", resume.review);
      await resume.save();

      return res.status(200).json({ status: "success", data: formatData });
    } catch (error: any) {
      res.status(400).json({ status: "fail", message: error.message });
    }
  },
  // generateJSON: async (req: Request, res: Response) => {
  //   try {
  //     const userId = (req as Request & { userId?: string }).userId;
  //     const { text } = req.body;

  //     if (!userId) {
  //       return res
  //         .status(401)
  //         .json({ status: "fail", message: "인증이 필요합니다." });
  //     }

  //     if (!text || text.trim().length === 0) {
  //       return res
  //         .status(400)
  //         .json({ status: "fail", message: "텍스트가 필요합니다." });
  //     }

  //     console.log(
  //       "Generating resume from text:",
  //       text.substring(0, 100) + "..."
  //     );

  //     const aiResponse = await ai.models.generateContent({
  //       model: "gemini-2.5-flash",
  //       contents: extractTextToJSON(text),
  //       config: {
  //         thinkingConfig: {
  //           thinkingBudget: 0, // Disables thinking -> 속도개선
  //         },
  //         responseMimeType: "application/json",
  //         responseSchema: resumeJsonSchema,
  //       },
  //     });

  //     if (!aiResponse.text) throw new Error("AI 응답이 없습니다.");

  //     const parsed = JSON.parse(aiResponse.text);

  //     const resume = new Resume({
  //       ...parsed,
  //       userId,
  //     });

  //     await resume.save();

  //     return res.status(200).json({ status: "success", data: resume });
  //   } catch (error: any) {
  //     console.error("Error in generateJSON:", error);
  //     res.status(400).json({ status: "fail", message: error.message });
  //   }
  // },
  generateJSON: async (req: Request, res: Response) => {
    try {
      const userId = (req as Request & { userId?: string }).userId;
      const { text, resumeTitle } = req.body;

      if (!userId) {
        return res
          .status(401)
          .json({ status: "fail", message: "인증이 필요합니다." });
      }

      // 핵심 로직을 서비스에 위임
      const newResume = await geminiService.createResumeFromText(
        text,
        resumeTitle,
        userId
      );

      return res.status(201).json({ status: "success", data: newResume });
    } catch (error: any) {
      console.error("Error in generateJSON:", error);
      res.status(400).json({ status: "fail", message: error.message });
    }
  },
};

export default geminiController;
