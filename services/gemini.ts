
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, PlaceCandidate } from "../types";

const API_KEY = process.env.API_KEY || "";

/**
 * Phase 1: Discover potential businesses matching the query
 */
export const searchPlaces = async (query: string): Promise<PlaceCandidate[]> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `Search for businesses matching: "${query}". 
  Provide a list of up to 5 specific businesses with their names, full addresses, average star ratings, and review counts.
  Include a short 1-sentence description for each to help the user identify it.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              address: { type: Type.STRING },
              rating: { type: Type.NUMBER },
              reviewCount: { type: Type.INTEGER },
              description: { type: Type.STRING }
            },
            required: ["id", "name", "address", "rating", "reviewCount", "description"]
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Search Discovery Error:", error);
    throw new Error("Could not find matching businesses. Try a more specific name.");
  }
};

/**
 * Phase 2: Focused authenticity audit with sentiment breakdown
 */
export const analyzeBusiness = async (place: PlaceCandidate): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `Perform a high-precision authenticity and sentiment audit of Google reviews for "${place.name}" at "${place.address}".
  
  TASKS:
  1. Analyze patterns to determine what % of reviews are REAL (organic) vs fake.
  2. Calculate your confidence in this assessment based on search grounding.
  3. Analyze the overall sentiment of the reviews found.
  
  Return the results in JSON format including:
  - realPercentage (0-100)
  - confidenceScore (0-100)
  - sentimentBreakdown: positive, negative, and neutral percentages (must sum to 100).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            businessName: { type: Type.STRING },
            address: { type: Type.STRING },
            realPercentage: { type: Type.NUMBER },
            confidenceScore: { type: Type.NUMBER },
            sentimentBreakdown: {
              type: Type.OBJECT,
              properties: {
                positive: { type: Type.NUMBER },
                negative: { type: Type.NUMBER },
                neutral: { type: Type.NUMBER }
              },
              required: ["positive", "negative", "neutral"]
            }
          },
          required: ["businessName", "address", "realPercentage", "confidenceScore", "sentimentBreakdown"]
        }
      }
    });

    return JSON.parse(response.text || "{}") as AnalysisResult;
  } catch (error) {
    console.error("Gemini Deep Audit Error:", error);
    throw error;
  }
};
