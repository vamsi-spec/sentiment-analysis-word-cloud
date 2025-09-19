"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AnalyticsChartsProps {
  analysisResults: any
}

export function AnalyticsCharts({ analysisResults }: AnalyticsChartsProps) {
  if (!analysisResults) {
    return null
  }

  const sentimentData = [
    {
      name: "Positive",
      value: analysisResults.summary.positive,
      percentage: analysisResults.summary.positivePercentage,
      color: "#10b981",
    },
    {
      name: "Negative",
      value: analysisResults.summary.negative,
      percentage: analysisResults.summary.negativePercentage,
      color: "#ef4444",
    },
    {
      name: "Neutral",
      value: analysisResults.summary.neutral,
      percentage: analysisResults.summary.neutralPercentage,
      color: "#f59e0b",
    },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sentiment Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Distribution</CardTitle>
          <CardDescription>Overall sentiment breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sentimentData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{item.value}</div>
                  <div className="text-sm text-muted-foreground">{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Keywords */}
      <Card>
        <CardHeader>
          <CardTitle>Top Keywords</CardTitle>
          <CardDescription>Most frequently mentioned words</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analysisResults.keywords.slice(0, 10).map((keyword: any, index: number) => (
              <div key={keyword.word} className="flex items-center justify-between">
                <span className="font-medium">{keyword.word}</span>
                <div className="flex items-center gap-2">
                  <div
                    className="h-2 bg-blue-500 rounded"
                    style={{ width: `${(keyword.count / analysisResults.keywords[0].count) * 100}px` }}
                  />
                  <span className="text-sm text-muted-foreground w-8 text-right">{keyword.count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Analysis Statistics</CardTitle>
          <CardDescription>Key metrics and statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{analysisResults.summary.total}</div>
              <div className="text-sm text-blue-600">Total Comments</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">{analysisResults.keywords.length}</div>
              <div className="text-sm text-purple-600">Unique Keywords</div>
            </div>

            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <div className="text-2xl font-bold text-indigo-700">
                {analysisResults.summary.averageScore.toFixed(3)}
              </div>
              <div className="text-sm text-indigo-600">Avg. Sentiment</div>
            </div>

            <div className="text-center p-4 bg-teal-50 rounded-lg">
              <div className="text-2xl font-bold text-teal-700">
                {Math.round(
                  (analysisResults.results.reduce((sum: number, r: any) => sum + r.analysis.sentiment.confidence, 0) /
                    analysisResults.results.length) *
                    100,
                )}
                %
              </div>
              <div className="text-sm text-teal-600">Avg. Confidence</div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Most Positive Comment</span>
              <span className="text-sm text-green-600">
                Score: {Math.max(...analysisResults.results.map((r: any) => r.analysis.sentiment.score)).toFixed(3)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Most Negative Comment</span>
              <span className="text-sm text-red-600">
                Score: {Math.min(...analysisResults.results.map((r: any) => r.analysis.sentiment.score)).toFixed(3)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Most Common Word</span>
              <span className="text-sm text-blue-600">
                "{analysisResults.keywords[0]?.word}" ({analysisResults.keywords[0]?.count} times)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
