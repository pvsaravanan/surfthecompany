import React from 'react';

interface SummaryItem {
  heading: string;
  text: string;
}

interface CompanySummaryProps {
  summary: SummaryItem[];
}

const CompanySummary: React.FC<CompanySummaryProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
      {summary.map((item, index) => (
        <div 
          key={index} 
          className="bg-white border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-brand-default/20 transition-all duration-300 flex flex-col justify-between"
        >
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2 border-b border-gray-50 pb-2">
              <span className="w-1.5 h-5 bg-brand-default rounded-sm inline-block shrink-0"></span>
              {item.heading}
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              {item.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CompanySummary;
