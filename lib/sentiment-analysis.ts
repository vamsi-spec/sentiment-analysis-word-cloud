// Simple sentiment analysis using keyword-based approach
// In production, you would use a more sophisticated ML model or API

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

// Positive and negative word lists for basic sentiment analysis
const positiveWords = [
  "good",
  "great",
  "excellent",
  "amazing",
  "wonderful",
  "fantastic",
  "awesome",
  "brilliant",
  "outstanding",
  "superb",
  "perfect",
  "love",
  "like",
  "enjoy",
  "happy",
  "pleased",
  "satisfied",
  "delighted",
  "thrilled",
  "impressed",
  "support",
  "agree",
  "approve",
  "recommend",
  "beneficial",
  "helpful",
  "useful",
  "valuable",
  "important",
  "necessary",
  "effective",
  "efficient",
  "successful",
  "positive",
  "optimistic",
  "hopeful",
  "encouraging",
  "inspiring",
  "motivating",
  "uplifting",
]

const negativeWords = [
  "bad",
  "terrible",
  "awful",
  "horrible",
  "disgusting",
  "hate",
  "dislike",
  "angry",
  "frustrated",
  "disappointed",
  "upset",
  "annoyed",
  "irritated",
  "concerned",
  "worried",
  "anxious",
  "scared",
  "afraid",
  "disagree",
  "oppose",
  "reject",
  "refuse",
  "deny",
  "criticize",
  "complain",
  "problem",
  "issue",
  "difficulty",
  "trouble",
  "challenge",
  "obstacle",
  "barrier",
  "failure",
  "mistake",
  "error",
  "wrong",
  "incorrect",
  "inappropriate",
  "unacceptable",
  "unfair",
  "unjust",
  "negative",
  "pessimistic",
  "discouraging",
  "demotivating",
  "depressing",
]

// Common stop words to filter out
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
  "from",
  "up",
  "about",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "between",
  "among",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
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
  "my",
  "your",
  "his",
  "her",
  "its",
  "our",
  "their",
])

export function analyzeSentiment(text: string): AnalysisResult {
  // Clean and tokenize text
  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, " ")
  const words = cleanText.split(/\s+/).filter((word) => word.length > 2 && !stopWords.has(word))

  // Count positive and negative words
  let positiveCount = 0
  let negativeCount = 0

  words.forEach((word) => {
    if (positiveWords.includes(word)) {
      positiveCount++
    } else if (negativeWords.includes(word)) {
      negativeCount++
    }
  })

  // Calculate sentiment score
  const totalSentimentWords = positiveCount + negativeCount
  let score = 0
  let confidence = 0

  if (totalSentimentWords > 0) {
    score = (positiveCount - negativeCount) / totalSentimentWords
    confidence = Math.min((totalSentimentWords / words.length) * 2, 1) // Normalize confidence
  }

  // Determine label
  let label: "positive" | "negative" | "neutral"
  if (score > 0.1) {
    label = "positive"
  } else if (score < -0.1) {
    label = "negative"
  } else {
    label = "neutral"
  }

  // Extract keywords (most frequent non-stop words)
  const wordFreq: { [key: string]: number } = {}
  words.forEach((word) => {
    wordFreq[word] = (wordFreq[word] || 0) + 1
  })

  const keywords = Object.entries(wordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word)

  return {
    sentiment: {
      score,
      label,
      confidence,
    },
    keywords,
    wordCount: words.length,
  }
}

export function analyzeBatchComments(comments: Array<{ id: string; text: string }>) {
  const results = comments.map((comment) => ({
    id: comment.id,
    text: comment.text,
    analysis: analyzeSentiment(comment.text),
  }))

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
