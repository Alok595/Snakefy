import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface SnakeDetectionResult {
  speciesName: string;
  scientificName: string;
  commonNames: string[];
  isVenomous: boolean;
  dangerLevel: "Low" | "Medium" | "High" | "Critical";
  confidenceScore: number;
  description: string;
  habitat: string;
  behavior: string;
  firstAid: {
    do: string[];
    dont: string[];
  };
}

export async function detectSnake(base64Image: string, language: string = "English"): Promise<SnakeDetectionResult> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(",")[1],
            },
          },
          {
            text: `You are an expert herpetologist. Identify the snake in this image with high precision. 
            
            CRITICAL: You MUST provide ALL text fields in the following language: ${language}.
            
            Provide the following details:
            1. speciesName: The most common name in ${language}.
            2. scientificName: The formal Latin name.
            3. commonNames: A list of other names this snake is known by in ${language}.
            4. isVenomous: Boolean value.
            5. dangerLevel: One of "Low", "Medium", "High", "Critical".
            6. confidenceScore: A number between 0 and 1 representing your certainty.
            7. description: A detailed physical description in ${language}.
            8. habitat: Where this snake is typically found in ${language}.
            9. behavior: Common behaviors or temperament in ${language}.
            10. firstAid: Specific "do" and "dont" instructions for a bite from THIS specific species, in ${language}.`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          speciesName: { type: Type.STRING },
          scientificName: { type: Type.STRING },
          commonNames: { type: Type.ARRAY, items: { type: Type.STRING } },
          isVenomous: { type: Type.BOOLEAN },
          dangerLevel: { 
            type: Type.STRING,
            enum: ["Low", "Medium", "High", "Critical"]
          },
          confidenceScore: { type: Type.NUMBER },
          description: { type: Type.STRING },
          habitat: { type: Type.STRING },
          behavior: { type: Type.STRING },
          firstAid: {
            type: Type.OBJECT,
            properties: {
              do: { type: Type.ARRAY, items: { type: Type.STRING } },
              dont: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["do", "dont"],
          },
        },
        required: ["speciesName", "scientificName", "commonNames", "isVenomous", "dangerLevel", "confidenceScore", "description", "habitat", "behavior", "firstAid"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function findNearbyHospitals(lat: number, lng: number, language: string = "English") {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Find the nearest hospitals or emergency medical centers with anti-venom or emergency care capabilities nearby. Provide the information in ${language}.`,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: {
            latitude: lat,
            longitude: lng,
          },
        },
      },
    },
  });

  return {
    text: response.text,
    groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
  };
}
