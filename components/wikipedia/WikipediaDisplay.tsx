import React, { useState } from 'react';
import { FaWikipediaW } from 'react-icons/fa';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface WikipediaDisplayProps {
  data: {
    text?: string;
    url?: string;
    title?: string;
    isFallback?: boolean;
    notFound?: boolean;
  };
  websiteUrl: string;
}

interface CompanyInfo {
  type?: string;
  founded?: string;
  headquarters?: string;
}

// Function to extract company name from website URL
const extractCompanyName = (url: string): string => {
  try {
    // Remove protocol and www if present
    const cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/, '');
    // Get domain without TLD
    const domain = cleanUrl.split('.')[0];
    return domain.toLowerCase();
  } catch (error) {
    return '';
  }
};

// Function to check if company name exists in Wikipedia URL (robust matching)
const isCompanyWikipedia = (wikiUrl: string, companyName: string): boolean => {
  try {
    // Extract the part after /wiki/
    const wikiPath = wikiUrl.split('/wiki/')[1];
    // Decode URI component and normalize separators
    const decodedPath = decodeURIComponent(wikiPath).toLowerCase().replace(/_/g, '').replace(/-/g, '');
    const cleanCompany = companyName.toLowerCase().split('-')[0].split('_')[0];
    
    // Check if the wikipedia URL path contains the company name, or vice versa
    return decodedPath.includes(cleanCompany) || cleanCompany.includes(decodedPath);
  } catch (error) {
    return false;
  }
};

const WikipediaDisplay: React.FC<WikipediaDisplayProps> = ({ data, websiteUrl }) => {
  const [showAllEvents, setShowAllEvents] = useState(false);

  if (data?.notFound) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 transition-all duration-300 hover:shadow-lg">
        <div className="flex items-center gap-4 mb-4 border-b pb-4">
          <div className="bg-[#f6f6f6] p-3 rounded-full">
            <FaWikipediaW className="text-2xl text-[#666]" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Wikipedia</h2>
            <p className="text-sm text-gray-500">From Wikipedia, the free encyclopedia</p>
          </div>
        </div>
        <p className="text-gray-500 italic">No wikipedia page for the company is found</p>
      </div>
    );
  }
  
  // Check for empty API response or missing data
  if (!data || (!data.text && !data.url) || (Array.isArray(data) && data.length === 0) || 
      (data.hasOwnProperty('results') && Array.isArray((data as any).results) && (data as any).results.length === 0)) {
    return null;
  }

  // Ensure the URL is a Wikipedia article and matches the company
  const companyName = extractCompanyName(websiteUrl);
  if (!companyName || !data.url || !data.url.includes('wikipedia.org') || (!data.isFallback && !isCompanyWikipedia(data.url, companyName))) {
    return null;
  }

  // Function to decode HTML entities
  const decodeHtmlEntities = (text: string) => {
    const entities: { [key: string]: string } = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'"
    };
    return text.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, match => entities[match as keyof typeof entities]);
  };

  // Function to clean text
  const cleanText = (text: string) => {
    return decodeHtmlEntities(text)
      .replace(/#+\s*/g, '')          // Strip markdown headers like ##, ###, etc.
      .replace(/\[\s*\d+\s*\]/g, '') // Remove citation numbers with possible spaces [1], [ 1 ], etc.
      .replace(/\[ citation needed \]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Function to extract metadata (everything before the first proper sentence)
  const extractMetadata = (text: string): CompanyInfo => {
    const metadataSection = text.split(/\.\s/)[0]; // Get everything before first period
    const lines = metadataSection.split(/\s+(?=[A-Z])/); // Split on spaces followed by capital letters
    
    const info: CompanyInfo = {};
    
    lines.forEach(line => {
      const cleanLine = cleanText(line);
      
      if (cleanLine.startsWith('Company type')) {
        info.type = cleanLine.replace('Company type', '').trim();
      }
      if (cleanLine.startsWith('Founded')) {
        info.founded = cleanLine.replace('Founded', '').trim();
      }
      if (cleanLine.startsWith('Headquarters')) {
        info.headquarters = cleanLine.replace('Headquarters', '').trim();
      }
    });

    return info;
  };

  // Function to extract the main summary (first proper paragraph)
  const extractSummary = (text: string): string => {
    const paragraphs = text.split(/\n+/);
    
    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = cleanText(paragraphs[i]);
      if (
        paragraph.length > 80 &&
        !paragraph.includes('From Wikipedia') &&
        !paragraph.startsWith('Jump to')
      ) {
        const verbs = [' is ', ' was ', ' are ', ' were '];
        let earliestIndex = -1;
        
        for (const verb of verbs) {
          const idx = paragraph.indexOf(verb);
          if (idx !== -1 && (earliestIndex === -1 || idx < earliestIndex)) {
            earliestIndex = idx;
          }
        }
        
        if (earliestIndex !== -1) {
          return paragraph.substring(earliestIndex + 1);
        }
      }
    }
    
    const fallback = cleanText(text);
    const verbs = [' is ', ' was ', ' are ', ' were '];
    let earliestIndex = -1;
    for (const verb of verbs) {
      const idx = fallback.indexOf(verb);
      if (idx !== -1 && (earliestIndex === -1 || idx < earliestIndex)) {
        earliestIndex = idx;
      }
    }
    if (earliestIndex !== -1) {
      return fallback.substring(earliestIndex + 1).slice(0, 300) + '...';
    }
    
    return fallback.slice(0, 300) + '...';
  };

  // Function to extract timeline events
  const extractTimeline = (text: string) => {
    const events: { year: string; event: string }[] = [];
    
    // Remove markdown tables entirely before processing sentences
    const cleanSourceText = text
      .split('\n')
      .filter(line => !line.trim().startsWith('|') && !line.includes('| - |') && !line.includes('|-'))
      .join('\n');

    const lines = cleanSourceText.split(/\.\s+/); // Split by periods for complete sentences
    
    lines.forEach(line => {
      const cleanLine = cleanText(line);
      
      // If the line contains more than one pipe delimiter, it is likely leftover table/infobox text
      const pipeCount = (cleanLine.match(/\|/g) || []).length;
      if (pipeCount > 1) return;

      // Match "In YYYY" pattern
      const match = cleanLine.match(/In (19|20)\d{2}/);
      
      if (match) {
        const year = match[0].replace('In ', '');
        let event = cleanLine;
        
        // Strip leading headers or section titles like "History In YYYY" or "Origins In YYYY"
        const yearIndex = event.indexOf(match[0]);
        if (yearIndex > 0) {
          event = event.substring(yearIndex);
        }
        
        // Remove any reference links at the end and citation numbers
        event = event.replace(/\^.*$/, '').trim();
        event = cleanText(event); // Clean the event text again to ensure all citations are removed
        
        // Only add if it's a meaningful event
        if (event.length > 20 && !event.includes('Retrieved')) {
          events.push({
            year,
            event
          });
        }
      }
    });

    return events.sort((a, b) => parseInt(a.year) - parseInt(b.year));
  };

  const companyInfo = data.text ? extractMetadata(data.text) : {};
  const summary = data.text ? extractSummary(data.text) : '';
  const timeline = data.text ? extractTimeline(data.text) : [];

  return (
    <div className="bg-white rounded-lg shadow-md p-8 transition-all duration-300 hover:shadow-lg">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 border-b pb-4">
        <div className="flex items-center gap-4">
          <div className="bg-[#f6f6f6] p-3 rounded-full">
            <FaWikipediaW className="text-2xl text-[#666]" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Wikipedia</h2>
            <p className="text-sm text-gray-500">
              {data.isFallback 
                ? "Official Wikipedia page not found. Showing AI-generated overview." 
                : "From Wikipedia, the free encyclopedia"}
            </p>
          </div>
        </div>
        {data.isFallback && (
          <span className="self-start sm:self-center text-xs px-2.5 py-1 font-medium bg-amber-50 text-amber-800 border border-amber-200/60 rounded-full">
            AI Generated Fallback
          </span>
        )}
      </div>

      {/* Summary */}
      {summary && (
        <div className="mb-8">
          <p className="text-gray-700 leading-relaxed text-lg">{summary}</p>
        </div>
      )}

      {/* Company Info Grid */}
      {Object.keys(companyInfo).length > 0 && (
        <div className="mb-8">
          <p className="text-xl font-semibold mb-4">Company Information</p>
          <div className="grid md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
            {Object.entries(companyInfo).map(([key, value]) => value && (
              <div key={key} className="flex flex-col">
                <span className="text-sm text-gray-500 font-medium mb-1 capitalize">
                  {key === 'type' ? 'Company Type' : key.charAt(0).toUpperCase() + key.slice(1)}
                </span>
                <span className="text-gray-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      {timeline.length > 0 && (
        <div className="mb-8">
          <p className="text-xl font-semibold mb-4">Major Events</p>
          <div className="space-y-4">
            {timeline
              .slice(0, showAllEvents ? undefined : 3)
              .map((event, index) => (
              <div key={index} className="flex gap-4 items-start group">
                <div className="min-w-[80px] bg-brand-default/10 px-3 py-2 rounded-full text-brand-default font-medium text-sm text-center transition-colors">
                  {event.year}
                </div>
                <p className="text-gray-700 pt-1">{event.event}</p>
              </div>
            ))}
          </div>
          {timeline.length > 3 && (
            <button
              onClick={() => setShowAllEvents(!showAllEvents)}
              className="mt-6 flex items-center gap-2 text-brand-default hover:text-brand-default/80 transition-colors"
            >
              {showAllEvents ? (
                <>
                  Show Less <FiChevronUp className="text-lg" />
                </>
              ) : (
                <>
                  Show More ({timeline.length - 3} more events) <FiChevronDown className="text-lg" />
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Read More Link */}
      {data.url && (
        <a
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#f6f6f6] text-gray-700 px-4 py-2 rounded-full hover:bg-gray-300 transition-colors mt-4"
        >
          <FaWikipediaW />
          Read full article on Wikipedia
        </a>
      )}
    </div>
  );
};

export default WikipediaDisplay; 