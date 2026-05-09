import { ParsedResume } from "./parser";

export interface ResumeScore {
  fileName: string;
  totalScore: number;
  breakdown: {
    contact: number;
    sections: number;
    actionVerbs: number;
    length: number;
  };
  feedback: string[];
}

export function calculateScore(parsed: ParsedResume): ResumeScore {
  let score = 0;
  const breakdown = { contact: 0, sections: 0, actionVerbs: 0, length: 0 };
  const feedback: string[] = [];

  if (parsed.contact.emails.length > 0) breakdown.contact += 5;
  else feedback.push("Missing email address.");
  if (parsed.contact.phones.length > 0) breakdown.contact += 5;
  else feedback.push("Missing phone number.");
  if (parsed.contact.github) breakdown.contact += 5;
  else feedback.push("Missing GitHub link.");
  if (parsed.contact.linkedin) breakdown.contact += 5;
  else feedback.push("Missing LinkedIn link.");
  score += breakdown.contact;

  if (parsed.sections.hasEducation) breakdown.sections += 6;
  if (parsed.sections.hasExperience) breakdown.sections += 6;
  else feedback.push("Missing Experience section.");
  if (parsed.sections.hasSkills) breakdown.sections += 6;
  if (parsed.sections.hasProjects) breakdown.sections += 6;
  if (parsed.sections.hasSummary || parsed.sections.hasCertifications) breakdown.sections += 6;
  score += breakdown.sections;

  breakdown.actionVerbs = Math.min(parsed.metrics.actionVerbCount * 2, 20);
  score += breakdown.actionVerbs;
  if (breakdown.actionVerbs < 10) feedback.push("Low action verb count. Use words like 'developed', 'led', 'optimized'.");

  const wc = parsed.metrics.wordCount;
  if (wc >= 200 && wc <= 850) {
    breakdown.length = 30;
  } else if (wc < 200) {
    breakdown.length = 15;
    feedback.push("Resume is too brief (under 200 words). May lack detail.");
  } else {
    breakdown.length = 20;
    feedback.push("Resume may be too wordy (over 850 words). Consider condensing.");
  }
  score += breakdown.length;

  return { fileName: parsed.fileName, totalScore: score, breakdown, feedback };
}

export function generateBatchReport(scores: ResumeScore[]) {
  const totalResumes = scores.length;
  if (totalResumes === 0) throw new Error("No resumes to score.");
  const averageScore = Math.round(scores.reduce((sum, s) => sum + s.totalScore, 0) / totalResumes);
  const highPerformers = scores.filter(s => s.totalScore >= 80).length;
  const atRisk = scores.filter(s => s.totalScore < 60).length;
  
  const feedbackCounts: Record<string, number> = {};
  scores.forEach(s => s.feedback.forEach(f => feedbackCounts[f] = (feedbackCounts[f] || 0) + 1));
  const topWeaknesses = Object.entries(feedbackCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(entry => entry[0]);

  return { batchSize: totalResumes, averageCalibreScore: averageScore, highPerformers, atRisk, topWeaknesses, individualScores: scores.sort((a, b) => b.totalScore - a.totalScore) };
}