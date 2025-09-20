import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

interface SentimentResult {
  score: number // -1 to 1 (negative to positive)
  label: "positive" | "negative" | "neutral"
  confidence: number // 0 to 1
}

interface AnalysisResult {
  sentiment: SentimentResult
  keywords: string[]
  wordCount: number
}

// Schema for OpenAI response
const sentimentSchema = z.object({
  sentiment: z.object({
    label: z.enum(["positive", "negative", "neutral"]),
    score: z.number().min(-1).max(1),
    confidence: z.number().min(0).max(1),
  }),
  keywords: z.array(z.string()).max(10),
  reasoning: z.string().optional(),
})

export async function analyzeSentiment(text: string): Promise<AnalysisResult> {
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
    })

    const wordCount = text.split(/\s+/).filter((word) => word.length > 0).length

    return {
      sentiment: object.sentiment,
      keywords: object.keywords,
      wordCount,
    }
  } catch (error) {
    console.error("OpenAI sentiment analysis failed:", error)

    return fallbackAnalysis(text)
  }
}

function fallbackAnalysis(text: string): AnalysisResult {
  const words = text.toLowerCase().split(/\s+/)
  const wordCount = words.length

  // Simple keyword extraction
  const keywords = words
    .filter((word) => word.length > 3)
    .filter((word, index, arr) => arr.indexOf(word) === index)
    .slice(0, 10)

  return {
    sentiment: {
      score: 0,
      label: "neutral",
      confidence: 0.3,
    },
    keywords,
    wordCount,
  }
}

export async function analyzeBatchComments(comments: Array<{ id: string; text: string }>) {
  const results = await Promise.all(
    comments.map(async (comment) => ({
      id: comment.id,
      text: comment.text,
      analysis: await analyzeSentiment(comment.text),
    })),
  )

  // Calculate overall statistics
  const totalComments = results.length
  const positiveCount = results.filter((r) => r.analysis.sentiment.label === "positive").length
  const negativeCount = results.filter((r) => r.analysis.sentiment.label === "negative").length
  const neutralCount = results.filter((r) => r.analysis.sentiment.label === "neutral").length

  // Aggregate keywords
  const allKeywords: { [key: string]: number } = {}
  results.forEach((result) => {
    result.analysis.keywords.forEach((keyword) => {
      allKeywords[keyword] = (allKeywords[keyword] || 0) + 1
    })
  })

  const topKeywords = Object.entries(allKeywords)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 50)
    .map(([word, count]) => ({ word, count }))

  return {
    results,
    summary: {
      total: totalComments,
      positive: positiveCount,
      negative: negativeCount,
      neutral: neutralCount,
      positivePercentage: totalComments > 0 ? Math.round((positiveCount / totalComments) * 100) : 0,
      negativePercentage: totalComments > 0 ? Math.round((negativeCount / totalComments) * 100) : 0,
      neutralPercentage: totalComments > 0 ? Math.round((neutralCount / totalComments) * 100) : 0,
      averageScore:
        totalComments > 0 ? results.reduce((sum, r) => sum + r.analysis.sentiment.score, 0) / totalComments : 0,
    },
    keywords: topKeywords,
  }
}
