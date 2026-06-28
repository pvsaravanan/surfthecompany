// app/api/scrapereddit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Exa from "exa-js";

export const maxDuration = 60;

const exa = new Exa(process.env.EXA_API_KEY as string);

export async function POST(req: NextRequest) {
  try {
    const { websiteurl } = await req.json();
    if (!websiteurl) {
      return NextResponse.json({ error: 'Website URL is required' }, { status: 400 });
    }

    const companyName = websiteurl.replace(/^(https?:\/\/)?(www\.)?/, '').split('.')[0];

    const result = await exa.search(
      `${companyName}`,
      {
        type: "neural",
        includeDomains: ["reddit.com"],
        numResults: 10
      }
    );

    return NextResponse.json({ results: result.results });
  } catch (error) {
    return NextResponse.json({ error: `Failed to perform search | ${error}` }, { status: 500 });
  }
}