import LinkedInDisplay from "@/components/linkedin/LinkedinDisplay";
import CompetitorsDisplay from "@/components/competitors/CompetitorsDisplay";
import NewsDisplay from "@/components/news/NewsDisplay";
import FundingDisplay from "@/components/companycontent/FundingDisplay";
import FinancialReportDisplay from "@/components/financial/FinancialReportDisplay";
import WikipediaDisplay from "@/components/wikipedia/WikipediaDisplay";
import CrunchbaseDisplay from "@/components/crunchbase/CrunchbaseDisplay";
import PitchBookDisplay from "@/components/pitchbook/PitchBookDisplay";
import TracxnDisplay from "@/components/tracxn/TracxnDisplay";
import FoundersDisplay from "@/components/founders/FoundersDisplay";
import {
  LinkedInSkeleton,
  FoundersSkeleton,
  FinancialSkeleton,
  FundingSkeleton,
  WikipediaSkeleton,
  CompetitorsSkeleton,
  NewsSkeleton,
} from "@/components/skeletons/ResearchSkeletons";
import { parseCompanySize, processLinkedInText } from "@/hooks/useCompanyResearch";
import type { LinkedInData, Competitor, NewsItem, Founder } from "@/components/types/research.types";

interface CompanyOverviewSectionProps {
  isGenerating: boolean;
  companyUrl: string;
  linkedinData: LinkedInData | null;
  founders: Founder[] | null;
  financialReport: any;
  fundingData: any;
  crunchbaseData: any;
  pitchbookData: any;
  tracxnData: any;
  wikipediaData: any;
  competitors: Competitor[] | null;
  news: NewsItem[] | null;
}

export default function CompanyOverviewSection({
  isGenerating,
  companyUrl,
  linkedinData,
  founders,
  financialReport,
  fundingData,
  crunchbaseData,
  pitchbookData,
  tracxnData,
  wikipediaData,
  competitors,
  news,
}: CompanyOverviewSectionProps) {
  const hasOverviewData =
    linkedinData || founders || financialReport || fundingData ||
    crunchbaseData || pitchbookData || tracxnData || wikipediaData;

  return (
    <div className="space-y-16">
      {hasOverviewData && (
        <div className="flex items-center">
          <h2 className="text-4xl font-medium">Company Overview</h2>
        </div>
      )}

      {isGenerating && linkedinData === null ? (
        <LinkedInSkeleton />
      ) : linkedinData && (
        <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
          <LinkedInDisplay data={linkedinData} />
        </div>
      )}

      {isGenerating && founders === null ? (
        <FoundersSkeleton />
      ) : founders && founders.length > 0 && (
        <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
          <FoundersDisplay founders={founders} />
        </div>
      )}

      {linkedinData && parseCompanySize(processLinkedInText(linkedinData).companySize) >= 1000 && (
        isGenerating && financialReport === null ? (
          <FinancialSkeleton />
        ) : financialReport && (
          <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
            <FinancialReportDisplay report={financialReport} />
          </div>
        )
      )}

      <div className="space-y-6">
        {isGenerating && fundingData === null ? (
          <FundingSkeleton />
        ) : fundingData && (
          <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
            <FundingDisplay fundingData={fundingData} />
          </div>
        )}

        {isGenerating && crunchbaseData === null ? (
          <FundingSkeleton />
        ) : crunchbaseData && (
          <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
            <CrunchbaseDisplay data={crunchbaseData} />
          </div>
        )}

        {isGenerating && pitchbookData === null ? (
          <FundingSkeleton />
        ) : pitchbookData && (
          <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
            <PitchBookDisplay data={pitchbookData} />
          </div>
        )}

        {isGenerating && tracxnData === null ? (
          <FundingSkeleton />
        ) : tracxnData && (
          <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
            <TracxnDisplay data={tracxnData} />
          </div>
        )}
      </div>

      {isGenerating && wikipediaData === null ? (
        <WikipediaSkeleton />
      ) : wikipediaData && (
        <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
          <WikipediaDisplay data={wikipediaData} websiteUrl={companyUrl} />
        </div>
      )}

      {isGenerating && competitors === null ? (
        <CompetitorsSkeleton />
      ) : competitors && competitors.length > 0 && (
        <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
          <CompetitorsDisplay competitors={competitors} />
        </div>
      )}

      {isGenerating && news === null ? (
        <NewsSkeleton />
      ) : news && news.length > 0 && (
        <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
          <NewsDisplay news={news} />
        </div>
      )}
    </div>
  );
}
