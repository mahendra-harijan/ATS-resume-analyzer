export default function Landing({ onLogin, onSignup }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-300/10 dark:bg-cyan-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 sm:pt-24 sm:pb-32">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                AI-powered ATS scoring for placement resumes
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="mt-8 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-slate-900 via-indigo-800 to-slate-900 dark:from-white dark:via-indigo-300 dark:to-white bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                Your resume, scored
              </span>
              <br />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                like a hiring pipeline.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
              Upload a resume and a job description to get an ATS score (0-100), 
              section-wise ratings, missing keywords, and actionable recommendations.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
              <button
                className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
                onClick={onLogin}
                type="button"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started
                  <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
              <button
                className="px-8 py-4 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                onClick={onSignup}
                type="button"
              >
                Create free account
              </button>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="group p-6 rounded-2xl bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  98%
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Accuracy rate
                </div>
              </div>
              <div className="group p-6 rounded-2xl bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  10K+
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Resumes analyzed
                </div>
              </div>
              <div className="group p-6 rounded-2xl bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  3s
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Average analysis time
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              optimize your resume
            </span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Get comprehensive analysis and actionable insights to improve your chances
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: (
                <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
              title: "Upload & Extract",
              description: "PDF and DOCX parsing to get clean, formatted text ready for analysis.",
              gradient: "from-blue-500/10 to-cyan-500/10"
            },
            {
              icon: (
                <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
              title: "ATS Score (0-100)",
              description: "Overall score + detailed ratings for skills, experience, education, and projects.",
              gradient: "from-purple-500/10 to-pink-500/10"
            },
            {
              icon: (
                <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              ),
              title: "Keyword Gaps",
              description: "Identify missing keywords and get targeted recommendations for improvement.",
              gradient: "from-green-500/10 to-emerald-500/10"
            }
          ].map((feature, idx) => (
            <div
              key={feature.title}
              className="group relative p-8 rounded-2xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative">
                <div className="mb-4 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 w-fit group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Features */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-200/30 dark:border-indigo-800/30">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Real-time Analysis</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Get instant feedback and recommendations as you upload your resume</p>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-500/5 to-pink-500/5 border border-purple-200/30 dark:border-purple-800/30">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Privacy First</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">Your data is encrypted and never shared with third parties</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
            <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z" />
            </svg>
            <span className="text-sm text-slate-600 dark:text-slate-300">
              Trusted by students and professionals worldwide
            </span>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-16 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Built for placement-level projects. Configure your Groq API key on the backend for optimal performance.
          </p>
        </div>
      </div>
    </div>
  );
}