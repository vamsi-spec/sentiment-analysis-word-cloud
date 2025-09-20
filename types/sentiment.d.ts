declare module "sentiment" {
  interface SentimentResult {
    score: number;
    comparative: number;
    calculation: { [word: string]: number }[];
    tokens: string[];
    words: string[];
    positive: string[];
    negative: string[];
  }

  interface SentimentOptions {
    extras?: { [word: string]: number };
    language?: string;
  }

  class Sentiment {
    constructor(options?: SentimentOptions);
    analyze(text: string): SentimentResult;
  }

  export default Sentiment;
}
