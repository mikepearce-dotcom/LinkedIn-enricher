
type ScoreInput = {
  hasCommercialIntent: boolean;
  hasVisibleIssues: number;
  role?: string | null;
  websiteUrl: string;
};

export function calculateOpportunityScore(input: ScoreInput) {
  let score = 30;

  if (input.hasCommercialIntent) score += 20;
  score += Math.min(input.hasVisibleIssues * 10, 30);
  if (input.role?.toLowerCase().match(/founder|head|director|owner|marketing/)) score += 15;
  if (input.websiteUrl.startsWith("https://")) score += 5;

  return Math.max(1, Math.min(100, score));
}
