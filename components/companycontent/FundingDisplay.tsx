import { ArrowUpRight, DollarSign } from 'lucide-react';

interface FundingDisplayProps {
  fundingData: {
    summary: string;
    url: string;
    favicon?: string;
  };
}

function parseFundingSummary(summaryText: string): { intro: string; items: Array<{ key: string; val: string }> } {
  // Normalize double dashes, colon spacing, and carriage returns
  const cleanSummary = summaryText
    .replace(/\s*-\s*-\s*/g, ' - ')
    .replace(/\r\n|\r/g, '\n')
    .trim();

  // Find where the first item starts (usually " - " or "\n- ")
  const match = cleanSummary.match(/(?:\n|^)\s*-\s+/);
  if (!match || match.index === undefined) {
    return { intro: cleanSummary, items: [] };
  }

  const intro = cleanSummary.substring(0, match.index).trim();
  const listPart = cleanSummary.substring(match.index).trim();

  // Split on list markers: either newline dash or just dash when separated properly
  const rawItems = listPart.split(/(?:\n\s*-\s*|\s+-\s+)/);
  const items: Array<{ key: string; val: string }> = [];

  rawItems.forEach((itemText) => {
    const cleanItem = itemText.trim();
    if (!cleanItem) return;

    // Check for "Key: Value" pattern
    const colonIdx = cleanItem.indexOf(':');
    if (colonIdx > 0 && colonIdx < 40) {
      const key = cleanItem.substring(0, colonIdx).trim();
      const val = cleanItem.substring(colonIdx + 1).trim();
      items.push({ key, val });
    } else {
      // If no colon, treat the whole item as the value with an empty key
      items.push({ key: '', val: cleanItem });
    }
  });

  return { intro, items };
}

export default function FundingDisplay({ fundingData }: FundingDisplayProps) {
  if (fundingData.summary.startsWith("NO")) {
    return null;
  }

  const { intro, items } = parseFundingSummary(fundingData.summary);

  return (
    <div className="w-full">
      <h2 className="text-2xl font-normal mb-8">Funding</h2>
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        
        {/* Intro context */}
        {intro && (
          <p className="text-sm text-gray-600 mb-6 leading-relaxed italic border-l-2 border-gray-200 pl-3">
            {intro}
          </p>
        )}

        {/* Structured item list */}
        {items.length > 0 ? (
          <div className="space-y-4 mb-6">
            {items.map((item, idx) => (
              <div 
                key={idx} 
                className="p-4 rounded-lg bg-slate-50 border border-slate-100/80 flex items-start gap-3"
              >
                <div className="p-2 bg-emerald-50 rounded-md shrink-0 text-emerald-600">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  {item.key && (
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                      {item.key}
                    </h4>
                  )}
                  <p className="text-sm text-gray-800 leading-relaxed break-words">
                    {item.val}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Fallback if parsing didn't find clear bullet format */
          <div className="prose max-w-none mb-6 text-sm text-gray-700 leading-relaxed">
            {fundingData.summary}
          </div>
        )}

        {/* Source citation */}
        <div className="flex items-center gap-3 text-sm text-gray-500 pt-2 border-t border-gray-50">
          {fundingData.favicon && (
            <img 
              src={fundingData.favicon} 
              alt="Source favicon" 
              className="w-4 h-4 object-contain rounded-sm"
            />
          )}
          <a 
            href={fundingData.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-semibold text-gray-600 hover:text-brand-default transition-colors"
          >
            Source
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
 