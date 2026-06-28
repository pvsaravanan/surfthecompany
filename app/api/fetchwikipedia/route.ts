import { NextRequest, NextResponse } from 'next/server';
import Exa from "exa-js";
import { anthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 60;

const exa = new Exa(process.env.EXA_API_KEY as string);

// Helper matching logic
const extractCompanyName = (url: string): string => {
  try {
    const cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/, '');
    return cleanUrl.split('.')[0].toLowerCase();
  } catch {
    return '';
  }
};

const isCompanyWikipedia = (wikiUrl: string, companyName: string): boolean => {
  try {
    const wikiPath = wikiUrl.split('/wiki/')[1];
    if (!wikiPath) return false;
    const decodedPath = decodeURIComponent(wikiPath).toLowerCase().replace(/_/g, '').replace(/-/g, '');
    const cleanCompany = companyName.toLowerCase().split('-')[0].split('_')[0];
    return decodedPath.includes(cleanCompany) || cleanCompany.includes(decodedPath);
  } catch {
    return false;
  }
};

export async function POST(req: NextRequest) {
  try {
    const { websiteurl } = await req.json();

    if (!websiteurl) {
      return NextResponse.json({ error: 'websiteurl is required' }, { status: 400 });
    }

    const companyName = extractCompanyName(websiteurl);
    let wikiData = null;

    try {
      const result = await exa.searchAndContents(
        `${websiteurl} company wikipedia page:`,
        {
          type: "keyword",
          livecrawl: "always",
          includeDomains: ["wikipedia.org"],
          numResults: 1,
          text: true,
        }
      );
      if (result.results && result.results.length > 0) {
        const candidate = result.results[0];
        if (candidate.url && isCompanyWikipedia(candidate.url, companyName)) {
          wikiData = candidate;
        }
      }
    } catch (e) {
      console.warn("Exa Wikipedia search failed:", e);
    }

    if (!wikiData) {
      const fallbackSchema = z.object({
        text: z.string(),
        title: z.string()
      });

      const hasNvidiaKey = process.env.NVIDIA_API_KEY &&
        process.env.NVIDIA_API_KEY !== 'your_nvidia_api_key' &&
        process.env.NVIDIA_API_KEY.trim() !== '';

      const hasGeminiKey = process.env.GEMINI_API_KEY && 
        process.env.GEMINI_API_KEY !== 'your_gemini_api_key' && 
        process.env.GEMINI_API_KEY.trim() !== '';

      let selectedModel: any;

      if (hasNvidiaKey) {
        const nvidiaProvider = createOpenAI({
          apiKey: process.env.NVIDIA_API_KEY,
          baseURL: 'https://integrate.api.nvidia.com/v1',
        });
        selectedModel = nvidiaProvider('nvidia/nemotron-3-nano-30b-a3b');
      } else if (hasGeminiKey) {
        const googleProvider = createGoogleGenerativeAI({
          apiKey: process.env.GEMINI_API_KEY,
        });
        selectedModel = googleProvider('gemini-1.5-flash');
      } else {
        selectedModel = anthropic('claude-3-7-sonnet-latest');
      }

      const cleanName = companyName.charAt(0).toUpperCase() + companyName.slice(1);

      const { object } = await generateObject({
        model: selectedModel,
        schema: fallbackSchema,
        output: 'object',
        system: "Generate a plain text Wikipedia-style introductory summary paragraph about the specified company (saved in 'text') and the company's official name (saved in 'title'). The 'text' field MUST be a plain text paragraph starting with the company's full legal name followed by 'is a...' or 'is an...' (e.g. 'Hexaware Technologies is a global provider of IT and business process services...'). Keep the tone objective and informative. Do NOT include JSON syntax, quotes, notes, markdown, or explanations inside the 'text' or 'title' strings.",
        prompt: `Provide a plain corporate overview paragraph and official title for the company: ${cleanName} (website: ${websiteurl}).`
      });

      wikiData = {
        title: object.title,
        url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(cleanName)}`,
        text: object.text
      };
    }

    return NextResponse.json({ results: [wikiData] });
  } catch (error) {
    return NextResponse.json({ error: `Failed to perform search | ${error}` }, { status: 500 });
  }
}