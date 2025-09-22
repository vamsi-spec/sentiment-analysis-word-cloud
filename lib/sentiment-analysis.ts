import Sentiment from "sentiment";
import { removeStopwords, eng } from "stopword";
import natural from "natural";

interface SentimentResult {
  score: number; // -1 to 1 (negative to positive)
  label: "positive" | "negative" | "neutral";
  confidence: number; // 0 to 1
}

interface AnalysisResult {
  sentiment: SentimentResult;
  keywords: string[];
  wordCount: number;
}

const sentimentAnalyzer = new Sentiment();
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;
const tfidf = new TfIdf();

/**
 * Analyze sentiment and extract keywords from a single text string.
 */
export async function analyzeSentiment(text: string): Promise<AnalysisResult> {
  // Sentiment analysis
  const result = sentimentAnalyzer.analyze(text);

  // Tokenize text using natural (better than splitting by space)
  const tokens = tokenizer.tokenize(text.toLowerCase());
  const wordCount = tokens.length;

  // Remove stopwords
  const cleanTokens = removeStopwords(tokens, eng).filter((w) => w.length > 2);

  // Use TF-IDF for keyword extraction (build doc then extract top terms)
  tfidf.addDocument(cleanTokens);

  // Get top 10 keywords by TF-IDF score for this single document
  // The tfidf.listTerms(docIndex) returns [{term, tfidf}, ...] sorted descending
  const keywords = tfidf
    .listTerms(0)
    .slice(0, 10)
    .map((item) => item.term);

  // Normalize sentiment score from -5 to 5 scale to -1 to 1
  const normalizedScore = Math.max(-1, Math.min(1, result.score / 5));

  // Determine sentiment label
  let label: "positive" | "negative" | "neutral";
  if (normalizedScore > 0.1) {
    label = "positive";
  } else if (normalizedScore < -0.1) {
    label = "negative";
  } else {
    label = "neutral";
  }

  const confidence = Math.min(0.9, Math.abs(normalizedScore) + 0.3);

  // Clear tfidf documents for next call to avoid accumulation
  tfidf.documents = [];

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

/**
 * Analyze an array of comments with sentiment and keyword aggregation.
 */
export async function analyzeBatchComments(
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

  // Aggregate keywords frequency
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
