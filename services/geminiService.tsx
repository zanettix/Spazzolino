import { GoogleGenAI } from "@google/genai";
import { ItemService } from './itemService';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

export class GeminiService {
  private static ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  static async analyzeProductImage(base64Image: string): Promise<{
    success: boolean;
    productName?: string;
    category?: string;
    confidence?: number;
    error?: string;
  }> {
    try {
      if (!GEMINI_API_KEY) {
        return {
          success: false,
          error: 'API Key non configurata',
        };
      }

      const { data: catalogItems } = await ItemService.getCatalog();
      
      if (!catalogItems || catalogItems.length === 0) {
        return {
          success: false,
          error: 'Impossibile recuperare il catalogo prodotti',
        };
      }

      const productsList = catalogItems
        .map(item => `- ${item.name} (${item.category})`)
        .join('\n');

      const categoriesMap = catalogItems.reduce((acc, item) => {
        acc[item.name] = item.category;
        return acc;
      }, {} as Record<string, string>);

      const prompt = `Analizza questa immagine e identifica ESATTAMENTE il prodotto mostrato. 
      Rispondi SOLO con un oggetto JSON in questo formato:
      {
        "productName": "nome esatto del prodotto in italiano",
        "confidence": numero da 0 a 100
      }
      
      Prodotti validi da riconoscere (scegli ESATTAMENTE uno di questi nomi):
      ${productsList}
      
      IMPORTANTE:
      - Usa ESATTAMENTE il nome come scritto nella lista sopra
      - Se l'oggetto non corrisponde a nessuno di questi, restituisci confidence: 0
      - Sii preciso nel riconoscimento`;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }
        ]
      });

      const text = response.text;

      if (!text) {
        return {
          success: false,
          error: 'Nessuna risposta da Gemini',
        };
      }

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          success: false,
          error: `Formato risposta non valido: ${text.substring(0, 100)}`,
        };
      }

      const parsed = JSON.parse(jsonMatch[0]);

      if (parsed.confidence < 50) {
        return {
          success: false,
          error: 'Oggetto non riconosciuto o non presente nel catalogo',
        };
      }

      const category = categoriesMap[parsed.productName];

      return {
        success: true,
        productName: parsed.productName,
        category: category,
        confidence: parsed.confidence,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Errore durante analisi immagine',
      };
    }
  }
}