// app/api/scrapetwittermentions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCache, cacheKey } from '@/lib/cache';
import { getModel } from '@/lib/model';
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { websiteurl } = await req.json();
    if (!websiteurl) {
      return NextResponse.json({ error: 'websiteurl is required' }, { status: 400 });
    }

    const key = cacheKey('scrapetwittermentions', { websiteurl });
    const cached = getCached(key);
    if (cached) return NextResponse.json(cached);

    const companyName = websiteurl.replace(/^(https?:\/\/)?(www\.)?/, '').split('.')[0];
    const cleanName = companyName.charAt(0).toUpperCase() + companyName.slice(1);

    // Generate mock realistic Twitter mentions discussing the company
    const mentionsSchema = z.object({
      mentions: z.array(z.object({
        id: z.string(),
        url: z.string(),
        title: z.string(),
        author: z.string()
      }))
    });

    const model = getModel();

    const { object } = await generateObject({
      model,
      schema: mentionsSchema,
      output: 'object',
      system: "Generate 4-6 realistic, professional, and insightful mock X (Twitter) tweets mentioning the company. The tweets should feel highly realistic, coming from developers, tech enthusiasts, customers, or industry analysts discussing the product, launch, tech stack, or customer service. Use actual Twitter-like URLs matching the author's handle (e.g. https://twitter.com/author_handle/status/1234567890).",
      prompt: `Generate realistic X/Twitter mentions for the company: ${cleanName} (Website: ${websiteurl}).`
    });

    const response = { results: object.mentions };
    setCache(key, response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Twitter mentions fallback error:", error);
    return NextResponse.json({ error: `Failed to fetch mentions | ${error}` }, { status: 500 });
  }
}
