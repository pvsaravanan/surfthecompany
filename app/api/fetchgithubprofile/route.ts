import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCache, cacheKey } from '@/lib/cache';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { githubUrl } = await req.json();
    if (!githubUrl) {
      return NextResponse.json({ error: 'GitHub URL is required' }, { status: 400 });
    }

    const key = cacheKey('fetchgithubprofile', { githubUrl });
    const cached = getCached(key);
    if (cached) return NextResponse.json(cached);

    // Extract username from GitHub URL
    const username = githubUrl.replace(/\/$/, '').split('/').pop();
    if (!username) {
      return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 });
    }

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
    };

    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    // Fetch profile and repos in parallel
    const [profileResponse, reposResponse] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { headers }),
      fetch(`https://api.github.com/users/${username}/repos?sort=stars&direction=desc&per_page=6`, { headers }),
    ]);

    if (!profileResponse.ok) {
      return NextResponse.json(
        { error: `GitHub API error: ${profileResponse.status}` },
        { status: profileResponse.status }
      );
    }

    const profileData = await profileResponse.json();
    const reposData = reposResponse.ok ? await reposResponse.json() : [];

    const response = {
      result: {
        ...profileData,
        repositories: reposData,
      },
    };
    setCache(key, response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('GitHub profile API error:', error);
    return NextResponse.json(
      { error: `Failed to fetch GitHub profile | ${error}` },
      { status: 500 }
    );
  }
}
