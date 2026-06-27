import { NextRequest, NextResponse } from 'next/server';
import { anthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 100;

export async function POST(req: NextRequest) {
  try {
    const { subpages, mainpage, websiteurl } = await req.json();
    
    if (!subpages || !mainpage) {
      return NextResponse.json({ error: 'Mainpage or subpage content is required' }, { status: 400 });
    }

    const subpagesText = JSON.stringify(subpages, null, 2);
    const mainpageText = JSON.stringify(mainpage, null, 2);

    // Define the schema as an object with a 'sections' array
    const summarySchema = z.object({
      sections: z.array(z.object({
        heading: z.string(),
        text: z.string()
      }))
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
      schema: summarySchema,
      output: 'object',
      system: "Provide a detailed, professional, and highly insightful corporate analysis of the company. Do not use emojis. Write complete, detailed paragraphs containing deep insights based on the provided website content.",
      prompt: `You are an expert financial and corporate analyst.
      Here is the content from the company's website:
      
      SUBPAGES CONTENT (includes about, pricing, faq, blog, etc):
      ${subpagesText}
      
      MAIN WEBSITE CONTENT:
      ${mainpageText}
      
      Analyze the company whose url is ${websiteurl} and provide a comprehensive summary grouped under relevant headings (such as Value Proposition, Core Product Offerings, Target Market & Customers, Revenue Model, Corporate Strategy, Strengths & Differentiation).
      
      Guidelines:
      1. Provide detailed, insightful paragraphs rather than short, simplified one-liners.
      2. Group insights under a maximum of 6 highly relevant headings.
      3. Base all information strictly on the provided website content; do not extrapolate or make up facts.
      4. Do not include any emojis in the headings or descriptions.
      
      Output the result as JSON.`
    });
    
    // Return the sections array from the response
    return NextResponse.json({ result: object.sections });

  } catch (error) {
    console.error('Company summary API error:', error);
    return NextResponse.json({ error: `Company summary API Failed | ${error}` }, { status: 500 });
  }
}