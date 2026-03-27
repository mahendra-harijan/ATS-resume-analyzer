function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function compactJson(value) {
  return JSON.stringify(value, null, 2);
}

function buildHtmlResumePrompt(payload) {
  const instructions = `You are an expert ATS resume optimizer and HTML resume generator.

INPUTS:
- Job Description (JD)
- Candidate Details (structured JSON)

PRIMARY GOAL:
Generate a HIGH ATS-SCORE resume by maximizing keyword alignment with the JD while strictly using ONLY candidate-provided data.

STRICT RULES (MUST FOLLOW):
1) DO NOT invent or assume any candidate information.
2) DO NOT add skills, tools, or experience not present in candidate data.
3) You MAY rephrase and optimize wording to better match JD keywords.
4) Use JD ONLY to:
   - Extract important keywords
   - Improve phrasing
   - Align terminology

ATS OPTIMIZATION STRATEGY:
1) Extract top keywords from JD:
   - Skills (e.g., Python, SQL, Machine Learning)
   - Tools (e.g., TensorFlow, AWS)
   - Roles (e.g., Data Scientist, Backend Engineer)
   - Action verbs (e.g., built, developed, optimized)

2) Match these keywords with candidate data:
   - If keyword exists → emphasize it
   - If similar concept exists → rewrite to align wording
   - If NOT present → DO NOT include

3) Use strong action verbs:
   Built, Developed, Designed, Optimized, Implemented, Automated, Improved

4) Make bullets RESULT-ORIENTED (if data allows):
   Focus on impact, not just tasks

5) Ensure keyword density is HIGH but NATURAL:
   Avoid keyword stuffing

ATS FORMATTING RULES:
- No tables, no columns, no icons, no images
- Use simple HTML + bullet points only

VISUAL STYLE (STRICT):
- Centered name (blue)
- Contact line (email | phone)
- Links row
- Section headings: LEFT, UPPERCASE, blue
- Divider under each heading
- Diamond bullets ❖

PROJECT FORMAT:
- Line 1: Name (bold) + links | Date (right)
- Line 2: Tech stack (italic)
- Then 2–3 bullets (<=12 words)

SECTION ORDER:
1) EDUCATION
2) TECHNICAL SKILLS
3) ACADEMIC PROJECTS
4) DSA & Problem Solving (optional)
5) CERTIFICATION (optional)

CONTENT LIMITS:
- Education: max 2
- Projects: max 3
- Bullets/project: max 3
- Certifications: max 4

RELEVANCE FILTER:
Keep only JD-relevant, high-impact content

HTML REQUIREMENTS:
- Return full HTML document
- Start with <!doctype html>
- Include <html>, <head>, <meta charset="utf-8" />, <style>, <body>
- No markdown, no explanation

MANDATORY HTML STRUCTURE:
<div class="resume">
  <div class="top">
    <h1 class="name">Full Name</h1>
    <div class="line1">email | phone</div>
    <div class="line2"><a>github</a> <span class="sep">|</span> <a>linkedin</a></div>
  </div>

  <div class="section">
    <div class="heading">SECTION NAME</div>
    <div class="divider"></div>
    <ul class="dlist">
      <li><span class="d">❖</span><div class="c">Content</div></li>
    </ul>
  </div>
</div>

FINAL OBJECTIVE:
- Maximize ATS keyword match
- Keep resume one-page
- Keep it clean and professional

OUTPUT CONTRACT:
Return ONLY the HTML string. No explanations.`;

  const candidateJson = compactJson({
    personalDetails: payload.personalDetails,
    education: payload.education,
    technicalSkills: payload.technicalSkills,
    projects: payload.projects,
    experience: payload.experience,
    extraSections: payload.extraSections,
  });

  return `${instructions}

JOB DESCRIPTION (verbatim):
${escapeHtml(payload.jobDescription)}

CANDIDATE DETAILS JSON:
${candidateJson}
`;
}

module.exports = { buildHtmlResumePrompt };