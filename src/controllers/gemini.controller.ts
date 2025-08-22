import { GoogleGenAI, Type } from "@google/genai";
import { Request, Response } from "express";
import { roadmapPrompt } from "@utils/aiPromptMessage";
import { roadmapGeminiSchema } from "@utils/geminiResSchema";
import config from "@config/config";

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
    if (!location || !interestJob)
      throw new Error("location 또는 interestJob이 없습니다.");

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
};

export default geminiController;
