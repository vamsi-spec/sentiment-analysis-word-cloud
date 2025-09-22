import Sentiment from "sentiment"
import { removeStopwords, eng } from "stopword"

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

const sentimentAnalyzer = new Sentiment()

export async function analyzeSentiment(text: string): Promise<AnalysisResult> {
  const result = sentimentAnalyzer.analyze(text)
  const words = text.toLowerCase().split(/\s+/)
  const wordCount = words.length

  // Extract meaningful keywords using stopword library
  const cleanWords = removeStopwords(words, eng)

  const keywords = cleanWords
    .filter((word) => word.length > 2)
    .filter((word, index, arr) => arr.indexOf(word) === index)
    .slice(0, 10)

  // Convert sentiment score to our scale and determine label
  const normalizedScore = Math.max(-1, Math.min(1, result.score / 5)) // Normalize to -1 to 1
  let label: "positive" | "negative" | "neutral"

  if (normalizedScore > 0.1) {
    label = "positive"
  } else if (normalizedScore < -0.1) {
    label = "negative"
  } else {
    label = "neutral"
  }

  const confidence = Math.min(0.9, Math.abs(normalizedScore) + 0.3) // Base confidence with sentiment strength

  return {
    sentiment: {
      score: normalizedScore,
      label,
      confidence,
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
