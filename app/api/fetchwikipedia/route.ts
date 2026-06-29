import { NextRequest, NextResponse } from 'next/server';
import Exa from "exa-js";
import { getCached, setCache, cacheKey } from '@/lib/cache';

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

    const key = cacheKey('fetchwikipedia', { websiteurl });
    const cached = getCached(key);
    if (cached) return NextResponse.json(cached);

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
      wikiData = {
        notFound: true
      };
    }

    const response = { results: [wikiData] };
    setCache(key, response);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: `Failed to perform search | ${error}` }, { status: 500 });
  }
}