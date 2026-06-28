// SurfTheCompanyHome.tsx
"use client";

import Link from "next/link";
import { useCompanyResearch } from "@/hooks/useCompanyResearch";
import CompanyOverviewSection from "@/components/research/CompanyOverviewSection";
import CompanySocialsSection from "@/components/research/CompanySocialsSection";
import CompanySummarySection from "@/components/research/CompanySummarySection";

export default function SurfTheCompany() {
  const {
    isGenerating,
    companyUrl,
    setCompanyUrl,
    errors,
    handleResearch,
    linkedinData,
    competitors,
    news,
    companySummary,
    twitterProfileText,
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
  } = useCompanyResearch();

  return (
    <div className="w-full max-w-5xl min-h-[calc(100vh-3rem)] p-6 z-10 flex flex-col justify-between">
      <div className="flex-grow">
        <h1 className="md:text-6xl text-4xl pb-5 font-medium opacity-0 animate-fade-up [animation-delay:200ms]">
          surf<span className="text-brand-default">thecompany</span>
        </h1>

        <p className="text-black mb-12 opacity-0 animate-fade-up [animation-delay:400ms]">
          Surf the web. Know the company.
        </p>

        <form onSubmit={handleResearch} className="space-y-6 mb-20">
          <input
            value={companyUrl}
            onChange={(e) => setCompanyUrl(e.target.value)}
            placeholder="Enter Company URL (e.g., example.com)"
            className="w-full bg-white p-3 border box-border outline-none rounded-sm ring-2 ring-brand-default resize-none opacity-0 animate-fade-up [animation-delay:600ms]"
          />
          <button
            type="submit"
            className={`w-full text-white font-semibold px-2 py-2 rounded-sm transition-opacity opacity-0 animate-fade-up [animation-delay:800ms] min-h-[50px] ${
              isGenerating ? "bg-gray-400" : "bg-brand-default ring-2 ring-brand-default"
            } transition-colors`}
            disabled={isGenerating}
          >
            {isGenerating ? "Researching..." : "Research Now"}
          </button>
        </form>

        {Object.entries(errors).map(([key, message]) => (
          <div key={key} className="mt-4 mb-4 p-3 bg-red-100 border border-red-400 text-red-700">
            {message}
          </div>
        ))}

        <div className="space-y-12">
          <CompanyOverviewSection
            isGenerating={isGenerating}
            companyUrl={companyUrl}
            linkedinData={linkedinData}
            founders={founders}
            financialReport={financialReport}
            fundingData={fundingData}
            crunchbaseData={crunchbaseData}
            pitchbookData={pitchbookData}
            tracxnData={tracxnData}
            wikipediaData={wikipediaData}
            competitors={competitors}
            news={news}
          />

          <CompanySocialsSection
            isGenerating={isGenerating}
            twitterProfileText={twitterProfileText}
            youtubeVideos={youtubeVideos}
            tiktokData={tiktokData}
            redditPosts={redditPosts}
            githubUrl={githubUrl}
          />

          <CompanySummarySection
            isGenerating={isGenerating}
            companySummary={companySummary}
            companyMap={companyMap}
          />
        </div>
      </div>

      <footer className="w-full py-6 mt-16 bg-secondary-default border-t opacity-0 animate-fade-up [animation-delay:1200ms]">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-center sm:gap-6 px-4">
          <Link
            href="https://github.com/pvsaravanan/surfthecompany"
            target="_blank"
            rel="origin"
            className="text-gray-600 hover:underline cursor-pointer text-center text-sm font-medium"
          >
            View Project Code
          </Link>
        </div>
      </footer>
    </div>
  );
}
