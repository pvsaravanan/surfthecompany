// app/api/fetchfunding/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Exa from "exa-js";

export const maxDuration = 60;

const exa = new Exa(process.env.EXA_API_KEY as string);

export async function POST(req: NextRequest) {
  try {
    const { websiteurl } = await req.json();

    if (!websiteurl) {
      return NextResponse.json({ error: 'websiteurl is required' }, { status: 400 });
    }

    const result = await exa.searchAndContents(
        `${websiteurl} Funding:`,
        {
          type: "keyword",
          numResults: 1,
          text: true,
          summary: {
            query: `Provide a detailed breakdown of the company's funding history, valuation, and financial backing. Format the response with the following uppercase headers so it is highly valuable for job seekers and graduates:
- INVESTMENT SCOPE AND BACKING
- FINANCIAL HEALTH AND GROWTH
- OUTLOOK FOR JOB SEEKERS
- KEY TAKEAWAY
Do not tell me generic info about the company, focus purely on funding, backing, stability, and career outlook implications. If no funding info is available, reply with "NO".`
          },
          livecrawl: "always",
          includeText: [websiteurl]
        }
      )

    return NextResponse.json({ results: result.results });
  } catch (error) {
    return NextResponse.json({ error: `Failed to perform search | ${error}` }, { status: 500 });
  }
}