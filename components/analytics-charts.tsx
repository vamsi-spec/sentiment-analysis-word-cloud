"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts"

interface AnalyticsChartsProps {
  analysisResults: any
}

export function AnalyticsCharts({ analysisResults }: AnalyticsChartsProps) {
  if (!analysisResults) {
    return null
  }

  // Prepare data for charts
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

  // Top keywords for bar chart
  const keywordData = analysisResults.keywords.slice(0, 10).map((keyword: any) => ({
    word: keyword.word,
    count: keyword.count,
  }))

  // Sentiment distribution over comment index (simulating time series)
  const sentimentTrendData = analysisResults.results.map((result: any, index: number) => ({
    index: index + 1,
    score: result.analysis.sentiment.score,
    sentiment: result.analysis.sentiment.label,
  }))

  // Word count distribution
  const wordCountData = analysisResults.results.reduce((acc: any, result: any) => {
    const range = Math.floor(result.analysis.wordCount / 10) * 10
    const key = `${range}-${range + 9}`
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const wordCountChartData = Object.entries(wordCountData).map(([range, count]) => ({
    range,
    count,
  }))

  // Confidence distribution
  const confidenceData = analysisResults.results.reduce((acc: any, result: any) => {
    const confidence = Math.floor(result.analysis.sentiment.confidence * 10) / 10
    acc[confidence] = (acc[confidence] || 0) + 1
    return acc
  }, {})

  const confidenceChartData = Object.entries(confidenceData)
    .map(([confidence, count]) => ({
      confidence: Number.parseFloat(confidence as string),
      count,
    }))
    .sort((a, b) => a.confidence - b.confidence)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sentiment Distribution Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Distribution</CardTitle>
          <CardDescription>Overall sentiment breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any, name: any) => [`${value} comments`, name]} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Keywords Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top Keywords</CardTitle>
          <CardDescription>Most frequently mentioned words</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={keywordData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="word" angle={-45} textAnchor="end" height={80} fontSize={12} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sentiment Trend Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Trend</CardTitle>
          <CardDescription>Sentiment scores across comments</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sentimentTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="index" />
              <YAxis domain={[-1, 1]} />
              <Tooltip
                formatter={(value: any) => [value.toFixed(3), "Sentiment Score"]}
                labelFormatter={(label) => `Comment ${label}`}
              />
              <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Word Count Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Comment Length Distribution</CardTitle>
          <CardDescription>Distribution of word counts in comments</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={wordCountChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Confidence Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Confidence</CardTitle>
          <CardDescription>Distribution of sentiment analysis confidence scores</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={confidenceChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="confidence" tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
              <YAxis />
              <Tooltip
                formatter={(value: any) => [`${value} comments`, "Count"]}
                labelFormatter={(label) => `Confidence: ${(label * 100).toFixed(0)}%`}
              />
              <Bar dataKey="count" fill="#84cc16" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Statistics</CardTitle>
          <CardDescription>Key metrics and statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
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
