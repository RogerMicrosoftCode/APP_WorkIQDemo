import { Button, Textarea } from "@fluentui/react-components";
import { ArrowUp20Filled, Delete20Regular } from "@fluentui/react-icons";
import { useState } from "react";

type PromptComposerProps = {
  busy: boolean;
  disabled: boolean;
  onAsk: (question: string) => void;
  onClear: () => void;
};

const suggestions = [
  "What should I focus on today?",
  "Summarize my latest project updates",
  "Which decisions are waiting on me?",
];

export function PromptComposer({ busy, disabled, onAsk, onClear }: PromptComposerProps) {
  const [question, setQuestion] = useState("");

  const submit = () => {
    const trimmed = question.trim();
    if (trimmed) onAsk(trimmed);
  };

  const clear = () => {
    setQuestion("");
    onClear();
  };

  return (
    <section className="composer-section">
      <div className="eyebrow">ASK WORK IQ</div>
      <h2 className="workspace-title">What do you need to know?</h2>

      <div className="prompt-shell">
        <Textarea
          value={question}
          onChange={(_, data) => setQuestion(data.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          placeholder="Ask about your meetings, messages, files, people, or projects..."
          resize="vertical"
          size="large"
          disabled={disabled || busy}
          aria-label="Work IQ question"
        />
        <div className="composer-actions">
          <span className="hidden text-xs text-[#8a8886] sm:inline">Enter to ask · Shift+Enter for a new line</span>
          <div className="flex gap-2">
            <Button icon={<Delete20Regular />} onClick={clear} disabled={!question && !busy}>Clear</Button>
            <Button appearance="primary" icon={<ArrowUp20Filled />} onClick={submit} disabled={disabled || busy || question.trim().length < 2}>
              {busy ? "Asking..." : "Ask"}
            </Button>
          </div>
        </div>
      </div>

      <div className="suggestions" aria-label="Suggested questions">
        {suggestions.map((suggestion) => (
          <button key={suggestion} type="button" onClick={() => setQuestion(suggestion)} disabled={busy || disabled}>
            {suggestion}
          </button>
        ))}
      </div>
    </section>
  );
}
