"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { analyzeBatchCommentsAction } from "@/lib/actions"

interface Comment {
  id: string
  text: string
  source?: string
}

interface SentimentAnalyzerProps {
  comments: Comment[]
  onAnalysisComplete: (results: any) => void
}

export function SentimentAnalyzer({ comments, onAnalysisComplete }: SentimentAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<any>(null)

  const runAnalysis = async () => {
    if (comments.length === 0) return

    setIsAnalyzing(true)

    try {
      const results = await analyzeBatchCommentsAction(comments)
      setAnalysisResults(results)
      onAnalysisComplete(results)
    } catch (error) {
      console.error("Analysis failed:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getSentimentIcon = (label: string) => {
    switch (label) {
      case "positive":
        return <span className="text-green-600">📈</span>
      case "negative":
        return <span className="text-red-600">📉</span>
      default:
        return <span className="text-yellow-600">➖</span>
    }
  }

  const getSentimentColor = (label: string) => {
    switch (label) {
      case "positive":
        return "bg-green-100 text-green-800 border-green-200"
      case "negative":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Analysis Control */}
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Analysis</CardTitle>
          <CardDescription>Analyze the sentiment of {comments.length} loaded comments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={runAnalysis}
              disabled={comments.length === 0 || isAnalyzing}
              className="flex items-center gap-2"
            >
              {isAnalyzing ? <span className="animate-spin">⏳</span> : <span>▶️</span>}
              {isAnalyzing ? "Analyzing..." : "Start Analysis"}
            </Button>
            <div className="text-sm text-muted-foreground">
              {comments.length === 0 ? "No comments to analyze" : `${comments.length} comments ready for analysis`}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResults && (
        <>
          {/* Summary Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Summary</CardTitle>
              <CardDescription>Overall sentiment distribution and statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-700">{analysisResults.summary.positivePercentage}%</div>
                  <div className="text-sm text-green-600">Positive</div>
                  <div className="text-xs text-green-500 mt-1">{analysisResults.summary.positive} comments</div>
                </div>

                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-700">{analysisResults.summary.negativePercentage}%</div>
                  <div className="text-sm text-red-600">Negative</div>
                  <div className="text-xs text-red-500 mt-1">{analysisResults.summary.negative} comments</div>
                </div>

                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-700">{analysisResults.summary.neutralPercentage}%</div>
                  <div className="text-sm text-yellow-600">Neutral</div>
                  <div className="text-xs text-yellow-500 mt-1">{analysisResults.summary.neutral} comments</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Positive Sentiment</span>
                  <span>{analysisResults.summary.positivePercentage}%</span>
                </div>
                <Progress value={analysisResults.summary.positivePercentage} className="h-2" />

                <div className="flex justify-between text-sm">
                  <span>Negative Sentiment</span>
                  <span>{analysisResults.summary.negativePercentage}%</span>
                </div>
                <Progress value={analysisResults.summary.negativePercentage} className="h-2" />

                <div className="flex justify-between text-sm">
                  <span>Neutral Sentiment</span>
                  <span>{analysisResults.summary.neutralPercentage}%</span>
                </div>
                <Progress value={analysisResults.summary.neutralPercentage} className="h-2" />
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Average Sentiment Score:{" "}
                  <span className="font-medium">{analysisResults.summary.averageScore.toFixed(3)}</span>
                  <span className="text-xs ml-2">(-1 = very negative, +1 = very positive)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Individual Results */}
          <Card>
            <CardHeader>
              <CardTitle>Individual Comment Analysis</CardTitle>
              <CardDescription>Detailed sentiment analysis for each comment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {analysisResults.results.map((result: any) => (
                  <div key={result.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm flex-1">{result.text}</p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getSentimentIcon(result.analysis.sentiment.label)}
                        <Badge className={getSentimentColor(result.analysis.sentiment.label)}>
                          {result.analysis.sentiment.label}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Score: {result.analysis.sentiment.score.toFixed(3)}</span>
                      <span>Confidence: {Math.round(result.analysis.sentiment.confidence * 100)}%</span>
                      <span>Words: {result.analysis.wordCount}</span>
                    </div>

                    {result.analysis.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {result.analysis.keywords.slice(0, 5).map((keyword: string) => (
                          <Badge key={keyword} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
