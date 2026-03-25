import * as cheerio from "cheerio";

export type ParsedLinkedInLead = {
  companyName: string;
  websiteUrl: null;
  contactName: string;
  linkedinProfileUrl: string | null;
  role: string | null;
  source: string;
  notes: string | null;
};

const NOISE_PATTERN = /^(save|message|connect|follow|more|open|show all|see all|remove|search|view profile|send inmail|1st|2nd|3rd|owner of this profile)$/i;

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function isNoise(value: string) {
  return !value || NOISE_PATTERN.test(value) || /^\d+$/.test(value);
}

function unique(values: string[]) {
  return Array.from(new Set(values.map(collapseWhitespace).filter((value) => !isNoise(value))));
}

function normaliseLinkedInUrl(href?: string | null) {
  if (!href) return null;

  try {
    if (href.startsWith("http://") || href.startsWith("https://")) {
      const url = new URL(href);
      url.search = "";
      url.hash = "";
      return url.toString();
    }

    if (href.startsWith("/")) {
      const url = new URL(href, "https://www.linkedin.com");
      url.search = "";
      url.hash = "";
      return url.toString();
    }
  } catch {
    return null;
  }

  return null;
}

function isProfileUrl(href?: string | null) {
  return Boolean(href && /(?:linkedin\.com)?\/(?:in|sales\/lead)\//i.test(href));
}

function isCompanyUrl(href?: string | null) {
  return Boolean(href && /(?:linkedin\.com)?\/company\//i.test(href));
}

function extractTextParts($: cheerio.CheerioAPI, row: cheerio.Cheerio<any>) {
  const cellParts = row.find("td, th").toArray().map((cell) => collapseWhitespace($(cell).text()));
  if (cellParts.some(Boolean)) {
    return unique([...cellParts, ...row.find("a").toArray().map((anchor) => $(anchor).text())]);
  }

  const blockParts = row.find("div, span, p, a").toArray().map((element) => collapseWhitespace($(element).text()));
  if (blockParts.some(Boolean)) {
    return unique(blockParts);
  }

  return unique(row.text().split(/\n+/));
}

function pickContactName(profileText: string | null, textParts: string[]) {
  if (profileText && !isNoise(profileText) && profileText.split(" ").length <= 6) {
    return profileText;
  }

  return textParts.find((part) => /^[A-Z][\p{L}'-]+(?:\s+[A-Z][\p{L}'-]+){1,4}$/u.test(part)) ?? textParts[0] ?? null;
}

function splitRoleAndCompany(parts: string[]) {
  for (const part of parts) {
    const pieces = part.split(/\s+at\s+/i).map(collapseWhitespace).filter(Boolean);
    if (pieces.length === 2) {
      return { role: pieces[0], companyName: pieces[1] };
    }
  }

  return { role: null, companyName: null };
}

function pickCompanyName(companyText: string | null, textParts: string[], contactName: string) {
  if (companyText && !isNoise(companyText) && companyText !== contactName) {
    return companyText;
  }

  const fromAtLine = splitRoleAndCompany(textParts).companyName;
  if (fromAtLine && fromAtLine !== contactName) {
    return fromAtLine;
  }

  return textParts.find((part) => part !== contactName && !/\bat\b/i.test(part) && part.split(" ").length <= 8) ?? null;
}

function pickRole(textParts: string[], contactName: string, companyName: string) {
  const fromAtLine = splitRoleAndCompany(textParts).role;
  if (fromAtLine && fromAtLine !== contactName && fromAtLine !== companyName) {
    return fromAtLine;
  }

  return textParts.find((part) => part !== contactName && part !== companyName) ?? null;
}

function pickNotes(textParts: string[], ignored: string[]) {
  const ignoreSet = new Set(ignored.filter(Boolean));
  const remaining = textParts.filter((part) => !ignoreSet.has(part)).slice(0, 5);
  return remaining.length > 0 ? remaining.join(" | ") : null;
}

function findCandidateRows($: cheerio.CheerioAPI) {
  const selectors = ["tr", "[role='row']", "li", ".artdeco-list__item"];

  for (const selector of selectors) {
    const matches = $(selector)
      .toArray()
      .filter((element) => {
        const row = $(element);
        const hasProfileLink = row.find("a").toArray().some((anchor) => isProfileUrl($(anchor).attr("href")));
        return hasProfileLink && collapseWhitespace(row.text()).length > 20;
      });

    if (matches.length > 0) {
      return matches;
    }
  }

  return [];
}

export function parseLinkedInHtml(html: string): ParsedLinkedInLead[] {
  const $ = cheerio.load(html);
  const rows = findCandidateRows($);
  const leads = new Map<string, ParsedLinkedInLead>();

  for (const element of rows) {
    const row = $(element);
    const anchors = row.find("a").toArray();
    const profileAnchor = anchors.find((anchor) => isProfileUrl($(anchor).attr("href")));
    const companyAnchor = anchors.find((anchor) => isCompanyUrl($(anchor).attr("href")));
    const profileUrl = normaliseLinkedInUrl(profileAnchor ? $(profileAnchor).attr("href") : null);
    const profileText = profileAnchor ? collapseWhitespace($(profileAnchor).text()) : null;
    const companyText = companyAnchor ? collapseWhitespace($(companyAnchor).text()) : null;
    const textParts = extractTextParts($, row);

    const contactName = pickContactName(profileText, textParts);
    if (!contactName) continue;

    const companyName = pickCompanyName(companyText, textParts, contactName);
    if (!companyName) continue;

    const role = pickRole(textParts, contactName, companyName);
    const combinedRoleCompany = textParts.find((part) => /\s+at\s+/i.test(part)) ?? "";
    const notes = pickNotes(textParts, [contactName, companyName, role ?? "", profileText ?? "", companyText ?? "", combinedRoleCompany]);
    const key = profileUrl ?? `${contactName.toLowerCase()}::${companyName.toLowerCase()}`;

    if (!leads.has(key)) {
      leads.set(key, {
        companyName,
        websiteUrl: null,
        contactName,
        linkedinProfileUrl: profileUrl,
        role,
        source: "linkedin_html_import",
        notes
      });
    }
  }

  return Array.from(leads.values());
}
