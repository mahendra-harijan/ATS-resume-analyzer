import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary";
import ErrorPage from "./pages/ErrorPage";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <ErrorPage
          title="App crashed"
          message="The page encountered an unexpected problem."
          details={import.meta.env.DEV ? error?.stack || error?.message : ""}
          primaryAction={{
            label: "Reload",
            onClick: () => window.location.reload(),
          }}
          secondaryAction={{
            label: "Try again",
            onClick: resetErrorBoundary,
          }}
        />
      )}
    >
      <App />
    </ErrorBoundary>
  </StrictMode>
);
