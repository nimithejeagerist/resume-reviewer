// Regular expressions for matching patterns
const PATTERNS = {
  // Personal information patterns
  personal: {
    email: /[\w.-]+@[\w.-]+\.\w+/g,
    phone: /(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/g,
    links: /(https?:\/\/)?(www\.)?(github|linkedin)\.com\/[\w-]+/gi,
  },
  // Section heading patterns (expanded for more variations)
  sections: {
    education: /\b(education|academic background)\b:?/gi,
    experience:
      /\b(work|professional|employment|career)\s*(experience|history)?\b:?/gi,
    projects: /\b(projects|personal projects|side projects)\b:?/gi,
    skills:
      /\b(technical\s*)?(skills|technologies|proficiencies|competencies)\b:?/gi,
  },
  // Job description patterns
  jobDesc: {
    branding:
      /\b(join us|define tomorrow|about us|our company|we offer)\b.*$/gim,
    salary:
      /\$\d+[,.]?\d*\s*(-|to)\s*\$?\d+[,.]?\d*\s*(k|thousand|million|annually|per year)?/gi,
    disclaimer: /equal opportunity employer|eoe|we are committed to.*$/gim,
  },
};

/**
 * Cleans and structures resume text for AI processing
 * @param {string} text - Raw resume text
 * @returns {string} - Cleaned and structured resume text
 */
function cleanResume(text) {
  let cleaned = text;

  // Remove personal information
  cleaned = cleaned
    .replace(PATTERNS.personal.email, "[EMAIL REMOVED]")
    .replace(PATTERNS.personal.phone, "[PHONE REMOVED]")
    .replace(PATTERNS.personal.links, "[LINK REMOVED]");

  // Standardize section headings
  cleaned = cleaned
    .replace(PATTERNS.sections.education, "**Education:**")
    .replace(PATTERNS.sections.experience, "**Experience:**")
    .replace(PATTERNS.sections.projects, "**Projects:**")
    .replace(PATTERNS.sections.skills, "**Skills:**")
    .replace(/(\*\*Skills:\*\:)\s*\1+/g, "**Skills:**");

  // Preserve bullet points by replacing special characters with "- "
  cleaned = cleaned.replace(/[•·⋅‣⁃◦▪︎]/g, "- ");

  // Remove excessive spaces and newlines
  cleaned = cleaned
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .replace(/\n{3,}/g, "\n\n") // Collapse multiple newlines
    .trim();

  return cleaned;
}

/**
 * Cleans and structures job description text for AI processing
 * @param {string} text - Raw job description text
 * @returns {string} - Cleaned and structured job description text
 */
function cleanJobDescription(text) {
  let cleaned = text;

  // Remove branding fluff and disclaimers
  cleaned = cleaned
    .replace(PATTERNS.jobDesc.branding, "")
    .replace(PATTERNS.jobDesc.disclaimer, "")
    .replace(PATTERNS.jobDesc.salary, "[SALARY INFO REMOVED]");

  cleaned = cleaned.replace(/[•·⋅‣⁃◦▪︎]/g, "- ");

  // Extract and structure relevant sections
  const sections = {
    title: "",
    responsibilities: "",
    required: "",
    preferred: "",
  };

  // Extract role title
  const titleMatch = cleaned.match(/\b(job|role|position)\s*:?(.*?)(?:\n|$)/i);
  if (titleMatch) {
    sections.title = titleMatch[2].trim();
  }

  // Extract other sections
  const responsibilitiesMatch = cleaned.match(
    /(?:key\s*)?responsibilities?:?(.*?)(?=required|preferred|$)/is
  );
  const requiredMatch = cleaned.match(
    /required\s*(?:qualifications|skills):?(.*?)(?=preferred|$)/is
  );
  const preferredMatch = cleaned.match(
    /preferred\s*(?:qualifications|skills):?(.*?)$/is
  );

  sections.responsibilities = responsibilitiesMatch
    ? responsibilitiesMatch[1].trim()
    : "";
  sections.required = requiredMatch ? requiredMatch[1].trim() : "";
  sections.preferred = preferredMatch ? preferredMatch[1].trim() : "";

  // Format structured output
  let structuredOutput = "";
  if (sections.title)
    structuredOutput += `**Role Title:**\n${sections.title}\n\n`;
  if (sections.responsibilities)
    structuredOutput += `**Key Responsibilities:**\n${sections.responsibilities}\n\n`;
  if (sections.required)
    structuredOutput += `**Required Qualifications:**\n${sections.required}\n\n`;
  if (sections.preferred)
    structuredOutput += `**Preferred Qualifications:**\n${sections.preferred}\n\n`;

  // Clean formatting and limit output to avoid token issues
  structuredOutput = structuredOutput
    .replace(/\s+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 3000); // Prevent oversized outputs

  return structuredOutput;
}

module.exports = {
  cleanResume,
  cleanJobDescription,
};
