import { GoogleGenAI, Type } from "@google/genai";
import { Request, Response } from "express";
import dotenv from "dotenv";
import { roadmapPrompt } from "@utils/aiPromptMessage";
import { roadmapGeminiSchema } from "@utils/geminiResSchema";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: (process.env.GEMINI_API_KEY as string) || "",
});
123123;

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
};

export default geminiController;
