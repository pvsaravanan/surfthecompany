import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from 'ai';
import { z } from 'zod';
import { getCached, setCache, cacheKey } from '@/lib/cache';

export const maxDuration = 100;

export async function POST(req: NextRequest) {
  try {
    const { mainpage, websiteurl } = await req.json();
    
    if (!mainpage) {
      return NextResponse.json({ error: 'Mainpage content is required' }, { status: 400 });
    }

    const key = cacheKey('companymap', { websiteurl });
    const cached = getCached(key);
    if (cached) return NextResponse.json(cached);

    const mainpageText = JSON.stringify(mainpage, null, 2);

    // Define a recursive schema for mind map nodes
    const mindMapNodeSchema = z.object({
      title: z.string(),
      children: z.array(z.object({
        title: z.string(),
        description: z.string(),
        children: z.array(z.object({
          title: z.string(),
          description: z.string()
        }))
      }))
    });

    const mindMapSchema = z.object({
      companyName: z.string(),
      rootNode: mindMapNodeSchema
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

    const { object } = await generateObject({
      model: selectedModel,
      schema: mindMapSchema,
      output: 'object',
      system: "Create clear, concise mind maps that help users quickly understand companies. Use simple English and focus on the most important aspects.",
      prompt: `You are an expert at creating insightful mind maps about companies.
      
      MAIN WEBSITE CONTENT:
      ${mainpageText}

      Create a mind map for the company at ${websiteurl}. The mind map should:
      1. Have exactly 3 levels of depth
      2. Start with the company's main focus/product as the central node
      3. Branch into 3-4 main categories (Level 1) such as:
         - Core Products/Services
         - Technology/Innovation
         - Market Position/Partnerships
         - Company Mission/Values
      4. Each Level 1 category should have 2-3 subcategories (Level 2)
      5. Each Level 2 subcategory should have a clear description
      
      Keep all text concise and easy to understand. Focus on the most important aspects that would help someone quickly grasp what the company does and why it matters.
      
      Format the response as a valid JSON object matching the specified schema.`
    });

    console.log(object);
    
    const response = { result: object };
    setCache(key, response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('Company mind map API error:', error);
    return NextResponse.json({ error: `Company mind map API Failed | ${error}` }, { status: 500 });
  }
}