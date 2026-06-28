// app/api/findcompetitors/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Exa from "exa-js";
import { getCached, setCache, cacheKey } from '@/lib/cache';

export const maxDuration = 60;

const exa = new Exa(process.env.EXA_API_KEY as string);

export async function POST(req: NextRequest) {
  try {
    const { websiteurl, summaryText } = await req.json();
    if (!websiteurl || !summaryText) {
      return NextResponse.json({ error: 'Website URL and summary text are required' }, { status: 400 });
    }

    const key = cacheKey('findcompetitors', { websiteurl });
    const cached = getCached(key);
    if (cached) return NextResponse.json(cached);

    // Use Exa to search for content related to the claim
    const result = await exa.searchAndContents(
      `${websiteurl} competitors alternatives`,
      {
        type: "keyword",
        summary: {
            query: `Explain in one/two lines what does this competitor do in simple english.`
          },
        livecrawl: "fallback",
        excludeText: [websiteurl],
        excludeDomains: [websiteurl, `*.${websiteurl}`]
      }
    );

    const response = { results: result.results };
    setCache(key, response);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: `Failed to perform search | ${error}` }, { status: 500 });
  }
}