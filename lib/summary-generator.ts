interface CommentAnalysis {
  id: string;
  text: string;
  analysis: {
    sentiment: {
      score: number;
      label: "positive" | "negative" | "neutral";
      confidence: number;
    };
    keywords: string[];
    wordCount: number;
  };
}

interface SummaryData {
  executiveSummary: string;
  keyFindings: string[];
  sentimentOverview: string;
  topConcerns: string[];
  recommendations: string[];
  methodology: string;
}

export function generateSummary(
  results: CommentAnalysis[],
  summary: {
    total: number;
    positive: number;
    negative: number;
    neutral: number;
    positivePercentage: number;
    negativePercentage: number;
    neutralPercentage: number;
    averageScore: number;
  },
  keywords: Array<{ word: string; count: number }>
): SummaryData {
  const executiveSummary = generateExecutiveSummary(summary, results.length);

  const keyFindings = generateKeyFindings(summary, keywords);

  const sentimentOverview = generateSentimentOverview(summary);

  const topConcerns = generateTopConcerns(results, keywords);

  const recommendations = generateRecommendations(summary, topConcerns);

  const methodology = generateMethodology();

  return {
    executiveSummary,
    keyFindings,
    sentimentOverview,
    topConcerns,
    recommendations,
    methodology,
  };
}

function generateExecutiveSummary(summary: any, totalComments: number): string {
  const dominantSentiment =
    summary.positivePercentage > summary.negativePercentage
      ? "positive"
      : summary.negativePercentage > summary.positivePercentage
      ? "negative"
      : "neutral";

  const sentimentStrength = Math.max(
    summary.positivePercentage,
    summary.negativePercentage,
    summary.neutralPercentage
  );

  let tone = "";
  if (sentimentStrength >= 60) {
    tone = "strongly";
  } else if (sentimentStrength >= 40) {
    tone = "moderately";
  } else {
    tone = "slightly";
  }

  return `Analysis of ${totalComments} public comments reveals a ${tone} ${dominantSentiment} overall sentiment (${sentimentStrength}%). The average sentiment score of ${summary.averageScore.toFixed(
    2
  )} indicates ${
    summary.averageScore > 0.2
      ? "generally favorable public opinion"
      : summary.averageScore < -0.2
      ? "significant public concerns"
      : "mixed public opinion with balanced perspectives"
  }. This analysis provides valuable insights into public perception and can inform policy decision-making processes.`;
}

function generateKeyFindings(
  summary: any,
  keywords: Array<{ word: string; count: number }>
): string[] {
  const findings = [];

  findings.push(
    `Sentiment distribution: ${summary.positivePercentage}% positive, ${summary.negativePercentage}% negative, ${summary.neutralPercentage}% neutral responses`
  );

  if (summary.positivePercentage > 50) {
    findings.push(
      "Majority of respondents express favorable views toward the proposed policy"
    );
  } else if (summary.negativePercentage > 50) {
    findings.push(
      "Majority of respondents express concerns or opposition to the proposed policy"
    );
  } else {
    findings.push("Public opinion is divided with no clear majority sentiment");
  }

  if (keywords.length > 0) {
    const topKeywords = keywords
      .slice(0, 5)
      .map((k) => k.word)
      .join(", ");
    findings.push(`Most frequently discussed topics: ${topKeywords}`);
  }

  if (summary.total > 100) {
    findings.push(
      "High level of public engagement with significant participation in the consultation process"
    );
  } else if (summary.total > 50) {
    findings.push(
      "Moderate level of public engagement in the consultation process"
    );
  } else {
    findings.push("Limited public participation in the consultation process");
  }

  return findings;
}

function generateSentimentOverview(summary: any): string {
  const {
    positivePercentage,
    negativePercentage,
    neutralPercentage,
    averageScore,
  } = summary;

  let overview = `The sentiment analysis reveals `;

  if (positivePercentage > negativePercentage + 20) {
    overview += `predominantly positive public sentiment (${positivePercentage}% positive vs ${negativePercentage}% negative). `;
  } else if (negativePercentage > positivePercentage + 20) {
    overview += `predominantly negative public sentiment (${negativePercentage}% negative vs ${positivePercentage}% positive). `;
  } else {
    overview += `mixed public sentiment with relatively balanced positive (${positivePercentage}%) and negative (${negativePercentage}%) responses. `;
  }

  overview += `${neutralPercentage}% of comments maintain a neutral stance. `;

  if (Math.abs(averageScore) > 0.3) {
    overview += `The strong average sentiment score (${averageScore.toFixed(
      2
    )}) indicates clear public opinion trends.`;
  } else {
    overview += `The moderate average sentiment score (${averageScore.toFixed(
      2
    )}) suggests nuanced public opinion.`;
  }

  return overview;
}

function generateTopConcerns(
  results: CommentAnalysis[],
  keywords: Array<{ word: string; count: number }>
): string[] {
  const concerns = [];

  const negativeComments = results.filter(
    (r) => r.analysis.sentiment.label === "negative"
  );

  if (negativeComments.length === 0) {
    return ["No significant concerns identified in the feedback"];
  }

  const concernKeywords = [
    "cost",
    "expensive",
    "burden",
    "impact",
    "problem",
    "issue",
    "concern",
    "worry",
    "risk",
    "danger",
  ];
  const identifiedConcerns = keywords.filter((k) =>
    concernKeywords.includes(k.word.toLowerCase())
  );

  if (identifiedConcerns.length > 0) {
    concerns.push(
      `Financial concerns mentioned ${
        identifiedConcerns.find((k) =>
          ["cost", "expensive", "burden"].includes(k.word)
        )?.count || 0
      } times`
    );
  }

  const negativePercentage = (negativeComments.length / results.length) * 100;
  if (negativePercentage > 30) {
    concerns.push(
      "Significant portion of respondents express reservations about the proposal"
    );
  }

  if (negativePercentage > 50) {
    concerns.push(
      "Majority opposition suggests need for policy revision or additional consultation"
    );
  }

  const negativeKeywords = negativeComments
    .flatMap((c) => c.analysis.keywords)
    .reduce((acc: { [key: string]: number }, keyword) => {
      acc[keyword] = (acc[keyword] || 0) + 1;
      return acc;
    }, {});

  const topNegativeKeywords = Object.entries(negativeKeywords)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([word]) => word);

  if (topNegativeKeywords.length > 0) {
    concerns.push(
      `Key areas of concern include: ${topNegativeKeywords.join(", ")}`
    );
  }

  return concerns.length > 0
    ? concerns
    : ["No specific concerns identified in the analysis"];
}

function generateRecommendations(summary: any, concerns: string[]): string[] {
  const recommendations = [];

  if (summary.negativePercentage > 40) {
    recommendations.push(
      "Consider addressing the primary concerns raised by respondents before policy implementation"
    );
    recommendations.push(
      "Conduct additional stakeholder engagement to better understand opposition viewpoints"
    );
  }

  if (summary.positivePercentage > 60) {
    recommendations.push(
      "Leverage positive public sentiment to build support for policy implementation"
    );
    recommendations.push(
      "Highlight the aspects of the policy that resonate most positively with the public"
    );
  }

  if (summary.neutralPercentage > 40) {
    recommendations.push(
      "Provide additional information to help neutral respondents form more definitive opinions"
    );
    recommendations.push(
      "Focus on education and awareness campaigns to clarify policy benefits and impacts"
    );
  }

  if (concerns.some((c) => c.includes("cost") || c.includes("Financial"))) {
    recommendations.push(
      "Develop clear cost-benefit analysis and communicate economic impacts transparently"
    );
  }

  if (summary.total < 50) {
    recommendations.push(
      "Expand outreach efforts to increase public participation in future consultations"
    );
  }

  recommendations.push(
    "Monitor ongoing public sentiment as policy development progresses"
  );
  recommendations.push(
    "Consider implementing a feedback mechanism for continuous public input"
  );

  return recommendations;
}

function generateMethodology(): string {
  return `This analysis employed automated sentiment analysis techniques to evaluate public comments submitted during the consultation period. Each comment was processed using natural language processing algorithms to determine sentiment polarity (positive, negative, or neutral) and extract key themes. The analysis includes keyword frequency analysis, sentiment scoring (-1 to +1 scale), and statistical aggregation of results. While automated analysis provides valuable insights at scale, it should be complemented with qualitative review of individual comments for comprehensive understanding.`;
}
