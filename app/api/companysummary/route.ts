import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { z } from 'zod';
import { getCached, setCache, cacheKey } from '@/lib/cache';
import { getModel } from '@/lib/model';

export const maxDuration = 100;

export async function POST(req: NextRequest) {
  try {
    const { subpages, mainpage, websiteurl } = await req.json();
    
    if (!subpages || !mainpage) {
      return NextResponse.json({ error: 'Mainpage or subpage content is required' }, { status: 400 });
    }

    const key = cacheKey('companysummary', { websiteurl });
    const cached = getCached(key);
    if (cached) return NextResponse.json(cached);

    const subpagesText = JSON.stringify(subpages, null, 2);
    const mainpageText = JSON.stringify(mainpage, null, 2);

    // Define the schema as an object with a 'sections' array
    const summarySchema = z.object({
      sections: z.array(z.object({
        heading: z.string(),
        text: z.string()
      }))
    });

    const selectedModel = getModel();

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
    const response = { result: object.sections };
    setCache(key, response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('Company summary API error:', error);
    return NextResponse.json({ error: `Company summary API Failed | ${error}` }, { status: 500 });
  }
}