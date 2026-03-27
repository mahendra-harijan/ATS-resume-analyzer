import { useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import ScoreProgress from "../components/ScoreProgress";
import SectionScores from "../components/SectionScores";
import SectionScorePie from "../components/SectionScorePie";
import KeywordGaps from "../components/KeywordGaps";
import Recommendations from "../components/Recommendations";

function clampScore(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function variantFromScore(score) {
  const s = clampScore(score);
  if (s >= 80) return "success";
  if (s >= 60) return "warning";
  return "danger";
}

function averageSectionScore(sectionScores) {
  const s = sectionScores || {};
  const values = [s.skills, s.experience, s.education, s.projects, s.keywordsMatch]
    .map(clampScore)
    .filter((n) => Number.isFinite(n));
  if (values.length === 0) return 0;
  return values.reduce((sum, n) => sum + n, 0) / values.length;
}

export default function Dashboard() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [showAnalyzeForm, setShowAnalyzeForm] = useState(true);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fileMeta = useMemo(() => {
    if (!resumeFile) return null;
    return { name: resumeFile.name, size: resumeFile.size, type: resumeFile.type };
  }, [resumeFile]);

  function isAllowedResumeFile(file) {
    if (!file) return false;
    const name = String(file.name || "").toLowerCase();
    return name.endsWith(".pdf") || name.endsWith(".docx");
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer?.files?.[0];
    if (!f) return;
    if (!isAllowedResumeFile(f)) {
      setError("Please upload a PDF or DOCX resume.");
      return;
    }
    setError("");
    setResumeFile(f);
  }

  async function analyze() {
    setLoading(true);
    setError("");
    try {
      if (!resumeFile) throw new Error("Please upload a resume (PDF or DOCX).");
      if (!jobDescription || jobDescription.trim().length < 20) throw new Error("Enter a valid job description.");

      const fd = new FormData();
      fd.append("resume", resumeFile);
      fd.append("jobDescription", jobDescription);

      const data = await apiFetch("/api/analysis/analyze", { method: "POST", formData: fd });

      const rep = data?.report;
      if (!rep) throw new Error("No report returned from server");

      setResult(rep);
      setShowAnalyzeForm(false);
    } catch (e) {
      setError(e.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  function startNewAnalysis() {
    setResult(null);
    setError("");
    setResumeFile(null);
    setJobDescription("");
    setShowAnalyzeForm(true);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-950">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-300/10 dark:bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Gradient */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 mb-4">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <div className="absolute inset-0 w-2 h-2 rounded-full bg-indigo-500 animate-ping opacity-75" />
            </div>
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              AI-Powered Analysis
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-slate-900 via-indigo-800 to-slate-900 dark:from-white dark:via-indigo-300 dark:to-white bg-clip-text text-transparent">
            Resume Analyzer
          </h1>
          <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Get comprehensive ATS analysis and actionable insights to optimize your resume
          </p>
        </div>

        {/* Analysis Form */}
        {showAnalyzeForm ? (
          <div className="mb-8 group">
            <div className="relative overflow-hidden rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/50 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5" />
              <div className="relative p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">New Analysis</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Upload your resume and job description</p>
                  </div>
                </div>
                
                {/* File Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Resume File
                  </label>
                  <div
                    onClick={() => document.getElementById("resume-file-input")?.click()}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                    }}
                    onDrop={handleDrop}
                    className={`
                      relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                      ${dragActive 
                        ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 scale-[1.02]" 
                        : "border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20"
                      }
                      ${loading ? "opacity-50 pointer-events-none" : ""}
                    `}
                  >
                    {fileMeta ? (
                      <div className="animate-in fade-in zoom-in duration-300">
                        <div className="inline-flex p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/50 mb-3">
                          <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{fileMeta.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{Math.round(fileMeta.size / 1024)} KB</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setResumeFile(null);
                          }}
                          className="mt-3 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium transition"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="inline-flex p-3 rounded-full bg-slate-100 dark:bg-slate-800 mb-3 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
                          <svg className="w-8 h-8 text-slate-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Drag & drop your resume here</p>
                        <p className="text-xs text-slate-500 mt-1">or click to browse • PDF or DOCX</p>
                      </div>
                    )}
                  </div>
                  <input
                    id="resume-file-input"
                    type="file"
                    accept=".pdf,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && isAllowedResumeFile(file)) {
                        setResumeFile(file);
                        setError("");
                      } else if (file) {
                        setError("Please upload a PDF or DOCX file");
                      }
                    }}
                    className="hidden"
                  />
                </div>

                {/* Job Description */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Job Description
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={5}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 resize-none"
                    placeholder="Paste the complete job description here..."
                  />
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Minimum 20 characters for accurate analysis
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 animate-in fade-in slide-in-from-top-2 duration-300">
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
                  onClick={analyze}
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
                        Analyzing your resume...
                      </>
                    ) : (
                      <>
                        Analyze Resume
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/30 dark:via-teal-950/30 dark:to-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 p-5">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50">
                    <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Analysis Complete!</p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">Your resume has been analyzed successfully</p>
                  </div>
                </div>
                <button
                  onClick={startNewAnalysis}
                  className="px-5 py-2 rounded-lg bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-all duration-200 hover:shadow-md"
                >
                  New Analysis
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Overall Score Card */}
            <div className="group relative overflow-hidden rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5" />
              <div className="relative p-6">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
                      <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Overall ATS Score</h2>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Your resume's compatibility with the job description</p>
                </div>
                <ScoreProgress score={result.overallScore} />
              </div>
            </div>

            {/* Section Score Distribution */}
            <div className="group relative overflow-hidden rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5" />
              <div className="relative p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
                    <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Section Score Distribution</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Visual breakdown of each section's performance</p>
                  </div>
                </div>
                <SectionScorePie sectionScores={result.sectionScores} />
              </div>
            </div>

            {/* Section-wise Scores */}
            <div className="group relative overflow-hidden rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5" />
              <div className="relative p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
                    <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Section-wise Scores</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Detailed ratings for each category</p>
                  </div>
                </div>
                <SectionScores sectionScores={result.sectionScores} />
              </div>
            </div>

            {/* Two Column Layout for Recommendations & Keywords */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recommendations */}
              <div className="group relative overflow-hidden rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-orange-500/5" />
                <div className="relative p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                      <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Recommendations</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Actionable improvements</p>
                    </div>
                  </div>
                  <Recommendations recommendations={result.recommendations} />
                </div>
              </div>

              {/* Keyword Analysis */}
              <div className="group relative overflow-hidden rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-rose-500/5" />
                <div className="relative p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/50">
                      <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Keyword Analysis</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Missing keywords detected</p>
                    </div>
                  </div>
                  <KeywordGaps missingKeywords={result.missingKeywords} />
                </div>
              </div>
            </div>

            {/* Priority Section */}
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/40 dark:via-orange-950/40 dark:to-amber-950/40 border border-amber-200 dark:border-amber-800/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10" />
              <div className="relative p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 rounded-lg bg-amber-200 dark:bg-amber-800/50">
                    <svg className="w-4 h-4 text-amber-700 dark:text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100">Priority Actions</h2>
                    <p className="text-sm text-amber-700 dark:text-amber-300">High-impact improvements to boost your ATS score</p>
                  </div>
                </div>
                
                {result.finalRecommendations && result.finalRecommendations.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
                      <span className="w-1 h-4 bg-amber-500 rounded-full" />
                      Critical Improvements
                    </h3>
                    <ul className="space-y-2">
                      {result.finalRecommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-3 p-3 bg-white/60 dark:bg-slate-800/40 rounded-xl hover:bg-white/80 dark:hover:bg-slate-800/60 transition-all">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                            <span className="text-xs font-bold text-amber-700 dark:text-amber-300">{idx + 1}</span>
                          </div>
                          <span className="text-sm text-amber-800 dark:text-amber-200">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.suggestionsToImproveATS && result.suggestionsToImproveATS.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
                      <span className="w-1 h-4 bg-amber-500 rounded-full" />
                      ATS Optimization Tips
                    </h3>
                    <ul className="space-y-2">
                      {result.suggestionsToImproveATS.map((suggestion, idx) => (
                        <li key={idx} className="flex items-start gap-3 p-3 bg-white/60 dark:bg-slate-800/40 rounded-xl hover:bg-white/80 dark:hover:bg-slate-800/60 transition-all">
                          <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-amber-800 dark:text-amber-200">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(!result.finalRecommendations || result.finalRecommendations.length === 0) && 
                 (!result.suggestionsToImproveATS || result.suggestionsToImproveATS.length === 0) && (
                  <div className="text-center py-8">
                    <div className="inline-flex p-4 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-3">
                      <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-amber-700 dark:text-amber-300 font-medium">Excellent work!</p>
                    <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">No critical issues found in your resume</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}