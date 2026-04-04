import { useState } from "react";
import { apiBaseUrl, apiFetch } from "../lib/api";

function TextArea({ label, value, onChange, placeholder, rows = 6, icon }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute top-3 left-3 text-slate-400">
            {icon}
          </div>
        )}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`
            w-full rounded-xl border border-slate-200 dark:border-slate-700 
            bg-white dark:bg-slate-900 px-4 py-3 
            text-slate-900 dark:text-slate-100 placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
            transition-all duration-200 resize-none
            ${icon ? 'pl-10' : ''}
          `}
        />
      </div>
    </div>
  );
}

function SectionCard({ title, children, right, icon }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            {icon && (
              <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
                {icon}
              </div>
            )}
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
          </div>
          {right && (
            <div className="text-sm">
              {right}
            </div>
          )}
        </div>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
}

export default function ResumeGenerator() {
  const [userDetails, setUserDetails] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [htmlUrl, setHtmlUrl] = useState("");

  const downloadName = "generated_resume.pdf";

  const canDownload = Boolean(pdfUrl);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setPdfUrl("");
    setHtmlUrl("");

    setLoading(true);
    try {
      const data = await apiFetch("/api/generate-resume", {
        method: "POST",
        body: { userDetails, jobDescription },
      });

      const fullPdf = data?.pdfUrl ? `${apiBaseUrl()}${data.pdfUrl}` : "";
      setPdfUrl(fullPdf);

      const fullHtml = data?.htmlUrl ? `${apiBaseUrl()}${data.htmlUrl}` : "";
      setHtmlUrl(fullHtml);
    } catch (e2) {
      setError(e2?.message || "Failed to generate resume");
    } finally {
      setLoading(false);
    }
  }

  const characterCount = userDetails.length;
  const jdCharacterCount = jobDescription.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-100 dark:from-slate-950 dark:via-indigo-950/10 dark:to-slate-950">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-300/10 dark:bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 mb-4">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-indigo-500 animate-ping opacity-75" />
            </div>
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              AI-Powered Resume Generation
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-slate-900 via-indigo-800 to-slate-900 dark:from-white dark:via-indigo-300 dark:to-white bg-clip-text text-transparent">
            Resume Generator
          </h1>
          <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Create a tailored resume in seconds. Paste your details and a job description, and let AI do the rest.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Input Form */}
          <div className="lg:w-1/2 space-y-6">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* User Details Section */}
              <SectionCard 
                title="Personal & Professional Details"
                icon={
                  <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
              >
                <div className="space-y-4">
                  <TextArea
                    label="Your Information"
                    value={userDetails}
                    onChange={setUserDetails}
                    rows={16}
                    placeholder="Name: John Doe
Email: john@example.com
Phone: +1 234 567 8900
Location: New York, NY

Skills: React, Node.js, Python, TypeScript

Experience:
• Senior Developer at Tech Corp (2022-Present)
  - Built scalable applications serving 1M+ users
  - Led team of 5 developers

Education:
• B.S. Computer Science, University of Technology (2018-2022)

Projects:
• E-commerce Platform - Full-stack application with 500+ daily users"
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    }
                  />
                  {characterCount > 0 && (
                    <div className="flex justify-end">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {characterCount} characters
                      </span>
                    </div>
                  )}
                  <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs text-indigo-700 dark:text-indigo-300">
                        Include your name, contact info, skills, experience, education, and projects for best results
                      </p>
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* Job Description Section */}
              <SectionCard 
                title="Job Description"
                icon={
                  <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
              >
                <div className="space-y-4">
                  <TextArea
                    label="Target Job Description"
                    value={jobDescription}
                    onChange={setJobDescription}
                    rows={10}
                    placeholder="Senior Software Engineer
We're looking for an experienced software engineer with:
• 5+ years of experience in full-stack development
• Strong proficiency in React, Node.js, and TypeScript
• Experience with cloud platforms (AWS/Azure)
• Excellent problem-solving skills
• Bachelor's degree in Computer Science or related field"
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    }
                  />
                  {jdCharacterCount > 0 && (
                    <div className="flex justify-end">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {jdCharacterCount} characters
                      </span>
                    </div>
                  )}
                </div>
              </SectionCard>

              {/* Error Message */}
              {error && (
                <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full group relative py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-700 hover:via-indigo-600 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating Your Resume...
                    </>
                  ) : (
                    <>
                      Generate Resume
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </span>
              </button>

              {/* Tips Section */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-indigo-50 dark:from-slate-900/50 dark:to-indigo-950/30 border border-slate-200 dark:border-slate-800">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Pro Tips</h3>
                    <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      <li>• Include quantifiable achievements (e.g., "Increased performance by 40%")</li>
                      <li>• List relevant technical skills and tools you're proficient with</li>
                      <li>• Tailor your experience to match keywords from the job description</li>
                      <li>• Keep descriptions concise and action-oriented</li>
                    </ul>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column - Preview */}
          <div className="lg:w-1/2">
            <SectionCard 
              title="Resume Preview"
              icon={
                <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              }
              right={
                canDownload ? (
                  <a
                    href={pdfUrl}
                    download={downloadName}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 text-sm font-medium cursor-not-allowed">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </span>
                )
              }
            >
              {!htmlUrl ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    No Resume Generated Yet
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                    Fill in your details and job description, then click "Generate Resume" to see a preview here.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
                  <iframe 
                    title="Resume Preview" 
                    src={htmlUrl} 
                    className="w-full h-[75vh] min-h-[500px]"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  />
                </div>
              )}
            </SectionCard>

            {/* Quick Stats */}
            {canDownload && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                      <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">Resume Ready!</p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300">Your resume has been generated successfully</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">Click download to save</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}