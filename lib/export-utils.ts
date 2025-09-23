import { generateSummary } from "./summary-generator";

interface ExportData {
  analysisResults: any;
  comments: Array<{ id: string; text: string; source?: string }>;
  timestamp: string;
}

export function exportToCSV(data: ExportData): string {
  const { analysisResults } = data;

  const headers = [
    "Comment ID",
    "Comment Text",
    "Source",
    "Sentiment Label",
    "Sentiment Score",
    "Confidence",
    "Word Count",
    "Top Keywords",
  ];

  const rows = analysisResults.results.map((result: any) => [
    result.id,
    `"${result.text.replace(/"/g, '""')}"`, // Escape quotes
    result.source || "Manual Input",
    result.analysis.sentiment.label,
    result.analysis.sentiment.score.toFixed(3),
    result.analysis.sentiment.confidence.toFixed(3),
    result.analysis.wordCount,
    `"${result.analysis.keywords.slice(0, 5).join(", ")}"`,
  ]);

  const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");

  return csvContent;
}

export function exportToJSON(data: ExportData): string {
  const summary = generateSummary(
    data.analysisResults.results,
    data.analysisResults.summary,
    data.analysisResults.keywords
  );

  const exportObject = {
    metadata: {
      exportDate: data.timestamp,
      totalComments: data.analysisResults.summary.total,
      analysisVersion: "1.0.0",
    },
    summary: {
      sentimentDistribution: {
        positive: data.analysisResults.summary.positivePercentage,
        negative: data.analysisResults.summary.negativePercentage,
        neutral: data.analysisResults.summary.neutralPercentage,
      },
      averageSentimentScore: data.analysisResults.summary.averageScore,
      topKeywords: data.analysisResults.keywords.slice(0, 20),
    },
    executiveSummary: summary.executiveSummary,
    keyFindings: summary.keyFindings,
    recommendations: summary.recommendations,
    detailedResults: data.analysisResults.results.map((result: any) => ({
      id: result.id,
      text: result.text,
      sentiment: result.analysis.sentiment,
      keywords: result.analysis.keywords,
      wordCount: result.analysis.wordCount,
    })),
  };

  return JSON.stringify(exportObject, null, 2);
}

export function exportToMarkdown(data: ExportData): string {
  const { analysisResults } = data;
  const summary = generateSummary(
    analysisResults.results,
    analysisResults.summary,
    analysisResults.keywords
  );

  const markdown = `# E-Consultation Sentiment Analysis Report

**Generated:** ${data.timestamp}  
**Total Comments Analyzed:** ${analysisResults.summary.total}

## Executive Summary

${summary.executiveSummary}

## Key Statistics

- **Positive Sentiment:** ${analysisResults.summary.positivePercentage}% (${
    analysisResults.summary.positive
  } comments)
- **Negative Sentiment:** ${analysisResults.summary.negativePercentage}% (${
    analysisResults.summary.negative
  } comments)
- **Neutral Sentiment:** ${analysisResults.summary.neutralPercentage}% (${
    analysisResults.summary.neutral
  } comments)
- **Average Sentiment Score:** ${analysisResults.summary.averageScore.toFixed(
    3
  )}

## Key Findings

${summary.keyFindings.map((finding) => `- ${finding}`).join("\n")}

## Sentiment Overview

${summary.sentimentOverview}

## Top Keywords

${analysisResults.keywords
  .slice(0, 15)
  .map(
    (keyword: any, index: number) =>
      `${index + 1}. **${keyword.word}** (${keyword.count} mentions)`
  )
  .join("\n")}

## Key Concerns

${summary.topConcerns.map((concern) => `- ${concern}`).join("\n")}

## Recommendations

${summary.recommendations.map((rec) => `- ${rec}`).join("\n")}

## Methodology

${summary.methodology}

---

*This report was generated using automated sentiment analysis. Results should be reviewed in conjunction with qualitative analysis of individual comments.*
`;

  return markdown;
}

export function downloadFile(
  content: string,
  filename: string,
  mimeType: string
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function generateFilename(format: string): string {
  const timestamp = new Date().toISOString().split("T")[0];
  return `sentiment-analysis-report-${timestamp}.${format}`;
}
