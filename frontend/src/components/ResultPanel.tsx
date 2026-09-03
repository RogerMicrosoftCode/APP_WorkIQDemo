import { MessageBar, MessageBarBody, Spinner } from "@fluentui/react-components";
import { CheckmarkCircle20Filled, Clock20Regular, DataUsage20Regular } from "@fluentui/react-icons";
import ReactMarkdown from "react-markdown";
import type { AskResponse } from "../types/api";

type ResultPanelProps = {
  error?: string;
  eyebrow?: string;
  emptyMessage?: string;
  loading: boolean;
  loadingLabel?: string;
  result?: AskResponse;
  title?: string;
};

export function ResultPanel({
  error,
  eyebrow = "RESULTS",
  emptyMessage = "Your grounded response will appear here.",
  loading,
  loadingLabel = "Grounding your question in Microsoft 365",
  result,
  title = "Organizational intelligence",
}: ResultPanelProps) {
  return (
    <section className="result-section" aria-live="polite">
      <div className="result-header">
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h2>{title}</h2>
        </div>
        {result && (
          <div className="result-meta">
            <span><Clock20Regular /> {(result.durationMs / 1000).toFixed(1)}s</span>
            <span><DataUsage20Regular /> {result.mode === "demo" ? "Demo data" : result.mode === "local" ? "Work IQ CLI" : "Work IQ MCP"}</span>
          </div>
        )}
      </div>

      {loading && (
        <div className="result-state">
          <Spinner size="large" label={loadingLabel} />
        </div>
      )}

      {error && (
        <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar>
      )}

      {!loading && !error && !result && (
        <div className="result-state result-empty">
          <DataUsage20Regular />
          <p>{emptyMessage}</p>
        </div>
      )}

      {!loading && result && (
        <div className="answer-content">
          <div className={`grounding-banner ${result.grounded ? "grounding-live" : "grounding-demo"}`}>
            <CheckmarkCircle20Filled />
            {result.grounded ? "Grounded in your Microsoft 365 context" : "Synthetic demo response"}
          </div>
          <div className="markdown-body"><ReactMarkdown>{result.answer}</ReactMarkdown></div>
        </div>
      )}
    </section>
  );
}
