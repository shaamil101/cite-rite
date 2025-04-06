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
import Graphview from "@/app/graphview";

// Maximum word count allowed
const MAX_WORDS = 5000


// What the citation snippet will look like
interface CitationSnippet {
  citation_id: string;
  snippet: string;
}

// What the Claim will look like
interface Claim {
  start_index: number;
  end_index: number;
  claim_text: string;
  document_id: string;
  parent_claim_ids: string[];
  children_claim_ids: string[];
  relevant_citations: CitationSnippet[];
}

// The full citation details
interface Citation {
  fulltext: string;
  link: string;
  summary: string;
  tags: string[];
}

// The Document structure
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

  // Updating word count when text changes
  useEffect(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    setWordCount(words)
  }, [text])

  //Analyzing the text
  const handleCheck = async() => {
    if (text.trim() === "") return

    setIsAnalyzing(true)
    const scanResult = await postSourceScan(text);
    setScanResult(scanResult);
    const data: Root = JSON.parse(scanResult);
    setClaims(Object.values(data.document.claims));
    setCitations(Object.values(data.document.citations));

    setIsAnalyzing(false);
  }


  // Scrolling to the claim's position in the text and highlighting it
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
                {/* Claims cards */}
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
                            //console.log("citation_num:", citationId);
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
        <div className="py-6">
  <div className="flex items-center gap-2">
    <h1 className="text-3xl font-bold text-gray-800">Graph View</h1>
  </div>
</div>

        <Graphview claims = {claims} citations = {citations} />
      </div>
    </main>
  )
}

