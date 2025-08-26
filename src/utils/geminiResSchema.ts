import { Type } from "@google/genai";

const resourceItem = {
  type: Type.OBJECT,
  properties: {
    resourceType: {
      type: Type.STRING,
      enum: ["study", "course"],
    },
    name: { type: Type.STRING },
    description: { type: Type.STRING },
    location: { type: Type.STRING },
    price: { type: Type.STRING },
    rating: { type: Type.NUMBER },
    provider: { type: Type.STRING },
  },
  additionalProperties: false,
};

const pathItem = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    skills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    duration: { type: Type.STRING },

    resources: {
      type: Type.ARRAY,
      items: resourceItem,
    },
  },
  additionalProperties: false,
};

export const roadmapGeminiSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      period: { type: Type.STRING, enum: ["3months", "6months", "1year"] },
      plan: {
        type: Type.OBJECT,
        properties: {
          paths: {
            type: Type.ARRAY,
            items: pathItem,
          },
        },
        additionalProperties: false,
      },
    },
  },
};
