const navButtonBase = 
  "relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900";

const navButtonPrimary = 
  "text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30";

const navButtonActive = 
  "text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40 before:absolute before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:w-6 before:h-0.5 before:bg-indigo-500 before:rounded-full";

const navButtonDanger = 
  "text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50/50 dark:hover:bg-red-950/30";

const actionButtonBase = 
  "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border shadow-sm hover:shadow-md active:shadow-sm hover:-translate-y-0.5 active:translate-y-0";

const actionButtonPrimary = 
  "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white border-indigo-600 hover:from-indigo-700 hover:to-indigo-600 dark:from-indigo-500 dark:to-indigo-400 dark:border-indigo-500";

const actionButtonSecondary = 
  "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800";

const actionButtonDanger = 
  "bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:border-red-300 dark:hover:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/30";

function NavButton({ active, to, onNavigate, children, variant = "default" }) {
  const getVariantClasses = () => {
    if (variant === "danger") return navButtonDanger;
    return navButtonPrimary;
  };

  return (
    <button
      type="button"
      onClick={() => onNavigate?.(to)}
      className={`
        ${navButtonBase}
        ${getVariantClasses()}
        ${active ? navButtonActive : ""}
      `}
    >
      {children}
    </button>
  );
}

function ActionButton({ onClick, children, variant = "primary" }) {
  const getVariantClasses = () => {
    switch (variant) {
      case "danger":
        return actionButtonDanger;
      case "secondary":
        return actionButtonSecondary;
      default:
        return actionButtonPrimary;
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${actionButtonBase} ${getVariantClasses()}`}
    >
      {children}
    </button>
  );
}

export default function AppHeader({
  route,
  isAuthed,
  onNavigate,
  onLogout,
}) {
  const activeFor = (to) => (route || "") === (to || "").replace(/^\//, "");

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center gap-8">
            <button
              type="button"
              className="flex items-center gap-2 text-lg font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 dark:from-indigo-400 dark:to-indigo-300 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
              onClick={() => onNavigate?.("/landing")}
            >
              <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Resume Analyzer</span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <NavButton to="/landing" onNavigate={onNavigate} active={activeFor("/landing")}>
                Home
              </NavButton>
              {isAuthed && (
                <>
                  <NavButton to="/dashboard" onNavigate={onNavigate} active={activeFor("/dashboard")}>
                    Dashboard
                  </NavButton>
                  <NavButton to="/history" onNavigate={onNavigate} active={activeFor("/history")}>
                    History
                  </NavButton>
                  <NavButton to="/resume-generator" onNavigate={onNavigate} active={activeFor("/resume-generator")}>
                    Create Resume
                  </NavButton>
                </>
              )}
            </nav>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {!isAuthed ? (
              <>
                <ActionButton variant="secondary" onClick={() => onNavigate?.("/login")}>
                  Sign in
                </ActionButton>
                <ActionButton onClick={() => onNavigate?.("/signup")}>
                  Get started
                </ActionButton>
              </>
            ) : (
              <ActionButton variant="danger" onClick={() => onLogout?.()}>
                Logout
              </ActionButton>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
            <NavButton to="/landing" onNavigate={onNavigate} active={activeFor("/landing")}>
              Home
            </NavButton>
            {isAuthed && (
              <>
                <NavButton to="/dashboard" onNavigate={onNavigate} active={activeFor("/dashboard")}>
                  Dashboard
                </NavButton>
                <NavButton to="/history" onNavigate={onNavigate} active={activeFor("/history")}>
                  History
                </NavButton>
                <NavButton to="/resume-generator" onNavigate={onNavigate} active={activeFor("/resume-generator")}>
                  Create Resume
                </NavButton>
              </>
            )}
            {!isAuthed && (
              <>
                <NavButton to="/login" onNavigate={onNavigate} active={activeFor("/login")}>
                  Sign in
                </NavButton>
                <NavButton to="/signup" onNavigate={onNavigate} active={activeFor("/signup")}>
                  Sign up
                </NavButton>
              </>
            )}
            {isAuthed && (
              <NavButton variant="danger" to="/landing" onNavigate={() => onLogout?.()}>
                Logout
              </NavButton>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}