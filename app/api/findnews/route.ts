// app/api/findnews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Exa from "exa-js";
import { getCached, setCache, cacheKey } from '@/lib/cache';

export const maxDuration = 60;

const exa = new Exa(process.env.EXA_API_KEY as string);

export async function POST(req: NextRequest) {
  try {
    const { websiteurl } = await req.json();
    if (!websiteurl) {
      return NextResponse.json({ error: 'Website URL is required' }, { status: 400 });
    }

    const key = cacheKey('findnews', { websiteurl });
    const cached = getCached(key);
    if (cached) return NextResponse.json(cached);

    // Use Exa to search for content related to the claim
    const result = await exa.searchAndContents(
      `${websiteurl} Latest News:`,
      {
        category: "news",
        type: "keyword",
        text: true,
        livecrawl: "always",
        includeText: [websiteurl],
        numResults: 10,
        excludeDomains: [websiteurl]
      }
    );

    const response = { results: result.results };
    setCache(key, response);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: `Failed to perform search | ${error}` }, { status: 500 });
  }
}