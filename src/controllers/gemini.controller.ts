import { GoogleGenAI, Type } from "@google/genai";
import { Request, Response, NextFunction } from "express";
import config from "@config/config";
import {
  roadmapPrompt,
  introItemPrompt,
  experienceItemPrompt,
  projectItemPrompt,
  skillItemPrompt,
  itemPatchPrompt,
  resumeReviewPrompt,
  degreeItemPrompt,
  extractTextToJSON,
} from "@utils/aiPromptMessage";
import { roadmapGeminiSchema } from "@utils/geminiResSchema";
import Resume from "@models/Resume";

const resumeJsonSchema = {
  type: "object",
  properties: {
    userId: { type: "string" },
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
  required: ["userId", "title", "sessions"],
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
          if (sessionTitle === "Introduction") {
            prompt = introItemPrompt(item);
          } else if (sessionTitle === "Work Experience") {
            prompt = experienceItemPrompt(item);
          } else if (sessionTitle === "Project") {
            prompt = projectItemPrompt(item);
          } else if (sessionTitle === "Skills") {
            prompt = skillItemPrompt(item);
          } else if (sessionTitle === "Degree") {
            prompt = degreeItemPrompt(item);
          } else {
            prompt = introItemPrompt(item); // fallback
          }
          const aiResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              thinkingConfig: {
                thinkingBudget: 0, // Disables thinking -> 속도개선
              },
            },
          });
          item.review = aiResponse.text;
          if (item.oldText) item.oldText = undefined;
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
          if (
            ![
              "Skills",
              "스킬",
              "학력",
              "Education",
              "수상",
              "인증",
              "Award",
              "Certificate",
            ].some((keyword) => sessionTitle.includes(keyword))
          ) {
            item = resume.sessions[i].items[j];
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
      await resume.save();
      return res.status(200).json({ status: "success", data: resume });
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
  generateJSON: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const text = req.body.text;

      const aiResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: extractTextToJSON(text),
        config: {
          thinkingConfig: {
            thinkingBudget: 0, // Disables thinking -> 속도개선
          },
          responseMimeType: "application/json",
          responseSchema: resumeJsonSchema,
        },
      });
      if (!aiResponse.text) throw new Error("AI 응답이 없습니다.");
      const parsed = JSON.parse(aiResponse.text);
      const resume = new Resume({
        ...parsed,
        userId, // override with your real userId
      });
      await resume.save();
      return res.status(200).json({ status: "success", data: aiResponse.text });
    } catch (error: any) {
      res.status(400).json({ status: "fail", message: error.message });
    }
  },
};

export default geminiController;
