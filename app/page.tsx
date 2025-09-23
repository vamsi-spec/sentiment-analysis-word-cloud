"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CommentInput } from "@/components/comment-input";
import { SentimentAnalyzer } from "@/components/sentiment-analyzer";
import { WordCloud } from "@/components/word-cloud";
import { SummaryReport } from "@/components/summary-report";
import { AnalyticsCharts } from "@/components/analytics-charts";
import { ExportControls } from "@/components/export-controls";

interface Comment {
  id: string;
  text: string;
  source?: string;
}

export default function SentimentDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [comments, setComments] = useState<Comment[]>([]);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  const handleCommentsChange = (newComments: Comment[]) => {
    setComments(newComments);
    setAnalysisResults(null);
  };

  const handleAnalysisComplete = (results: any) => {
    setAnalysisResults(results);
  };

  const handleQuickExport = () => {
    if (analysisResults) {
      setActiveTab("reports");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                E-Consultation Analytics
              </h1>
              <p className="text-muted-foreground">
                Sentiment Analysis & Public Opinion Dashboard
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="secondary"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                📈 Live Analysis
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleQuickExport}
                disabled={!analysisResults}
              >
                📥 Export Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <div className="w-full overflow-x-auto">
            <TabsList className="inline-flex h-12 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground min-w-full sm:min-w-0 sm:w-auto">
              <TabsTrigger
                value="overview"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow gap-2 flex-1 sm:flex-initial"
              >
                📊 Overview
              </TabsTrigger>
              <TabsTrigger
                value="upload"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow gap-2 flex-1 sm:flex-initial"
              >
                📤 Upload Data
              </TabsTrigger>
              <TabsTrigger
                value="analysis"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow gap-2 flex-1 sm:flex-initial"
              >
                💬 Analysis
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow gap-2 flex-1 sm:flex-initial"
              >
                📄 Reports
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-blue-700">
                    Total Comments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900">
                    {comments.length}
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    {comments.length === 0
                      ? "Ready for analysis"
                      : "Loaded for analysis"}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-green-700">
                    Positive Sentiment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900">
                    {analysisResults
                      ? `${analysisResults.summary.positivePercentage}%`
                      : "0%"}
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Favorable responses
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-red-700">
                    Negative Sentiment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-900">
                    {analysisResults
                      ? `${analysisResults.summary.negativePercentage}%`
                      : "0%"}
                  </div>
                  <p className="text-xs text-red-600 mt-1">Critical feedback</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-yellow-700">
                    Neutral Sentiment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-900">
                    {analysisResults
                      ? `${analysisResults.summary.neutralPercentage}%`
                      : "0%"}
                  </div>
                  <p className="text-xs text-yellow-600 mt-1">Balanced views</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {analysisResults ? (
                <div className="lg:col-span-2">
                  <AnalyticsCharts analysisResults={analysisResults} />
                </div>
              ) : (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Sentiment Trends</CardTitle>
                      <CardDescription>
                        Real-time sentiment analysis overview
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <div className="text-4xl mb-3 opacity-50">📊</div>
                        <p>Upload comments to see sentiment trends</p>
                      </div>
                    </CardContent>
                  </Card>

                  <WordCloud keywords={[]} />
                </>
              )}
            </div>

            {analysisResults && (
              <WordCloud keywords={analysisResults.keywords} />
            )}
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <CommentInput onCommentsChange={handleCommentsChange} />
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <SentimentAnalyzer
              comments={comments}
              onAnalysisComplete={handleAnalysisComplete}
            />

            {analysisResults && (
              <div className="space-y-6">
                <WordCloud keywords={analysisResults.keywords} />
                <AnalyticsCharts analysisResults={analysisResults} />
              </div>
            )}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <SummaryReport analysisResults={analysisResults} />
            <ExportControls
              analysisResults={analysisResults}
              comments={comments}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
