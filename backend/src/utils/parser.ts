export interface ParsedResume {
  fileName: string;
  contact: {
    emails: string[];
    phones: string[];
    github: string | boolean;
    linkedin: string | boolean;
  };
  sections: {
    hasEducation: boolean;
    hasExperience: boolean;
    hasSkills: boolean;
    hasProjects: boolean;
    hasCertifications: boolean;
    hasSummary: boolean;
  };
  metrics: {
    actionVerbCount: number;
    actionVerbsFound: string[];
    wordCount: number;
    uniqueWordCount: number;
  };
  rawTextSnippet: string;
}

// ─── Keyword Banks ────────────────────────────────────────────────────────────

const SECTION_KEYWORDS: Record<keyof ParsedResume["sections"], string[]> = {
  hasEducation: ["education", "academic background", "qualifications", "degrees"],
  hasExperience: [
    "experience", "work experience", "employment history",
    "professional experience", "work history", "career history",
  ],
  hasSkills: ["skills", "technical skills", "core competencies", "technologies", "competencies"],
  hasProjects: ["projects", "personal projects", "side projects", "portfolio", "open source"],
  hasCertifications: ["certifications", "certificates", "licenses", "accreditations"],
  hasSummary: ["summary", "profile", "objective", "about me", "professional summary"],
};

const ACTION_VERBS: string[] = [
  "developed", "designed", "implemented", "architected", "optimized",
  "built", "deployed", "engineered", "led", "managed",
  "created", "automated", "refactored", "integrated", "launched",
  "maintained", "migrated", "reduced", "improved", "collaborated",
  "delivered", "scaled", "debugged", "tested", "documented",
  "mentored", "researched", "analysed", "analyzed", "coordinated",
];

// ─── Regex Patterns ───────────────────────────────────────────────────────────

const RE_EMAIL    = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const RE_PHONE    = /(?:\+?\d{1,3}[\s\-.]?)?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}/g;
const RE_GITHUB   = /(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_\-]+(?:\/[^\s,)"']*)?/i;
const RE_LINKEDIN = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_\-]+(?:\/[^\s,)"']*)?/i;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dedup(arr: string[]): string[] {
  return [...new Set(arr.map((s) => s.toLowerCase().trim()))];
}

function detectSections(lower: string): ParsedResume["sections"] {
  const result = {} as ParsedResume["sections"];
  for (const [key, variants] of Object.entries(SECTION_KEYWORDS)) {
    result[key as keyof ParsedResume["sections"]] = variants.some((v) =>
      lower.includes(v)
    );
  }
  return result;
}

function countActionVerbs(lower: string): { count: number; found: string[] } {
  const found: string[] = [];
  for (const verb of ACTION_VERBS) {
    // Word-boundary match; count each verb once (presence, not frequency)
    const re = new RegExp(`\\b${verb}\\b`, "gi");
    if (re.test(lower)) found.push(verb);
  }
  return { count: found.length, found };
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function parseResumeText(rawText: string, fileName: string): ParsedResume {
  const lower = rawText.toLowerCase();
  const words = rawText.trim().split(/\s+/);

  const emailMatches   = rawText.match(RE_EMAIL)    ?? [];
  const phoneMatches   = rawText.match(RE_PHONE)    ?? [];
  const githubMatch    = rawText.match(RE_GITHUB);
  const linkedinMatch  = rawText.match(RE_LINKEDIN);

  const { count: actionVerbCount, found: actionVerbsFound } = countActionVerbs(lower);

  return {
    fileName,
    contact: {
      emails:   dedup(emailMatches),
      phones:   dedup(phoneMatches),
      github:   githubMatch?.[0]?.toLowerCase() ?? (lower.includes("github") ? true : false),
      linkedin: linkedinMatch?.[0]?.toLowerCase() ?? (lower.includes("linkedin") ? true : false),
    },
    sections: detectSections(lower),
    metrics: {
      actionVerbCount,
      actionVerbsFound,
      wordCount:       words.length,
      uniqueWordCount: new Set(words.map((w) => w.toLowerCase())).size,
    },
    rawTextSnippet: rawText.slice(0, 300).replace(/\s+/g, " ").trim(),
  };
}