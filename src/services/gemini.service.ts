import { GoogleGenAI } from "@google/genai";
import config from "@config/config";
import { extractTextToJSON } from "@utils/aiPromptMessage";
import Resume, { ResumeDoc } from "@models/Resume";
import { resumeJsonSchema } from "@utils/geminiResSchema";

const ai = new GoogleGenAI({
  apiKey: config.gemini.apiKey,
});

/**
 * 텍스트를 입력받아 Gemini AI를 통해 구조화된 이력서 JSON을 생성하고 DB에 저장합니다.
 * @param text 이력서 전체 텍스트
 * @param userId 사용자 ID
 * @returns 저장된 이력서 Document
 */
async function createResumeFromText(
  text: string,
  resumeTitle: string,
  userId: string
): Promise<ResumeDoc> {
  if (!text || text.trim().length === 0) {
    throw new Error("분석할 텍스트가 없습니다.");
  }

  // Gemini API 호출하여 텍스트를 JSON으로 변환
  const aiResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: extractTextToJSON(text), // 텍스트를 JSON으로 변환하라는 프롬프트
    config: {
      thinkingConfig: {
        thinkingBudget: 0,
      },
      responseMimeType: "application/json",
      responseSchema: resumeJsonSchema, // 미리 정의된 JSON 스키마
    },
  });

  if (!aiResponse.text) {
    throw new Error("AI로부터 응답을 받지 못했습니다.");
  }

  const parsedData = JSON.parse(aiResponse.text);

  // 새로운 이력서 생성 및 저장
  const newResume = new Resume({
    ...parsedData,
    userId,
    title: resumeTitle,
    status: "draft", // 초기 상태는 draft로 설정
  });

  await newResume.save();

  return newResume;
}

const geminiService = {
  createResumeFromText,
};

export default geminiService;
