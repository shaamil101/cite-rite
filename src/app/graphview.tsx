"use client"

import { useState, useRef, useEffect } from "react"
import Tree from 'react-d3-tree'
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./components/ui/collapsible"
import { ChevronDown, ExternalLink } from "lucide-react"

// Interfaces
interface CitationSnippet {
  citation_id: string;
  snippet: string;
}

interface Claim {
  start_index: number;
  end_index: number;
  claim_text: string;
  document_id: string;
  parent_claim_ids: string[];
  children_claim_ids: string[];
  relevant_citations: CitationSnippet[];
}

interface Citation {
  fulltext: string;
  link: string;
  summary: string;
  tags: string[];
}

interface GraphViewProps {
  claims: Claim[];
  citations: Citation[];
}

interface TreeNode {
  name: string;
  attributes?: {
    text: string;
    claimIndex: number;
  };
  children: TreeNode[];
}

// Custom Node Component with better text spacing
const CustomNode = ({ nodeDatum, onNodeClick }: any) => (
  <g onClick={onNodeClick} className="tree-node">
    <circle />
    <text>
      {nodeDatum.name}
    </text>
  </g>
);

function Graphview({ claims, citations }: GraphViewProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateDimensions);
    return () => {
      window.removeEventListener('resize', updateDimensions);
      resizeObserver.disconnect();
    };
  }, []);

  const convertClaimsToTreeData = (claims: Claim[], rootClaim: Claim): TreeNode => ({
    name: `Claim ${claims.indexOf(rootClaim) + 1}`,
    attributes: { 
      text: rootClaim.claim_text,
      claimIndex: claims.indexOf(rootClaim)
    },
    children: rootClaim.children_claim_ids.map(childId => 
      convertClaimsToTreeData(claims, claims[parseInt(childId)])
    )
  });

  const handleNodeClick = (nodeData: any) => {
    const claimMatch = nodeData.name.match(/Claim (\d+)/);
    if (claimMatch) {
      const claimIndex = parseInt(claimMatch[1]) - 1;
      const claimCard = document.getElementById(`claim-card-${claimIndex}`);
      if (claimCard) {
        claimCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        claimCard.style.transition = 'background-color 0.3s ease';
        claimCard.style.backgroundColor = '#f0f0ff';
        setTimeout(() => {
          claimCard.style.backgroundColor = '';
        }, 1000);
      }
    }
  };

  const rootClaims = claims.filter(claim => claim.parent_claim_ids.length === 0);
  const treeData = {
    name: 'Claims',
    attributes: { text: 'Root', claimIndex: -1 },
    children: rootClaims.map(rootClaim => convertClaimsToTreeData(claims, rootClaim))
  };

  // Calculate dimensions based on the number of nodes
  const nodeCount = claims.length;
  const minWidth = Math.max(130 * nodeCount, 350);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div 
        ref={containerRef}
        className="tree-container h-[calc(100vh-200px)] min-h-[500px]"
      >
        {dimensions.width > 0 && (
          <Tree
            data={treeData}
            orientation="vertical"
            pathFunc="step"
            renderCustomNodeElement={(rd3tProps) => 
              CustomNode({ 
                ...rd3tProps, 
                onNodeClick: () => handleNodeClick(rd3tProps.nodeDatum)
              })
            }
            translate={{ 
              x: dimensions.width / 2,
              y: 50
            }}
            separation={{ siblings: 1.75, nonSiblings: 2 }}
            nodeSize={{ x: minWidth / (nodeCount + 1), y: 80 }}
            zoomable
            draggable
            collapsible={false}
            zoom={0.85}
            centeringTransitionDuration={200}
            pathClassFunc={() => 'rd3t-link'}
          />
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 h-[calc(100vh-200px)] min-h-[500px] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-semibold">Claims</h1>
      </div>
        <div className="space-y-6">
          {claims.map((claim, index) => (
            <Card 
              key={`claim-${claim.start_index}-${claim.end_index}`} 
              id={`claim-card-${index}`}
              className="border border-gray-200 transition-colors duration-300"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Claim {index + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 border-l-4 border-gray-300 pl-4 py-2 italic">
                  "{claim.claim_text}"
                </p>
                <Collapsible className="border rounded-md">
                  <CollapsibleTrigger className="flex w-full justify-between items-center p-4 hover:bg-gray-50">
                    <span className="font-medium">View Citations</span>
                    <ChevronDown className="h-5 w-5" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4 space-y-4">
                    {claim.relevant_citations.length === 0 ? (
                      <p>No citations for this claim found!</p>
                    ) : (
                      claim.relevant_citations.map((citationId, index) => {
                        const citation = citations[parseInt(citationId.citation_id, 10) - 1];
                        if (!citation) return null;
                        return (
                          <div key={index} className="border-t pt-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">Citation {index + 1}</h4>
                              <a
                                href={citation.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {citationId.snippet}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Graphview;
