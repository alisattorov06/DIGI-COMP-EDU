import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function solveDifferentialEquation(input: string | { mimeType: string; data: string }, isImage: boolean = false) {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `Siz professional matematik va differensial tenglamalar bo'yicha mutaxassissiz. 
Foydalanuvchi sizga differensial tenglama (matn yoki rasm ko'rinishida) yuboradi.
Sizning vazifangiz:
1. Tenglamani aniqlash va uni LaTeX formatida yozish.
2. Yechish bosqichlarini batafsil, tushunarli va o'zbek tilida tushuntirish.
3. Yakuniy javobni aniq ko'rsatish.
4. Ishlatilgan usul va tushunchalarga qisqacha tarif berish.

Javobni Markdown formatida, matematik formulalar uchun LaTeX ($...$ yoki $$...$$) dan foydalangan holda qaytaring.`;

  let contents;
  if (isImage && typeof input !== 'string') {
    contents = {
      parts: [
        { inlineData: input },
        { text: "Ushbu rasmdagi differensial tenglamani aniqlang va yeching." }
      ]
    };
  } else {
    contents = {
      parts: [{ text: `Ushbu differensial tenglamani yeching: ${input}` }]
    };
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.");
  }
}
