'use client';

import React, { useEffect, useState, useRef } from 'react';

interface MindMapNode {
  title: string;
  description?: string;
  children?: MindMapNode[];
}

interface CompanyMapData {
  companyName: string;
  rootNode: {
    title: string;
    children: MindMapNode[];
  };
}

interface CompanyMindMapProps {
  data: CompanyMapData;
}

const CompanyMindMap: React.FC<CompanyMindMapProps> = ({ data }) => {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchSvg = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/rendermindmap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to render mindmap');
        }

        const result = await res.json();
        if (!cancelled) {
          setSvgContent(result.svg);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to render mindmap');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchSvg();
    return () => { cancelled = true; };
  }, [data]);

  if (isLoading) {
    return (
      <div className="w-full h-[400px] bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center animate-pulse">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Rendering Mind Map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[200px] bg-red-50 border border-red-200 rounded-xl flex items-center justify-center">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl overflow-auto shadow-sm p-4"
    >
      {svgContent && (
        <div
          className="mindmap-svg-container w-full flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      )}
      <style jsx global>{`
        .mindmap-svg-container svg {
          max-width: 100%;
          height: auto;
          min-height: 300px;
        }
      `}</style>
    </div>
  );
};

export default CompanyMindMap;