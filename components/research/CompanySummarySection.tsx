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
    <div className="space-y-12">
      {/* Company Summary Section */}
      {(isGenerating || companySummary) && (
        <div className="space-y-4">
          <h2 className="text-3xl font-medium mt-6">Company Summary</h2>
          {isGenerating && companySummary === null ? (
            <CompanySummarySkeleton />
          ) : (
            companySummary && (
              <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                <CompanySummary summary={companySummary} />
              </div>
            )
          )}
        </div>
      )}

      {/* Mind Map Section */}
      {(isGenerating || companyMap) && (
        <div className="hidden sm:block space-y-4">
          <h2 className="text-3xl font-medium mt-6">Company Mind Map</h2>
          {isGenerating && companyMap === null ? (
            <div className="animate-pulse">
              <div className="h-64 bg-slate-100 border rounded-lg flex items-center justify-center">
                <p className="text-gray-400 text-md">Generating Mind Map...</p>
              </div>
            </div>
          ) : (
            companyMap && (
              <div className="opacity-0 animate-fade-up [animation-delay:200ms]">
                <CompanyMindMap data={companyMap} />
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
