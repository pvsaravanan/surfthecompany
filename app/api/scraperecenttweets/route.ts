// app/api/scraperecenttweets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Exa from "exa-js";
import { getCached, setCache, cacheKey } from '@/lib/cache';

export const maxDuration = 60;

const exa = new Exa(process.env.EXA_API_KEY as string);

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ error: 'username is required' }, { status: 400 });
    }

    const key = cacheKey('scraperecenttweets', { username });
    const cached = getCached(key);
    if (cached) return NextResponse.json(cached);

    const result = await exa.searchAndContents(
        `site:twitter.com/${username} OR site:x.com/${username}`,
        {
          type: "keyword",
          livecrawl: "always",
          numResults: 10
        }
      )

    const response = { results: result.results };
    setCache(key, response);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: `Failed to perform search | ${error}` }, { status: 500 });
  }
}