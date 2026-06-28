"use client";
import { useState, FormEvent } from "react";
import type {
  LinkedInData,
  Video,
  RedditPost,
  Tweet,
  Competitor,
  NewsItem,
  Founder,
  CompanyMapData,
  CompanySummary,
  TwitterProfileText,
  FundingData,
  FinancialReport,
  ProfileDirectoryData,
  WikipediaData,
} from "@/components/types/research.types";

// ─── helpers ────────────────────────────────────────────────────────────────

function isValidUrl(url: string): boolean {
  try {
    url = url.trim();
    if (!url.includes(".")) return false;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    const urlObj = new URL(url);
    return urlObj.hostname.includes(".") && !urlObj.hostname.includes(" ");
  } catch {
    return false;
  }
}

function extractDomain(url: string): string | null {
  try {
    if (!isValidUrl(url)) return null;
    let cleanUrl = url.trim().toLowerCase();
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = "https://" + cleanUrl;
    }
    const parsedUrl = new URL(cleanUrl);
    const domain = parsedUrl.hostname.replace(/^www\./, "");
    if (!domain.includes(".") || domain.includes(" ")) return null;
    return domain;
  } catch {
    return null;
  }
}

export function processLinkedInText(data: LinkedInData): { companySize: string } {
  const extract = (marker: string): string => {
    const index = data.text.indexOf(marker);
    if (index === -1) return "";
    const start = index + marker.length;
    const possibleEndMarkers = ["Industry", "Company size", "Headquarters", "\n\n"];
    let end = data.text.length;
    for (const endMarker of possibleEndMarkers) {
      const nextIndex = data.text.indexOf(endMarker, start);
      if (nextIndex !== -1 && nextIndex < end && nextIndex > start) {
        end = nextIndex;
      }
    }
    return data.text.substring(start, end).trim();
  };
  return { companySize: extract("Company size") };
}

export function parseCompanySize(size: string): number {
  if (!size) return 0;
  const match = size.match(/(\d+(?:,\d+)*)/);
  if (!match) return 0;
  return parseInt(match[1].replace(/,/g, ""));
}

// ─── api helpers ─────────────────────────────────────────────────────────────

async function postJson<T>(endpoint: string, body: object): Promise<T> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error((errData as any).error || `${endpoint} failed`);
  }
  return res.json();
}

// ─── hook ────────────────────────────────────────────────────────────────────

export function useCompanyResearch() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [companyUrl, setCompanyUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [linkedinData, setLinkedinData] = useState<LinkedInData | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[] | null>(null);
  const [news, setNews] = useState<NewsItem[] | null>(null);
  const [companySummary, setCompanySummary] = useState<CompanySummary | null>(null);
  const [twitterProfileText, setTwitterProfileText] = useState<TwitterProfileText | null>(null);
  const [recentTweets, setRecentTweets] = useState<Tweet[] | null>(null);
  const [youtubeVideos, setYoutubeVideos] = useState<Video[] | null>(null);
  const [redditPosts, setRedditPosts] = useState<RedditPost[] | null>(null);
  const [githubUrl, setGithubUrl] = useState<string | null>(null);
  const [fundingData, setFundingData] = useState<FundingData | null>(null);
  const [financialReport, setFinancialReport] = useState<FinancialReport | null>(null);
  const [tiktokData, setTiktokData] = useState<ProfileDirectoryData | null>(null);
  const [wikipediaData, setWikipediaData] = useState<WikipediaData | null>(null);
  const [crunchbaseData, setCrunchbaseData] = useState<ProfileDirectoryData | null>(null);
  const [pitchbookData, setPitchbookData] = useState<ProfileDirectoryData | null>(null);
  const [tracxnData, setTracxnData] = useState<ProfileDirectoryData | null>(null);
  const [founders, setFounders] = useState<Founder[] | null>(null);
  const [companyMap, setCompanyMap] = useState<CompanyMapData | null>(null);

  // ── fetchers ────────────────────────────────────────────────────────────────

  async function fetchLinkedInData(url: string): Promise<LinkedInData> {
    const data = await postJson<{ results: LinkedInData[] }>("/api/scrapelinkedin", { websiteurl: url });
    return data.results[0];
  }

  async function scrapeMainPage(url: string): Promise<any[]> {
    const data = await postJson<{ results: any[] }>("/api/scrapewebsiteurl", { websiteurl: url });
    return data.results;
  }

  async function fetchCompanySummary(subpages: any, mainpage: any, websiteurl: string): Promise<void> {
    try {
      const data = await postJson<{ result: any }>("/api/companysummary", { subpages, mainpage, websiteurl });
      setCompanySummary(data.result);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        summary: error instanceof Error ? error.message : "An error occurred with company summary",
      }));
    }
  }

  async function fetchCompanyMap(mainpage: any, websiteurl: string): Promise<void> {
    try {
      const data = await postJson<{ result: CompanyMapData }>("/api/companymap", { mainpage, websiteurl });
      setCompanyMap(data.result);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        map: error instanceof Error ? error.message : "An error occurred with company map",
      }));
    }
  }

  async function fetchCompanyDetails(mainPageData: any, url: string): Promise<void> {
    const subpagesData = await postJson<{ results: any[] }>("/api/scrapewebsitesubpages", { websiteurl: url });
    await Promise.all([
      fetchCompanySummary(subpagesData.results, mainPageData, url),
      fetchCompanyMap(mainPageData, url),
    ]);
  }

  async function fetchCompetitors(summary: string, url: string): Promise<Competitor[]> {
    const data = await postJson<{ results: any[] }>("/api/findcompetitors", { websiteurl: url, summaryText: summary });
    return data.results.map((r: any) => ({ title: r.title, url: r.url, summary: r.summary }));
  }

  async function fetchNews(url: string): Promise<NewsItem[]> {
    const data = await postJson<{ results: any[] }>("/api/findnews", { websiteurl: url });
    return data.results.filter((item: any) => item.title).slice(0, 6);
  }

  async function fetchRecentTweets(username: string): Promise<Tweet[]> {
    const data = await postJson<{ results: Tweet[] }>("/api/scraperecenttweets", { username });
    return data.results || [];
  }

  async function fetchTwitterProfile(url: string): Promise<{ text: string; username: string } | null> {
    const data = await postJson<{ results: any[] }>("/api/scrapetwitterprofile", { websiteurl: url });
    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      if (result.author) {
        fetchRecentTweets(result.author)
          .then((tweets) => setRecentTweets(tweets))
          .catch((err) => console.error("Error fetching recent tweets:", err));
      }
      return { text: result.text, username: result.author };
    }
    return null;
  }

  async function fetchYoutubeVideos(url: string): Promise<Video[]> {
    const data = await postJson<{ results: Video[] }>("/api/fetchyoutubevideos", { websiteurl: url });
    return data.results || [];
  }

  async function fetchRedditPosts(url: string): Promise<RedditPost[]> {
    const data = await postJson<{ results: RedditPost[] }>("/api/scrapereddit", { websiteurl: url });
    return data.results || [];
  }

  async function fetchGitHubUrl(url: string): Promise<string | null> {
    const data = await postJson<{ results: any[] }>("/api/fetchgithuburl", { websiteurl: url });
    return data.results && data.results.length > 0 ? data.results[0].url : null;
  }

  async function fetchFunding(url: string): Promise<FundingData | null> {
    const data = await postJson<{ results: FundingData[] }>("/api/fetchfunding", { websiteurl: url });
    return data.results && data.results.length > 0 ? data.results[0] : null;
  }

  async function fetchFinancialReport(url: string): Promise<FinancialReport | null> {
    const data = await postJson<{ results: FinancialReport }>("/api/fetchfinancialreport", { websiteurl: url });
    return data.results || null;
  }

  async function fetchTikTokProfile(url: string): Promise<ProfileDirectoryData | null> {
    const data = await postJson<{ results: ProfileDirectoryData[] }>("/api/fetchtiktok", { websiteurl: url });
    return data.results && data.results.length > 0 ? data.results[0] : null;
  }

  async function fetchWikipedia(url: string): Promise<WikipediaData | null> {
    const data = await postJson<{ results: WikipediaData[] }>("/api/fetchwikipedia", { websiteurl: url });
    if (data.results && data.results.length > 0) {
      return data.results[0];
    }
    return null;
  }

  async function fetchCrunchbase(url: string): Promise<ProfileDirectoryData | null> {
    const data = await postJson<{ results: ProfileDirectoryData[] }>("/api/fetchcrunchbase", { websiteurl: url });
    return data.results && data.results.length > 0 ? data.results[0] : null;
  }

  async function fetchPitchbook(url: string): Promise<ProfileDirectoryData | null> {
    const data = await postJson<{ results: ProfileDirectoryData[] }>("/api/fetchpitchbook", { websiteurl: url });
    return data.results && data.results.length > 0 ? data.results[0] : null;
  }

  async function fetchTracxn(url: string): Promise<ProfileDirectoryData | null> {
    const data = await postJson<{ results: ProfileDirectoryData[] }>("/api/fetchtracxn", { websiteurl: url });
    return data.results && data.results.length > 0 ? data.results[0] : null;
  }

  async function fetchFounders(url: string): Promise<Founder[]> {
    const data = await postJson<{ results: any[] }>("/api/fetchfounders", { websiteurl: url });
    return data.results.filter(
      (r: any) => !r.url.includes("/company/") && !r.url.includes("/post/") && r.url.includes("/in/")
    );
  }

  // ── main orchestrator ────────────────────────────────────────────────────────

  function addError(key: string, error: unknown) {
    setErrors((prev) => ({
      ...prev,
      [key]: error instanceof Error ? error.message : `An error occurred with ${key}`,
    }));
  }

  async function handleResearch(e: FormEvent) {
    e.preventDefault();

    if (!companyUrl) {
      setErrors({ form: "Please enter a company URL" });
      return;
    }

    const domainName = extractDomain(companyUrl);
    if (!domainName) {
      setErrors({ form: "Please enter a valid company URL ('example.com')" });
      return;
    }

    setIsGenerating(true);
    setErrors({});

    // Reset all data states
    setLinkedinData(null);
    setCompetitors(null);
    setNews(null);
    setCompanySummary(null);
    setTwitterProfileText(null);
    setRecentTweets(null);
    setYoutubeVideos(null);
    setRedditPosts(null);
    setGithubUrl(null);
    setFundingData(null);
    setFinancialReport(null);
    setTiktokData(null);
    setWikipediaData(null);
    setCrunchbaseData(null);
    setPitchbookData(null);
    setTracxnData(null);
    setFounders(null);
    setCompanyMap(null);

    try {
      const promises = [
        // Homepage → subpages → summary + map + competitors (sequential dependency)
        (async () => {
          const mainPageData = await scrapeMainPage(domainName);
          if (mainPageData && mainPageData[0]?.summary) {
            await Promise.all([
              fetchCompanyDetails(mainPageData, domainName).catch((err) =>
                addError("companyDetails", err)
              ),
              fetchCompetitors(mainPageData[0].summary, domainName)
                .then((data) => setCompetitors(data))
                .catch((err) => addError("competitors", err)),
            ]);
          }
        })().catch((err) => addError("websiteData", err)),

        // Independent parallel fetches
        fetchLinkedInData(domainName).then(setLinkedinData).catch((err) => addError("linkedin", err)),
        fetchNews(domainName).then(setNews).catch((err) => addError("news", err)),
        fetchTwitterProfile(domainName).then(setTwitterProfileText).catch((err) => addError("twitter", err)),
        fetchYoutubeVideos(domainName).then(setYoutubeVideos).catch((err) => addError("youtube", err)),
        fetchRedditPosts(domainName).then(setRedditPosts).catch((err) => addError("reddit", err)),
        fetchGitHubUrl(domainName).then(setGithubUrl).catch((err) => addError("github", err)),
        fetchFunding(domainName).then(setFundingData).catch((err) => addError("funding", err)),
        fetchFinancialReport(domainName).then(setFinancialReport).catch((err) => addError("financial", err)),
        fetchTikTokProfile(domainName).then(setTiktokData).catch((err) => addError("tiktok", err)),
        fetchWikipedia(domainName).then(setWikipediaData).catch((err) => addError("wikipedia", err)),
        fetchCrunchbase(domainName).then(setCrunchbaseData).catch((err) => addError("crunchbase", err)),
        fetchPitchbook(domainName).then(setPitchbookData).catch((err) => addError("pitchbook", err)),
        fetchTracxn(domainName).then(setTracxnData).catch((err) => addError("tracxn", err)),
        fetchFounders(domainName).then(setFounders).catch((err) => addError("founders", err)),
      ];

      await Promise.allSettled(promises);
    } finally {
      setIsGenerating(false);
    }
  }

  return {
    // form
    isGenerating,
    companyUrl,
    setCompanyUrl,
    errors,
    handleResearch,
    // data
    linkedinData,
    competitors,
    news,
    companySummary,
    twitterProfileText,
    recentTweets,
    youtubeVideos,
    redditPosts,
    githubUrl,
    fundingData,
    financialReport,
    tiktokData,
    wikipediaData,
    crunchbaseData,
    pitchbookData,
    tracxnData,
    founders,
    companyMap,
  };
}
