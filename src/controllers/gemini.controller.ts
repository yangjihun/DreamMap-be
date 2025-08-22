import { GoogleGenAI, Type } from "@google/genai";
import { Request, Response } from "express";
import dotenv from "dotenv";
import {
  roadmapPrompt,
  introItemPrompt,
  experienceItemPrompt,
  projectItemPrompt,
  skillItemPrompt,
} from "@utils/aiPromptMessage";
import { roadmapGeminiSchema } from "@utils/geminiResSchema";
const Resume = require("@models/Resume");

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: (process.env.GEMINI_API_KEY as string) || "",
});

const geminiController = {
  generateContent: async (req: Request, res: Response) => {
    try {
      const aiResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        // 사용 시 aiPromptMessage에 함수 추가해서 불러오기
        // ai review와 roadmap은 미들웨어 사용해서 각각 필요한 함수나 값들을 받아올 수 있도록 구현 필요
        contents: roadmapPrompt("서울", "프론트엔드"), // 명령문
        config: {
          thinkingConfig: {
            thinkingBudget: 0, // Disables thinking -> 속도개선
          },
          responseMimeType: "application/json",
          // 사용 시 geminiResSchema에 함수 추가해서 불러오기
          // ai review와 roadmap은 미들웨어 사용해서 각각 필요한 함수나 값들을 받아올 수 있도록 구현 필요
          responseSchema: roadmapGeminiSchema,
        },
      });
      console.log(">>>>>>", aiResponse.text);
      return res.status(200).json({ status: "success" });
    } catch (error: any) {
      res.status(400).json({ status: "fail", message: error.message });
    }
    console.log("test중");

    // res.status(200).json({ status: "success" });
  },
  generateReview: async (req: Request, res: Response) => {
    try {
      let item;
      let resume = await Resume.findById("68a7b8d77433cbd888394172");
      if (!resume) {
        throw new Error("resume not found");
      }
      for (let i = 0; i < resume.sessions.length; i++) {
        for (let j = 0; j < resume.sessions[i].items.length; j++) {
          let sessionTitle = resume.sessions[i].title;
          item = resume.sessions[i].items[j];
          let prompt;
          if (sessionTitle === "Introduction") {
            prompt = introItemPrompt(item);
          } else if (sessionTitle === "Work Experience") {
            prompt = experienceItemPrompt(item);
          } else if (sessionTitle === "Project") {
            prompt = projectItemPrompt(item);
          } else if (sessionTitle === "Skills") {
            prompt = skillItemPrompt(item);
          } else {
            prompt = introItemPrompt(item); // fallback
          }
          const aiResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
          });
          console.log(">>>>>>", aiResponse.text);
          item.review = aiResponse.text;
        }
      }
      await resume.save();
      return res.status(200).json({ status: "success", data: resume });
    } catch (error: any) {
      res.status(400).json({ status: "fail", message: error.message });
    }
  },
};

export default geminiController;
