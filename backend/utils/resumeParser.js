function parseResumeSections(resumeText) {
  const sections = {
    education: "",
    work_experience: "",
    projects: "",
    technical_skills: "",
    extracurriculars: "",
  };

  const sectionPatterns = {
    education:
      /(?:education|academic background|academic qualifications)[:\n]/i,
    work_experience:
      /(?:work experience|professional experience|employment history|career history)[:\n]/i,
    projects: /(?:projects|personal projects|relevant projects)[:\n]/i,
    technical_skills:
      /(?:technical skills|skills|technologies|proficiencies)[:\n]/i,
    extracurriculars:
      /(?:extracurricular activities|volunteer work|community involvement|hobbies)[:\n]/i,
  };

  const sectionOrder = [
    "education",
    "work_experience",
    "projects",
    "technical_skills",
    "extracurriculars",
  ];

  const lowerCaseResume = resumeText.toLowerCase();
  let lastIndex = 0;

  for (let i = 0; i < sectionOrder.length; i++) {
    const section = sectionOrder[i];
    const pattern = sectionPatterns[section];
    const match = pattern.exec(lowerCaseResume);

    if (match) {
      const startIndex = match.index;
      if (lastIndex !== 0) {
        sections[sectionOrder[i - 1]] = resumeText
          .substring(lastIndex, startIndex)
          .trim();
      }
      lastIndex = startIndex + match[0].length;
    }
  }

  if (lastIndex !== 0) {
    sections[sectionOrder[sectionOrder.length - 1]] = resumeText
      .substring(lastIndex)
      .trim();
  } else {
    sections.full_resume = resumeText.trim();
  }

  return sections;
}

module.exports = { parseResumeSections };
