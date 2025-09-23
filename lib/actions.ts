"use server";

import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import Sentiment from "sentiment";

interface SentimentResult {
  score: number;
  label: "positive" | "negative" | "neutral";
  confidence: number;
}

interface AnalysisResult {
  sentiment: SentimentResult;
  keywords: string[];
  wordCount: number;
}

const sentimentSchema = z.object({
  sentiment: z.object({
    label: z.enum(["positive", "negative", "neutral"]),
    score: z.number().min(-1).max(1),
    confidence: z.number().min(0).max(1),
  }),
  keywords: z.array(z.string()).max(10),
  reasoning: z.string().optional(),
});

const sentimentAnalyzer = new Sentiment();

async function analyzeSentiment(text: string): Promise<AnalysisResult> {
  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: sentimentSchema,
      prompt: `Analyze the sentiment of this text and extract key meaningful words (not stop words):

Text: "${text}"

Provide:
1. Sentiment label (positive, negative, or neutral)
2. Score from -1 (very negative) to 1 (very positive)
3. Confidence level (0-1) based on how clear the sentiment is
4. Up to 10 keywords/phrases that are most meaningful in this text
5. Brief reasoning for the sentiment classification

Be nuanced - not everything is neutral. Look for subtle emotional indicators, context, and implied sentiment.`,
    });

    const wordCount = text
      .split(/\s+/)
      .filter((word) => word.length > 0).length;

    return {
      sentiment: object.sentiment,
      keywords: object.keywords,
      wordCount,
    };
  } catch (error) {
    console.error("OpenAI sentiment analysis failed:", error);
    return fallbackAnalysis(text);
  }
}

function fallbackAnalysis(text: string): AnalysisResult {
  const result = sentimentAnalyzer.analyze(text);
  const words = text.toLowerCase().split(/\s+/);
  const wordCount = words.length;

  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "must",
    "can",
    "this",
    "that",
    "these",
    "those",
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
    "me",
    "him",
    "her",
    "us",
    "them",
  ]);

  const keywords = words
    .filter((word) => word.length > 2 && !stopWords.has(word))
    .filter((word, index, arr) => arr.indexOf(word) === index)
    .slice(0, 10);

  const normalizedScore = Math.max(-1, Math.min(1, result.score / 5)); // Normalize to -1 to 1
  let label: "positive" | "negative" | "neutral";

  if (normalizedScore > 0.1) {
    label = "positive";
  } else if (normalizedScore < -0.1) {
    label = "negative";
  } else {
    label = "neutral";
  }

  const confidence = Math.min(0.9, Math.abs(normalizedScore) + 0.3);

  return {
    sentiment: {
      score: normalizedScore,
      label,
      confidence,
    },
    keywords,
    wordCount,
  };
}

export async function analyzeBatchCommentsAction(
  comments: Array<{ id: string; text: string }>
) {
  const results = await Promise.all(
    comments.map(async (comment) => ({
      id: comment.id,
      text: comment.text,
      analysis: await analyzeSentiment(comment.text),
    }))
  );

  const totalComments = results.length;
  const positiveCount = results.filter(
    (r) => r.analysis.sentiment.label === "positive"
  ).length;
  const negativeCount = results.filter(
    (r) => r.analysis.sentiment.label === "negative"
  ).length;
  const neutralCount = results.filter(
    (r) => r.analysis.sentiment.label === "neutral"
  ).length;

  const allKeywords: { [key: string]: number } = {};
  results.forEach((result) => {
    result.analysis.keywords.forEach((keyword) => {
      allKeywords[keyword] = (allKeywords[keyword] || 0) + 1;
    });
  });

  const topKeywords = Object.entries(allKeywords)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 50)
    .map(([word, count]) => ({ word, count }));

  return {
    results,
    summary: {
      total: totalComments,
      positive: positiveCount,
      negative: negativeCount,
      neutral: neutralCount,
      positivePercentage:
        totalComments > 0
          ? Math.round((positiveCount / totalComments) * 100)
          : 0,
      negativePercentage:
        totalComments > 0
          ? Math.round((negativeCount / totalComments) * 100)
          : 0,
      neutralPercentage:
        totalComments > 0
          ? Math.round((neutralCount / totalComments) * 100)
          : 0,
      averageScore:
        totalComments > 0
          ? results.reduce((sum, r) => sum + r.analysis.sentiment.score, 0) /
            totalComments
          : 0,
    },
    keywords: topKeywords,
  };
}
