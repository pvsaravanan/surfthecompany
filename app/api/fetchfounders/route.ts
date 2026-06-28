// app/api/fetchfounders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Exa from "exa-js";
import { getCached, setCache, cacheKey } from '@/lib/cache';

export const maxDuration = 60;

const exa = new Exa(process.env.EXA_API_KEY as string);

export async function POST(req: NextRequest) {
  try {
    const { websiteurl } = await req.json();

    if (!websiteurl) {
      return NextResponse.json({ error: 'websiteurl is required' }, { status: 400 });
    }

    const key = cacheKey('fetchfounders', { websiteurl });
    const cached = getCached(key);
    if (cached) return NextResponse.json(cached);

    const result = await exa.search(
        `${websiteurl} founder's Linkedin page:`,
        {
          type: "keyword",
          numResults: 2,
          includeDomains: ["linkedin.com"]
        }
      )

    const response = { results: result.results };
    setCache(key, response);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: `Failed to perform search | ${error}` }, { status: 500 });
  }
}