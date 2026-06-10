export interface SurveyQuestion {
  c: number;
  t: 'L' | 'R' | 'V';
  q: string;
  left?: string;
  right?: string;
  descL?: string;
  descR?: string;
}

export interface AnswerData {
  value: number;
  latencyMs: number;
}

export interface SurveyResultContent {
  persona: string;
  emoji: string;
  hashtags: string[];
  headline: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  advice: string;
  workManual: string[];
  worstMatch: { type: string; description: string; handling: string };
  bestMatch: { type: string; emoji: string; description: string };
  biasCorrection: { short: string; mid: string; long: string };
}

export interface SurveyConfig {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  icon: string;
  keyPoints?: { icon: string; title: string; description: string }[];
  categories: string[];
  questions: SurveyQuestion[];
  getResultContent: (averageScore: number, categoryScores: number[], answers?: Record<number, AnswerData>) => SurveyResultContent;
}

export interface PersonaDetail {
  id: string;
  surveyId: string;
  name: string;
  emoji: string;
  shortDesc: string;
  longDescription: string;
}

export interface BlogPost {
  surveyId: string;
  title: string;
  subtitle: string;
  emoji: string;
  readTime: string;
  sections: BlogSection[];
  relatedPersonas: string[];
}

export interface BlogSection {
  heading: string;
  emoji: string;
  body: string;
  highlight?: string;
}
