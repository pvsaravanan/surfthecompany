import { ArrowUpRight, DollarSign, TrendingUp, Award, GraduationCap, Briefcase, Lightbulb } from 'lucide-react';

interface FundingDisplayProps {
  fundingData: {
    summary: string;
    url: string;
    favicon?: string;
  };
}

interface FundingSection {
  title: string;
  content: string[];
}

function parseFunding(summaryText: string) {
  // Normalize line endings and whitespace
  const cleanText = summaryText.replace(/\r\n|\r/g, '\n').trim();
  const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);
  const sections: FundingSection[] = [];
  let currentSection: FundingSection | null = null;
  let introLines: string[] = [];

  lines.forEach(line => {
    // Clean leading bullets
    const cleanLine = line.replace(/^\s*[-•*]\s*/, '').trim();
    if (!cleanLine) return;

    // Check if it's a heading:
    // 1. It is short (< 50 chars) and uppercase, OR
    // 2. It ends with a colon and is short
    const isHeading = 
      (cleanLine.length < 50 && cleanLine === cleanLine.toUpperCase() && /[A-Z]/.test(cleanLine)) ||
      (cleanLine.endsWith(':') && cleanLine.length < 50);

    if (isHeading) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: cleanLine.endsWith(':') ? cleanLine.slice(0, -1) : cleanLine,
        content: []
      };
    } else {
      if (currentSection) {
        currentSection.content.push(cleanLine);
      } else {
        introLines.push(cleanLine);
      }
    }
  });

  if (currentSection) {
    sections.push(currentSection);
  }

  return { intro: introLines.join('\n'), sections };
}

// Function to select an icon based on section title
const getSectionIcon = (title: string) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('scope') || lowerTitle.includes('backing')) {
    return <Briefcase className="w-5 h-5 text-brand-default" />;
  }
  if (lowerTitle.includes('health') || lowerTitle.includes('growth')) {
    return <TrendingUp className="w-5 h-5 text-emerald-600" />;
  }
  if (lowerTitle.includes('seeker') || lowerTitle.includes('graduate')) {
    return <GraduationCap className="w-5 h-5 text-purple-600" />;
  }
  if (lowerTitle.includes('takeaway')) {
    return <Lightbulb className="w-5 h-5 text-amber-600" />;
  }
  return <Award className="w-5 h-5 text-blue-600" />;
};

export default function FundingDisplay({ fundingData }: FundingDisplayProps) {
  if (fundingData.summary.startsWith("NO")) {
    return null;
  }

  const { intro, sections } = parseFunding(fundingData.summary);

  return (
    <div className="w-full">
      <h2 className="text-2xl font-normal mb-6 text-gray-900">Funding & Investment Scope</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100/80 overflow-hidden">
        
        {/* Intro Banner */}
        {intro && (
          <div className="bg-slate-50/50 px-6 py-4 border-b border-gray-100">
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              {intro}
            </p>
          </div>
        )}

        <div className="p-6">
          {sections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {sections.map((section, idx) => (
                <div 
                  key={idx} 
                  className="p-5 rounded-xl bg-slate-50/50 border border-slate-100 hover:border-brand-faint hover:bg-white transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-white rounded-lg border border-slate-100 shadow-sm shrink-0 group-hover:scale-105 transition-transform duration-300">
                      {getSectionIcon(section.title)}
                    </div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-700">
                      {section.title}
                    </h3>
                  </div>
                  
                  {section.content.length > 0 ? (
                    <div className="space-y-3">
                      {section.content.map((text, cIdx) => (
                        <p key={cIdx} className="text-sm text-gray-600 leading-relaxed">
                          {text}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No details available</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* Fallback if parsing didn't find clear structured headings */
            <div className="prose max-w-none mb-6 text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-5 rounded-xl border border-slate-100">
              {fundingData.summary}
            </div>
          )}

          {/* Source citation */}
          <div className="flex items-center gap-3 text-sm text-gray-500 pt-4 border-t border-gray-100/80">
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
    </div>
  );
}