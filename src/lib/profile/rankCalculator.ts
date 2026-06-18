// src/lib/profile/rankCalculator.ts
// §13 — Developer Rank Thresholds & Percentile Calculation

import type { DeveloperGrade, MasterScoreData, CURISMScores } from './types';
import { computeFinalScore } from './curismScorer';

// ═══════════════════════════════════════════════════════════
// §13 — Grade Thresholds
// ═══════════════════════════════════════════════════════════

interface GradeThreshold {
  min: number;
  max: number;
  grade: DeveloperGrade;
  title: string;
}

const GRADE_THRESHOLDS: GradeThreshold[] = [
  { min: 8.91, max: 10.00, grade: 'S+', title: 'Staff Engineer / Exemplary' },
  { min: 7.34, max: 8.90,  grade: 'S',  title: 'Senior Developer' },
  { min: 5.89, max: 7.33,  grade: 'A',  title: 'Mid-Level Developer' },
  { min: 5.01, max: 5.88,  grade: 'B',  title: 'Junior Developer' },
  { min: 0.00, max: 5.00,  grade: 'C',  title: 'Intern / Beginner' },
];

/**
 * Determine the developer grade from a final score (0–10).
 */
export function getGrade(score: number): { grade: DeveloperGrade; title: string } {
  for (const threshold of GRADE_THRESHOLDS) {
    if (score >= threshold.min && score <= threshold.max) {
      return { grade: threshold.grade, title: threshold.title };
    }
  }
  // Fallback (should never happen if score is in [0, 10])
  return { grade: 'C', title: 'Intern / Beginner' };
}

/**
 * §13.1 — Percentile Calibration
 *
 * Calculate what percentile this score falls at relative to a global distribution.
 * For now, we use a reasonable synthetic distribution based on the spec's
 * implied normal distribution. In production, this should be replaced with
 * real stored benchmark data.
 */
export function getPercentile(score: number): number {
  // Approximate percentile using a logistic curve centered around ~5.5
  // This models: most developers score 4-6, few score 0-2 or 9-10
  // P(score) ≈ 100 / (1 + e^(-1.5 × (score - 5.5)))
  const percentile = 100 / (1 + Math.exp(-1.5 * (score - 5.5)));
  return Math.round(Math.min(99, Math.max(1, percentile)));
}

/**
 * Compute the complete Master Score from CURISM dimension scores.
 *
 * §10.3:
 *   Hard_Skills   = avg(Reliability, Security, Maintainability)
 *   Soft_Skills   = avg(Influence, Contribution)
 *   Builder_Skills = Uniqueness (ACID)
 *   Final_Score   = (Hard × 0.30) + (Soft × 0.40) + (Builder × 0.30)
 */
export function computeMasterScoreData(scores: CURISMScores): MasterScoreData {
  const hardSkills = (scores.reliability + scores.security + scores.maintainability) / 3;
  const softSkills = (scores.influence + scores.contribution) / 2;
  const builderSkills = scores.uniqueness;

  const finalScore = computeFinalScore(hardSkills, softSkills, builderSkills);
  const { grade, title } = getGrade(finalScore);
  const percentile = getPercentile(finalScore);

  return {
    finalScore,
    grade,
    gradeTitle: title,
    hardSkills: Math.round(hardSkills * 10) / 10,
    softSkills: Math.round(softSkills * 10) / 10,
    builderSkills: Math.round(builderSkills * 10) / 10,
    percentile,
  };
}

/**
 * Export grade thresholds for frontend display
 */
export { GRADE_THRESHOLDS };
