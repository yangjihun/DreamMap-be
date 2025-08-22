import { Type } from "@google/genai";

export const roadmapGeminiSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      skill: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
      duration: { type: Type.STRING },
      maxItems: 3,
      minItems: 3,
    },
    propertyOrdering: ["title", "description", "skill", "duration"],
  },
};
