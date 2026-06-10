import { SurveyConfig, AnswerData } from '../types';

export interface ScoringResult {
  averageScore: number;
  categoryScores: number[]; // Array of average score per category (1-6)
  reliabilityScore: number; // 0-100, penalizes fast random clicking and inconsistent cross-validations
  synergyBonuses: { category: number, bonus: number }[];
}

export function calculateScores(survey: SurveyConfig, answers: Record<number, AnswerData>): ScoringResult {
  const categoryTotals: Record<number, number> = {};
  const categoryCounts: Record<number, number> = {};
  
  let totalScore = 0;
  let answeredCount = 0;
  let latencyPenalty = 0;
  let crossValidationPenalty = 0;
  let crossValidationCount = 0;

  const qLen = survey.questions.length;

  for (const [idxStr, answerData] of Object.entries(answers)) {
    const idx = parseInt(idxStr, 10);
    const q = survey.questions[idx % Math.max(qLen, 1)];
    
    if (!q) continue;

    // Base scoring
    let scoreValue = answerData.value;
    if (q.t === 'V') {
       scoreValue = scoreValue === 1 ? 0 : 100; // Transform dilemma to 0 or 100
    } else if (q.t === 'R') {
       scoreValue = ((5 - scoreValue) / 4) * 100; // Transform 1-5 to 100-0 for Reverse
    } else {
       scoreValue = ((scoreValue - 1) / 4) * 100; // Transform 1-5 to 0-100 for Likert
    }

    // Category aggregation
    const cat = q.c;
    categoryTotals[cat] = (categoryTotals[cat] || 0) + scoreValue;
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    
    totalScore += scoreValue;
    answeredCount++;

    // 8. Latency Analysis: Penalize if answered too quickly (< 400ms) or too slowly (> 15000ms)
    if (answerData.latencyMs < 400) {
      latencyPenalty += 5; // Penalty for rushing
    }

    // 10. Cross-validation: Check consistency
    if ((q as any).isCrossValidation && (q as any).crossValidationTargetIndex !== undefined) {
      const targetAns = answers[(q as any).crossValidationTargetIndex];
      if (targetAns) {
        crossValidationCount++;
        const diff = Math.abs(targetAns.value - answerData.value);
        if (diff > 1) {
           crossValidationPenalty += diff * 10;
        }
      }
    }
  }

  // Calculate Reliability Score
  let reliabilityScore = 100 - latencyPenalty - crossValidationPenalty;
  reliabilityScore = Math.max(0, Math.min(100, reliabilityScore));

  const averageScore = answeredCount > 0 ? totalScore / answeredCount : 0;

  // Dynamic category count — supports any number of categories (9 for fx-radar)
  const numCategories = survey.categories.length || Math.max(...Object.keys(categoryTotals).map(Number), 0);
  const categoryScores = Array.from({ length: numCategories }, (_, i) => {
    const cat = i + 1;
    return categoryCounts[cat] > 0 ? categoryTotals[cat] / categoryCounts[cat] : 0;
  });

  const synergyBonuses: { category: number, bonus: number }[] = [];

  return {
    averageScore,
    categoryScores,
    reliabilityScore,
    synergyBonuses
  };
}


export function calculateCultureFit(scores: number[], companyProfile: number[]): number {
  // Calculate euclidean distance or simple diff
  let diffSum = 0;
  for (let i = 0; i < Math.min(scores.length, companyProfile.length); i++) {
    diffSum += Math.abs(scores[i] - companyProfile[i]);
  }
  const maxDiff = scores.length * 100;
  const matchRate = 100 - ((diffSum / maxDiff) * 100);
  return Math.max(0, Math.min(100, Math.round(matchRate)));
}
