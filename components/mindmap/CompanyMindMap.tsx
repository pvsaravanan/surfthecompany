'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import "@excalidraw/excalidraw/index.css";

// Dynamically import Excalidraw with SSR disabled
const Excalidraw = dynamic(
  () => import('@excalidraw/excalidraw').then((mod) => mod.Excalidraw),
  { ssr: false }
);

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

const cleanText = (text: string) => {
  return text
    .replace(/["'\[\]\(\)\{\}\-\->]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const generateMermaidCode = (data: CompanyMapData) => {
  let mermaid = 'flowchart LR\n';
  
  // Central Root Node
  const rootText = `${cleanText(data.companyName)}<br/>(${cleanText(data.rootNode.title)})`;
  mermaid += `  root["${rootText}"]\n`;
  
  // Level 1 and Level 2 Nodes
  data.rootNode.children.forEach((l1Node, l1Idx) => {
    const l1Id = `l1_${l1Idx}`;
    const l1Text = cleanText(l1Node.title);
    mermaid += `  ${l1Id}["${l1Text}"]\n`;
    mermaid += `  root --> ${l1Id}\n`;
    
    const l2Nodes = l1Node.children || [];
    l2Nodes.forEach((l2Node, l2Idx) => {
      const l2Id = `l2_${l1Idx}_${l2Idx}`;
      const l2Text = `${cleanText(l2Node.title)}<br/>${cleanText(l2Node.description || '')}`;
      mermaid += `  ${l2Id}["${l2Text}"]\n`;
      mermaid += `  ${l1Id} --> ${l2Id}\n`;
    });
  });
  
  return mermaid;
};

const CompanyMindMap: React.FC<CompanyMindMapProps> = ({ data }) => {
  const [elements, setElements] = useState<any[]>([]);

  useEffect(() => {
    const convertData = async () => {
      try {
        const { convertToExcalidrawElements } = await import('@excalidraw/excalidraw');
        const { parseMermaidToExcalidraw } = await import('@excalidraw/mermaid-to-excalidraw');
        
        const mermaidCode = generateMermaidCode(data);
        console.log('Generated Mermaid code:\n', mermaidCode);

        const { elements: parsedElements } = await parseMermaidToExcalidraw(mermaidCode, {
          themeVariables: {
            fontSize: '14px',
          }
        });
        const excalidrawElements = convertToExcalidrawElements(parsedElements).map((el: any) => {
          if (el.type === "text" && el.text) {
            const newText = el.text.replace(/\\n|<br\s*\/?>/gi, "\n");
            if (newText !== el.text) {
              return { ...el, text: newText };
            }
          }
          return el;
        });
        setElements(excalidrawElements);
      } catch (err) {
        console.error('Failed to convert mermaid to excalidraw:', err);
      }
    };
    
    convertData();
  }, [data]);

  return (
    <div className="w-full h-[600px] bg-slate-50 border border-slate-200 rounded-xl overflow-hidden relative shadow-sm">
      {elements.length > 0 && (
        <Excalidraw
          initialData={{
            elements,
            appState: {
              viewBackgroundColor: '#f8fafc',
              currentItemStrokeColor: '#1e293b',
              currentItemFontFamily: 2,
            },
          }}
          viewModeEnabled={true}
        />
      )}
    </div>
  );
};

export default CompanyMindMap; 