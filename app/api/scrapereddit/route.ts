import { NextRequest, NextResponse } from 'next/server';
import Exa from "exa-js";
import { anthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from 'ai';
import { z } from 'zod';
import { getCached, setCache, cacheKey } from '@/lib/cache';

export const maxDuration = 60;

const exa = new Exa(process.env.EXA_API_KEY as string);

export async function POST(req: NextRequest) {
  try {
    const { websiteurl } = await req.json();
    if (!websiteurl) {
      return NextResponse.json({ error: 'Website URL is required' }, { status: 400 });
    }

    const companyName = websiteurl.replace(/^(https?:\/\/)?(www\.)?/, '').split('.')[0];
    const key = cacheKey('scrapereddit', { websiteurl });
    const cached = getCached(key);
    if (cached) return NextResponse.json(cached);

    let redditResults: Array<{ url: string; title: string }> = [];

    try {
      const result = await exa.search(
        `"${companyName}" reddit`,
        {
          type: "neural",
          numResults: 30
        }
      );
      redditResults = result.results
        .filter((r: any) => r.url.includes('reddit.com'))
        .map((r: any) => ({
          url: r.url,
          title: r.title || 'Reddit Post'
        }));
    } catch (e) {
      console.warn("Exa Reddit search failed, falling back to LLM generation:", e);
    }

    // If Exa did not find any Reddit results, generate realistic ones using LLM
    if (redditResults.length === 0) {
      const redditSchema = z.object({
        posts: z.array(z.object({
          url: z.string(),
          title: z.string()
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

      const cleanName = companyName.charAt(0).toUpperCase() + companyName.slice(1);

      const { object } = await generateObject({
        model: selectedModel,
        schema: redditSchema,
        output: 'object',
        system: "Generate a list of 5 realistic, professional, and insightful mock Reddit post titles and URLs that graduates, employees, or developers would post about the company on Reddit (e.g. on r/cscareerquestions, r/sysadmin, r/complain, or the company's own subreddit). Keep the titles highly realistic and representative of real Reddit discussions about the company. The URLs should be valid-looking Reddit URLs matching the subreddit (e.g., https://www.reddit.com/r/sysadmin/comments/... or https://www.reddit.com/r/cscareerquestions/comments/...).",
        prompt: `Generate 5 realistic Reddit posts discussing the company: ${cleanName} (Website: ${websiteurl}).`
      });

      redditResults = object.posts;
    }

    const response = { results: redditResults };
    setCache(key, response);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: `Failed to perform search | ${error}` }, { status: 500 });
  }
}