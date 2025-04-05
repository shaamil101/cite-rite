"use client"

import { useState, useRef, useEffect } from "react"
import { postSourceScan } from "../api/sourceScan";
import { Textarea } from "./components/ui/textarea"
import { Button } from "./components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./components/ui/collapsible"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card"
import { Progress } from "./components/ui/progress"
import { HelpCircle, ExternalLink, ChevronDown } from "lucide-react"
import { WeekNumberLabel } from "react-day-picker";

// Maximum word count allowed
const MAX_WORDS = 5000


// Sample data structure for claims and citations
// interface Citation {
//   id: string
//   title: string
//   url: string
//   summary: string
//   fullText: string
// }

// interface Claim {
//   id: string
//   text: string
//   textPosition: { start: number; end: number }
//   citations: Citation[]
// }

interface CitationSnippet {
  citation_id: string;
  snippet: string;
}
// Define Claim type
interface Claim {
  start_index: number;
  end_index: number;
  claim_text: string;
  document_id: string;
  parent_claim_ids: string[];
  children_claim_ids: string[];
  relevant_citations: CitationSnippet[];
}

// Define full citation details
interface Citation {
  fulltext: string;
  link: string;
  summary: string;
  tags: string[];
}

// Define Document structure
interface DocumentData {
  claims: Claim[];
  citations: Citation[];
}

// Overall JSON structure
interface Root {
  document: DocumentData;
}


export default function Home() {
  const [text, setText] = useState<string>("")
  const [wordCount, setWordCount] = useState<number>(0)
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false)
  const [claims, setClaims] = useState<Claim[]>([])
  const [citations, setCitations] = useState<Citation[]>([])
  const [scanResult, setScanResult] = useState<string | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  // Update word count when text changes
  useEffect(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    setWordCount(words)
  }, [text])

  // Simulate analyzing the text
  const handleCheck = async() => {
    if (text.trim() === "") return

    setIsAnalyzing(true)

    // Simulate API call with timeout
    setTimeout(() => {
      // Sample data - in a real app, this would come from your backend
      // const sampleClaims: Claim[] = [
      //   {
      //     id: "claim1",
      //     text: "AI-generated content often lacks proper citations, leading to potential misinformation.",
      //     textPosition: { start: 0, end: 100 },
      //     citations: [
      //       {
      //         id: "citation1",
      //         title: "The Impact of AI on Academic Integrity",
      //         url: "https://example.com/ai-academic-integrity",
      //         summary:
      //           "Research shows that 78% of AI-generated academic content lacks proper citations or references, contributing to the spread of unverified information.",
      //         fullText:
      //           "In a comprehensive study conducted across 50 universities, researchers found that AI-generated content consistently demonstrated a lack of proper citation practices. The study revealed that 78% of AI-generated academic papers contained claims without appropriate references, compared to only 23% in human-written papers. This significant disparity highlights a critical concern in the era of AI writing assistants and raises questions about the mechanisms needed to ensure academic integrity in an increasingly AI-assisted educational landscape.",
      //       },
      //       {
      //         id: "citation2",
      //         title: "Misinformation in the Age of AI",
      //         url: "https://example.com/misinformation-ai",
      //         summary:
      //           "A 2024 study found that uncited AI-generated content is 3x more likely to contain factual errors compared to properly cited content.",
      //         fullText:
      //           "The proliferation of AI-generated content has introduced new challenges in combating misinformation. According to a 2024 study published in the Journal of Digital Ethics, content produced by large language models without proper citation mechanisms was three times more likely to contain factual inaccuracies compared to content with robust citation frameworks. The study analyzed over 10,000 articles across various domains and found that the absence of citations not only reduced verifiability but also correlated strongly with an increased presence of outdated or contextually misapplied information.",
      //       },
      //     ],
      //   },
      //   {
      //     id: "claim2",
      //     text: "Students who verify their AI-assisted writing with citation tools receive higher grades on average.",
      //     textPosition: { start: 150, end: 250 },
      //     citations: [
      //       {
      //         id: "citation3",
      //         title: "Educational Outcomes with AI Writing Assistants",
      //         url: "https://example.com/ai-education-outcomes",
      //         summary:
      //           "A study of 1,200 undergraduate students found that those who used citation verification tools with AI writing received grades averaging 15% higher than those who didn't.",
      //         fullText:
      //           "In a longitudinal study following 1,200 undergraduate students across diverse disciplines, researchers observed a significant correlation between the use of citation verification tools and academic performance. Students who systematically verified the claims in their AI-assisted writing using specialized citation tools received grades averaging 15% higher than their counterparts who used AI without verification mechanisms. The improvement was particularly pronounced in research-intensive courses, where the ability to substantiate claims with credible sources is especially valued. The study controlled for variables such as prior academic performance, suggesting that the citation verification process itself contributed to higher quality work rather than simply reflecting the habits of already high-performing students.",
      //       },
      //     ],
      //   },
      // ]
      // call parse json
     
    }, 1500)

    const scanResult = await postSourceScan(text);
    setScanResult(scanResult);
    const data: Root = JSON.parse(scanResult);
    setClaims(Object.values(data.document.claims));
    setCitations(Object.values(data.document.citations));

    setIsAnalyzing(false);
  }

  const parseJson = (text:string) => {
    // Define Citation type
    
    const data: Root = JSON.parse(text);




  }

  // Scroll to the claim's position in the text and highlight it
  const scrollToClaimInText = (claim: Claim) => {
    if (textAreaRef.current) {
      textAreaRef.current.focus()
      textAreaRef.current.setSelectionRange(claim.start_index, claim.end_index)

      // Scroll to make the highlighted text visible
      const textArea = textAreaRef.current
      const text = textArea.value

      // Calculate the line number of the start position
      const textBeforeStart = text.substring(0, claim.start_index)
      const linesBeforeStart = textBeforeStart.split("\n").length - 1

      // Approximate scroll position based on line height
      const lineHeight = 20 // Estimated line height in pixels
      textArea.scrollTop = linesBeforeStart * lineHeight
    }
  }

  //console.log("claims:", typeof(claims));

  return (
    <main className="min-h-screen">
    

      <div className="container mx-auto py-8 px-4">
      <header className="w-full px-6 py-4 border-b">
      <div className="flex flex-col items-start">
  <div className="flex items-center gap-2">
    <h1 className="text-5xl font-bold text-gray-800" >Cite Rite</h1>
    <span className="text-sm text-muted-foreground flex items-center">
      By
      <img
        src="/gptzero.png"
        alt="GPT Zero"
        width={60}
        height={12}
        className="ml-2"
      />
    </span>
  </div>

  <p className="text-l text-muted-foreground mt-1">
       Find citations. Back up your claims.
  </p>
  </div>
</header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Text Input Section */}
          <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-[calc(100vh-200px)] min-h-[500px] relative">
            <Textarea
              ref={textAreaRef}
              placeholder="Enter your text here..."
              className="flex-grow resize-none p-4 pb-16" // Added padding at bottom for the overlay
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center bg-white bg-opacity-90 p-2 rounded-md border border-gray-100 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 relative">
                  <Progress value={(wordCount / MAX_WORDS) * 100} className="h-8 w-8 rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs">{Math.min(Math.round((wordCount / MAX_WORDS) * 100), 100)}%</span>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {wordCount}/{MAX_WORDS}
                </span>
              </div>
              <Button onClick={handleCheck} disabled={isAnalyzing || text.trim() === ""} className="px-6">
                {isAnalyzing ? "Analyzing..." : "Check"}
              </Button>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-lg shadow-md p-6 h-[calc(100vh-200px)] min-h-[500px] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Results</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <HelpCircle className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>How to use Cite Rite</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <p>Cite Rite helps you validate the claims in your text by finding relevant citations.</p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Enter your text in the input area on the left.</li>
                      <li>Click the "Check" button to analyze your text.</li>
                      <li>Review the claims identified in your text.</li>
                      <li>Expand "View Citations" to see supporting evidence for each claim.</li>
                      <li>Click "Go to Text" to locate the claim in your original text.</li>
                    </ol>
                    <p>Use Cite Rite to ensure your writing is evidence-based and well-supported!</p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {claims.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[calc(100%-60px)] text-gray-500">
                {isAnalyzing ? <p>Analyzing your text...</p> : <p>Enter text and click "Check" to see results</p>}
              </div>
            ) : (
              <div className="space-y-6">
                {claims.map((claim, index) => (
                  <Card key={`claim-${claim.start_index}-${claim.end_index}`} className="border border-gray-200">
                    <CardHeader className="pb-2 flex flex-row justify-between items-center">
                      <CardTitle className="text-lg font-medium">Claim {index+1}</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full px-4"
                        onClick={() => scrollToClaimInText(claim)}
                      >
                        Go to Text
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-700 border-l-4 border-gray-300 pl-4 py-2 italic">"{claim.claim_text}"</p>

                      <Collapsible className="border rounded-md">
                        <CollapsibleTrigger className="flex w-full justify-between items-center p-4 hover:bg-gray-50">
                          <span className="font-medium">View Citations</span>
                          <ChevronDown className="h-5 w-5" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="px-4 pb-4 space-y-4">
                          {
                          
                          claim.relevant_citations.length === 0 ? ( 
                            <p> No citations for this claim found!</p>
                          ) :
                          (
                          claim.relevant_citations.map((citationId, index) => {
                            const citation_num = parseInt(citationId.citation_id,10)-1;
                            console.log("citation_num:", citationId);
                            const citation = citations[citation_num];
                            if (!citation) return null;
                            return (
                              <div key={citation_num} className="border-t pt-4">
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

                                <Collapsible className="border rounded-md mt-2">
                                  <CollapsibleTrigger className="flex w-full justify-between items-center p-2 text-sm hover:bg-gray-50">
                                    <span>View Summary</span>
                                    <ChevronDown className="h-4 w-4" />
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="p-3 text-sm text-gray-700 bg-gray-50">
                                    {citation.summary}
                                  </CollapsibleContent>
                                  </Collapsible>

                                  <Collapsible className="border rounded-md mt-2">
                                  <CollapsibleTrigger className="flex w-full justify-between items-center p-2 text-sm hover:bg-gray-50">
                                    <span>View Full Text</span>
                                    <ChevronDown className="h-4 w-4" />
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="p-3 text-sm text-gray-700 bg-gray-50">
                                    {citation.fulltext}
                                  </CollapsibleContent>
                                </Collapsible>
                              </div>
                            );
                          }))}
                        </CollapsibleContent>
                      </Collapsible>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

