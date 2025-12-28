
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper para gerar chaves consistentes para o cache
const getCacheKey = (prefix: string, identifier: string) => 
  `gemini_cache_${prefix}_${identifier.trim().toLowerCase().replace(/\s+/g, '_')}`;

// Feature: Generate attractive menu descriptions with Caching
export const generateDishDescription = async (dishName: string, ingredients: string): Promise<string> => {
  const cacheKey = getCacheKey('desc', dishName);

  // 1. Verificar Cache
  const cachedData = localStorage.getItem(cacheKey);
  if (cachedData) {
    console.log(`[Gemini Cache] Descrição recuperada: ${dishName}`);
    return cachedData;
  }

  // 2. Chamar API se não houver cache
  console.log(`[Gemini API] Gerando descrição: ${dishName}`);
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a mouth-watering, short description (max 20 words) for a dish named "${dishName}" containing these ingredients: ${ingredients}. Make it sound appealing for a food delivery menu.`,
    });
    
    const result = response.text || "Delicious and fresh.";
    
    // 3. Salvar no Cache
    localStorage.setItem(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error("Gemini description error:", error);
    return "Tasty fresh food prepared with love.";
  }
};

// Feature: Generate food images using Gemini 3 Pro Image with Caching
export const generateDishImage = async (dishName: string): Promise<string | null> => {
  const cacheKey = getCacheKey('img', dishName);

  // 1. Verificar Cache
  const cachedData = localStorage.getItem(cacheKey);
  if (cachedData) {
    console.log(`[Gemini Cache] Imagem recuperada: ${dishName}`);
    return cachedData;
  }

  // 2. Chamar API se não houver cache
  console.log(`[Gemini API] Gerando imagem: ${dishName}`);
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            text: `A professional, high-resolution food photography shot of ${dishName}. Studio lighting, appetizing, 4k resolution.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "4:3",
          imageSize: "1K"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const imgData = `data:image/png;base64,${part.inlineData.data}`;
        
        // 3. Salvar no Cache
        // Nota: LocalStorage tem limite (~5MB), imagens base64 grandes podem encher rápido.
        // Em produção real, usaríamos IndexedDB ou CDN, mas para este MVP funciona.
        try {
            localStorage.setItem(cacheKey, imgData);
        } catch (e) {
            console.warn("Storage quota exceeded, image not cached.");
        }
        
        return imgData;
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini image error:", error);
    return null;
  }
};

// Feature: Admin dashboard analytics helper
// Analytics usually needs fresh data, so we might skip long-term caching here,
// or cache it for a very short session only.
export const analyzeOrderTrends = async (ordersSummary: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Using Pro for deeper reasoning
      contents: `Analyze these recent order trends and suggest 2 strategies to improve sales: ${ordersSummary}`,
      config: {
        thinkingConfig: { thinkingBudget: 1024 } // Small thinking budget for analysis
      }
    });
    return response.text || "Focus on popular items and reduce delivery times.";
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return "Analyze sales data to find patterns.";
  }
};
