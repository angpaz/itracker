
import { GoogleGenAI, Type } from "@google/genai";
import { iPhoneListing, MarketAnalysis, iPhoneModel, GroundingSource } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Correct initialization using named parameter as per @google/genai guidelines
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  }

  private isValidAdUrl(url: string): boolean {
    if (!url) return false;
    const lowUrl = url.toLowerCase();
    return lowUrl.includes('/s-anzeige/') && /\/\d+-\d+/.test(url);
  }

  private async fetchBackMarketPrice(model: iPhoneModel): Promise<{ price: number; sources: GroundingSource[] }> {
    const prompt = `Find the absolute lowest retail price for a refurbished "${model}" in "Excellent" condition on backmarket.de. Return only the number.`;
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt, // Simple text prompt
        config: { tools: [{ googleSearch: {} }] },
      });
      // Correct extraction of text from property, not method
      const match = response.text?.match(/\d+/);
      const price = match ? parseInt(match[0]) : 0;
      
      // Fix: Extract grounding sources even for simple helper lookups to remain compliant with Search Grounding requirements
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources: GroundingSource[] = groundingChunks
        .filter((chunk: any) => chunk.web)
        .map((chunk: any) => ({ 
          title: chunk.web.title || 'BackMarket Pricing Reference', 
          uri: chunk.web.uri 
        }));
        
      return { price, sources };
    } catch { return { price: 0, sources: [] }; }
  }

  private async fetchKleinanzeigenListings(model: iPhoneModel, benchmark: number): Promise<Partial<MarketAnalysis>> {
    const prompt = `Act as a professional iPhone wholesaler. Deep-scan kleinanzeigen.de for the 8 most recent "${model}" ads.
    
    DEALER-ONLY EXTRACTION RULES:
    1. EXTRAPOLATE: Read the WHOLE listing description. Look for account age, battery health (Akkukapazität), storage size, and "Festpreis" vs "VB".
    2. PROFIT ALGO: Calculate "profitPotential" by subtracting the price from the retail benchmark of €${benchmark} minus €100 for overhead.
    3. RISK ALGO: Assign a "riskScore" (0-100). High risk if: brand new account, price too low, or text looks like a template.
    4. MARKET TREND: Is this model's price generally rising, falling, or stable?

    JSON format:
    {
      "listings": [{ 
        "title": string, "price": string, "priceNum": number, "location": string, "url": string, 
        "storageGb": string, "batteryHealth": string, "isVb": boolean,
        "riskScore": number, "profitPotential": number, "sellerInsights": string,
        "dealScore": "Great/Good/Fair/Poor", "agentComment": string, "arbitragePotential": string 
      }],
      "marketTrend": "rising/falling/stable",
      "summary": "Dealer-level market intelligence summary"
    }`;

    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Pro model for complex reasoning and data extraction
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            listings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  price: { type: Type.STRING },
                  priceNum: { type: Type.NUMBER },
                  location: { type: Type.STRING },
                  url: { type: Type.STRING },
                  storageGb: { type: Type.STRING },
                  batteryHealth: { type: Type.STRING },
                  isVb: { type: Type.BOOLEAN },
                  riskScore: { type: Type.NUMBER },
                  profitPotential: { type: Type.NUMBER },
                  sellerInsights: { type: Type.STRING },
                  dealScore: { type: Type.STRING },
                  agentComment: { type: Type.STRING },
                  arbitragePotential: { type: Type.STRING }
                },
                required: ['title', 'price', 'url', 'priceNum', 'riskScore', 'profitPotential']
              }
            },
            marketTrend: { type: Type.STRING },
            summary: { type: Type.STRING }
          }
        }
      },
    });

    // Extract text and grounding metadata from candidate response
    const jsonStr = response.text?.trim() || '{}';
    const data = JSON.parse(jsonStr);
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Extract required sources from Search Grounding chunks
    const sources: GroundingSource[] = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({ title: chunk.web.title || 'Market Source', uri: chunk.web.uri }));

    return { ...data, sources };
  }

  async fetchRecentListings(model: iPhoneModel): Promise<MarketAnalysis> {
    try {
      // Correctly handle the updated return type including sources
      const { price: backMarketPrice, sources: backMarketSources } = await this.fetchBackMarketPrice(model);
      const listingsData = await this.fetchKleinanzeigenListings(model, backMarketPrice);

      const validatedListings = (listingsData.listings || [])
        .filter((l: any) => this.isValidAdUrl(l.url))
        .map((l: any, index: number) => ({
          ...l,
          id: `listing-${index}-${Date.now()}`
        }));

      const avgPrice = validatedListings.length > 0 
        ? Math.round(validatedListings.reduce((acc, curr) => acc + curr.priceNum, 0) / validatedListings.length)
        : 0;

      return {
        listings: validatedListings,
        summary: listingsData.summary || "Scan complete.",
        averagePrice: avgPrice,
        backMarketPrice: backMarketPrice,
        arbitrageSpread: backMarketPrice - avgPrice,
        // Combined all extracted sources for UI display as per search grounding rules
        sources: [...(backMarketSources || []), ...(listingsData.sources || [])],
        marketTrend: (listingsData.marketTrend as any) || 'stable',
        agentRecommendation: `STRATEGY: Focus on ${model} listings with risk < 30 and profit > 100€. Current trend: ${listingsData.marketTrend}.`
      };
    } catch (error) {
      console.error("Deep Scan Failure:", error);
      throw error;
    }
  }

  async generateNegotiationMessage(listing: iPhoneListing): Promise<string> {
    const prompt = `Negotiate a lower price for ${listing.title} at ${listing.price}. Use "Dealer logic": highlight ${listing.batteryHealth ? `the ${listing.batteryHealth} battery` : 'competition'} and offer an immediate cash pickup in German.`;
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim() || "Hallo, was ist Ihr letzter Preis bei Abholung heute?";
  }
}

export const geminiService = new GeminiService();
