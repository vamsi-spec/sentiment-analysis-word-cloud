"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { generateSummary } from "@/lib/summary-generator";

interface SummaryReportProps {
  analysisResults: any;
}

export function SummaryReport({ analysisResults }: SummaryReportProps) {
  if (!analysisResults) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
          <CardDescription>Comprehensive analysis report</CardDescription>
        </CardHeader>
        <CardContent className="h-96 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <div className="text-6xl mb-4 opacity-50">📄</div>
            <p className="text-lg mb-2">No analysis data available</p>
            <p>Complete sentiment analysis to generate summary report</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const summary = generateSummary(
    analysisResults.results,
    analysisResults.summary,
    analysisResults.keywords
  );

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="text-xl text-blue-600">📄</span>
            <CardTitle>Executive Summary</CardTitle>
          </div>
          <CardDescription>
            High-level overview of public consultation results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed">
            {summary.executiveSummary}
          </p>
        </CardContent>
      </Card>

      {/* Key Findings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="text-xl text-green-600">📈</span>
            <CardTitle>Key Findings</CardTitle>
          </div>
          <CardDescription>
            Primary insights from the sentiment analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {summary.keyFindings.map((finding, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-foreground">{finding}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Sentiment Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="text-xl text-purple-600">📊</span>
            <CardTitle>Sentiment Overview</CardTitle>
          </div>
          <CardDescription>
            Detailed breakdown of public sentiment patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed mb-4">
            {summary.sentimentOverview}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-lg font-semibold text-green-700">
                {analysisResults.summary.positivePercentage}%
              </div>
              <div className="text-sm text-green-600">Positive</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="text-lg font-semibold text-red-700">
                {analysisResults.summary.negativePercentage}%
              </div>
              <div className="text-sm text-red-600">Negative</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-lg font-semibold text-yellow-700">
                {analysisResults.summary.neutralPercentage}%
              </div>
              <div className="text-sm text-yellow-600">Neutral</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Concerns */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="text-xl text-orange-600">⚠️</span>
            <CardTitle>Key Concerns</CardTitle>
          </div>
          <CardDescription>
            Primary issues and concerns raised by respondents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {summary.topConcerns.map((concern, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-orange-500 mt-0.5 flex-shrink-0">⚠️</span>
                <span className="text-foreground">{concern}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="text-xl text-yellow-600">💡</span>
            <CardTitle>Recommendations</CardTitle>
          </div>
          <CardDescription>
            Strategic recommendations based on analysis results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {summary.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-yellow-500 mt-0.5 flex-shrink-0">💡</span>
                <span className="text-foreground">{recommendation}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Methodology */}
      <Card>
        <CardHeader>
          <CardTitle>Methodology</CardTitle>
          <CardDescription>
            Analysis approach and technical details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {summary.methodology}
          </p>

          <Separator className="my-4" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium text-foreground">Total Comments</div>
              <div className="text-muted-foreground">
                {analysisResults.summary.total}
              </div>
            </div>
            <div>
              <div className="font-medium text-foreground">Unique Keywords</div>
              <div className="text-muted-foreground">
                {analysisResults.keywords.length}
              </div>
            </div>
            <div>
              <div className="font-medium text-foreground">Avg. Sentiment</div>
              <div className="text-muted-foreground">
                {analysisResults.summary.averageScore.toFixed(3)}
              </div>
            </div>
            <div>
              <div className="font-medium text-foreground">Analysis Date</div>
              <div className="text-muted-foreground">
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
