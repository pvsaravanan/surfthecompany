// app/api/rendermindmap/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCache, cacheKey } from '@/lib/cache';

export const maxDuration = 30;

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

function cleanText(text: string): string {
  return text
    .replace(/["\[\](){}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function generateMermaidCode(data: CompanyMapData): string {
  let mermaid = 'flowchart LR\n';

  const rootText = cleanText(data.companyName);
  mermaid += `  root["${rootText}"]\n`;

  data.rootNode.children.forEach((l1Node, l1Idx) => {
    const l1Id = `l1_${l1Idx}`;
    const l1Text = cleanText(l1Node.title);
    mermaid += `  ${l1Id}["${l1Text}"]\n`;
    mermaid += `  root --> ${l1Id}\n`;

    const l2Nodes = l1Node.children || [];
    l2Nodes.forEach((l2Node, l2Idx) => {
      const l2Id = `l2_${l1Idx}_${l2Idx}`;
      const l2Text = cleanText(l2Node.title);
      mermaid += `  ${l2Id}["${l2Text}"]\n`;
      mermaid += `  ${l1Id} --> ${l2Id}\n`;
    });
  });

  // Add styling
  mermaid += '\n  classDef default fill:#fff,stroke:#cbd5e1,stroke-width:1.5px,color:#1e293b,font-size:12px\n';
  mermaid += '  classDef root fill:#2563eb,stroke:#1d4ed8,stroke-width:2px,color:#fff,font-size:14px,font-weight:bold\n';
  mermaid += '  class root root\n';

  return mermaid;
}

export async function POST(req: NextRequest) {
  try {
    const mapData: CompanyMapData = await req.json();

    if (!mapData || !mapData.rootNode) {
      return NextResponse.json({ error: 'Invalid map data' }, { status: 400 });
    }

    const key = cacheKey('rendermindmap', { companyName: mapData.companyName });
    const cached = getCached(key);
    if (cached) return NextResponse.json(cached);

    const mermaidCode = generateMermaidCode(mapData);

    // Encode to base64 for mermaid.ink API
    const encoded = Buffer.from(mermaidCode, 'utf-8').toString('base64');
    const svgUrl = `https://mermaid.ink/svg/${encoded}`;

    const svgResponse = await fetch(svgUrl, {
      headers: { 'Accept': 'image/svg+xml' },
    });

    if (!svgResponse.ok) {
      throw new Error(`mermaid.ink returned ${svgResponse.status}`);
    }

    const svgText = await svgResponse.text();
    const response = { svg: svgText, mermaidCode };
    setCache(key, response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Mindmap render error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to render mindmap' },
      { status: 500 }
    );
  }
}
