import CompanySummary from "@/components/companycontent/CompanySummary";
import CompanyMindMap from "@/components/mindmap/CompanyMindMap";
import { CompanySummarySkeleton } from "@/components/skeletons/ResearchSkeletons";
import type { CompanyMapData } from "@/components/types/research.types";

interface CompanySummarySectionProps {
  isGenerating: boolean;
  companySummary: any;
  companyMap: CompanyMapData | null;
}

export default function CompanySummarySection({
  isGenerating,
  companySummary,
  companyMap,
}: CompanySummarySectionProps) {
  if (!isGenerating && !companySummary) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <h2 className="text-3xl font-medium mt-6">Summary and Mind Map</h2>
      </div>

      {isGenerating && companySummary === null ? (
        <CompanySummarySkeleton />
      ) : companySummary && (
        <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
          <CompanySummary summary={companySummary} />
        </div>
      )}

      {isGenerating && companyMap === null ? (
        <div className="hidden sm:block animate-pulse">
          <div className="h-64 bg-secondary-darkest rounded-lg flex items-center justify-center">
            <p className="text-gray-400 text-md">Loading...</p>
          </div>
        </div>
      ) : companyMap && (
        <div className="hidden sm:block opacity-0 animate-fade-up [animation-delay:200ms]">
          <CompanyMindMap data={companyMap} />
        </div>
      )}
    </div>
  );
}
