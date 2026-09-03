import { Button, MessageBar, MessageBarBody, Spinner, Textarea } from "@fluentui/react-components";
import {
  ArrowRight20Regular,
  Bot20Regular,
  DocumentArrowDown20Regular,
  DocumentBulletList20Regular,
  History20Regular,
  Mail20Regular,
  PeopleTeam20Regular,
  Send20Filled,
  SlideText20Regular,
} from "@fluentui/react-icons";
import { useMutation } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { AskResponse } from "../types/api";

type ScenarioId = "decision" | "memory" | "experts" | "action";

type Scenario = {
  id: ScenarioId;
  title: string;
  description: string;
  exampleQuestion: string;
  exampleResponse: string[];
  value: string;
  icon: ReactNode;
};

type BusinessValuePageProps = {
  disabled: boolean;
  onAsk: (question: string) => Promise<AskResponse>;
};

const scenarios: Scenario[] = [
  {
    id: "decision",
    title: "Decision Intelligence",
    description: "Understand decisions, stakeholders, and discussion history.",
    exampleQuestion: "What decisions did we make about Customer360 architecture and where were they discussed?",
    exampleResponse: ["Architecture approved", "Discussed in 3 meetings", "Referenced in Teams chats", "Supported by design documents"],
    value: "AI understands decisions, not just files.",
    icon: <DocumentBulletList20Regular />,
  },
  {
    id: "memory",
    title: "Organizational Memory",
    description: "Recall previous conclusions and project history.",
    exampleQuestion: "What did we conclude when discussing REST versus MCP?",
    exampleResponse: ["Historical discussions", "Prior recommendations", "Decision timeline", "Outstanding questions"],
    value: "AI remembers organizational context over time.",
    icon: <History20Regular />,
  },
  {
    id: "experts",
    title: "Expert Discovery",
    description: "Identify experts and stakeholders.",
    exampleQuestion: "Who should be involved before finalizing the logistics modernization proposal?",
    exampleResponse: ["Azure Architect", "Supply Chain Lead", "Security Reviewer", "Project Sponsor"],
    value: "AI understands collaboration patterns and expertise.",
    icon: <PeopleTeam20Regular />,
  },
  {
    id: "action",
    title: "Agent Action",
    description: "Transform knowledge into outcomes.",
    exampleQuestion: "Create an executive briefing from this discussion with key decisions, actions, risks, and recommendations.",
    exampleResponse: ["Executive Summary", "Key Decisions", "Action Items", "Risks", "Recommendations"],
    value: "AI turns context into actions.",
    icon: <Bot20Regular />,
  },
];

const initialQuestions = Object.fromEntries(
  scenarios.map((scenario) => [scenario.id, scenario.exampleQuestion]),
) as Record<ScenarioId, string>;

const actionButtons = [
  { label: "Generate PowerPoint", icon: <SlideText20Regular /> },
  { label: "Draft Email", icon: <Mail20Regular /> },
  { label: "Export Report", icon: <DocumentArrowDown20Regular /> },
];

export function BusinessValuePage({ disabled, onAsk }: BusinessValuePageProps) {
  const [selectedId, setSelectedId] = useState<ScenarioId>("decision");
  const [questions, setQuestions] = useState(initialQuestions);
  const [results, setResults] = useState<Partial<Record<ScenarioId, AskResponse>>>({});
  const [errors, setErrors] = useState<Partial<Record<ScenarioId, string>>>({});
  const [actionNotice, setActionNotice] = useState<string>();
  const selected = scenarios.find((scenario) => scenario.id === selectedId)!;

  const queryMutation = useMutation({
    mutationFn: ({ question }: { id: ScenarioId; question: string }) => onAsk(question),
    onSuccess: (result, variables) => {
      setResults((current) => ({ ...current, [variables.id]: result }));
      setErrors((current) => ({ ...current, [variables.id]: undefined }));
    },
    onError: (error, variables) => {
      setErrors((current) => ({
        ...current,
        [variables.id]: error instanceof Error ? error.message : "Work IQ could not complete this scenario.",
      }));
    },
  });

  const runningId = queryMutation.isPending ? queryMutation.variables?.id : undefined;

  const selectScenario = (id: ScenarioId) => {
    setSelectedId(id);
    setActionNotice(undefined);
  };

  const runScenario = (scenario: Scenario) => {
    const question = questions[scenario.id].trim();
    if (!question) return;
    selectScenario(scenario.id);
    queryMutation.mutate({ id: scenario.id, question });
  };

  return (
    <div className="business-value-page">
      <section className="business-value-hero">
        <div className="eyebrow">BUSINESS VALUE</div>
        <h2 className="workspace-title">How Work IQ Understands Work</h2>
        <p>From decisions and expertise to memory and action.</p>
      </section>

      <section className="value-scenario-grid" aria-label="Work IQ customer scenarios">
        {scenarios.map((scenario, index) => (
          <article
            className={`value-scenario-card ${selectedId === scenario.id ? "value-scenario-selected" : ""}`}
            key={scenario.id}
          >
            <button
              type="button"
              className="value-card-select"
              onClick={() => selectScenario(scenario.id)}
              aria-pressed={selectedId === scenario.id}
              aria-controls="business-value-guide"
            >
              <span className="value-card-index">0{index + 1}</span>
              <span className="value-card-icon">{scenario.icon}</span>
              <span className="value-card-copy">
                <strong>{scenario.title}</strong>
                <span>{scenario.description}</span>
              </span>
              <ArrowRight20Regular className="value-card-arrow" />
            </button>
            <div className="value-card-query">
              <label htmlFor={`business-value-${scenario.id}`}>ASK WORK IQ</label>
              <Textarea
                id={`business-value-${scenario.id}`}
                value={questions[scenario.id]}
                onChange={(_, data) => setQuestions((current) => ({ ...current, [scenario.id]: data.value }))}
                placeholder={scenario.exampleQuestion}
                resize="vertical"
                disabled={disabled || queryMutation.isPending}
                aria-label={`${scenario.title} query`}
              />
              <div className="value-card-query-footer">
                <span>Example included - edit it or ask as written.</span>
                <Button
                  appearance="primary"
                  icon={<Send20Filled />}
                  onClick={() => runScenario(scenario)}
                  disabled={disabled || queryMutation.isPending || questions[scenario.id].trim().length < 2}
                >
                  {runningId === scenario.id ? "Asking..." : "Ask"}
                </Button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section id="business-value-guide" className="business-value-detail" aria-live="polite">
        <div className="value-detail-header">
          <div className="value-detail-icon">{selected.icon}</div>
          <div><div className="eyebrow">EXAMPLE GUIDE</div><h3>{selected.title}</h3></div>
        </div>
        <div className="value-detail-content">
          <div>
            <div className="value-detail-label">A USEFUL RESPONSE MAY INCLUDE</div>
            <ul>{selected.exampleResponse.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
          <aside className="business-value-statement"><span>BUSINESS VALUE</span><p>{selected.value}</p></aside>
        </div>
      </section>

      <section className="maturity-section" aria-label="Work IQ maturity progression">
        <div className="eyebrow">MATURITY PROGRESSION</div>
        <div className="maturity-track">
          {scenarios.map((scenario, index) => (
            <div className="maturity-step-group" key={scenario.id}>
              <div className="maturity-step"><span>0{index + 1}</span><strong>{scenario.title}</strong></div>
              {index < scenarios.length - 1 && <ArrowRight20Regular className="maturity-arrow" />}
            </div>
          ))}
        </div>
        <p>Work IQ moves beyond retrieval and enables agents to understand, reason, and act.</p>
      </section>

      <section className="scenario-response-section" aria-label="Business Value scenario responses">
        <div className="eyebrow">WORK IQ RESPONSES</div>
        <h3>Grounded results by scenario</h3>
        <div className="scenario-response-grid">
          {scenarios.map((scenario) => {
            const result = results[scenario.id];
            const error = errors[scenario.id];
            const loading = runningId === scenario.id;
            return (
              <article className="scenario-response-panel" key={scenario.id}>
                <div className="scenario-response-header">
                  <span className="value-card-icon">{scenario.icon}</span>
                  <div><strong>{scenario.title}</strong><span>{result ? `${(result.durationMs / 1000).toFixed(1)}s - Work IQ` : "Ready for a real query"}</span></div>
                </div>
                <div className="scenario-response-question"><span>QUERY</span><p>{questions[scenario.id]}</p></div>
                {loading ? (
                  <div className="scenario-response-state"><Spinner size="medium" label="Grounding with Work IQ" /></div>
                ) : error ? (
                  <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar>
                ) : result ? (
                  <div className="scenario-response-body"><ReactMarkdown>{result.answer}</ReactMarkdown></div>
                ) : (
                  <div className="scenario-response-example">
                    <span>EXAMPLE RESPONSE GUIDE</span>
                    <ul>{scenario.exampleResponse.map((item) => <li key={item}>{item}</li>)}</ul>
                  </div>
                )}
                {scenario.id === "action" && result && (
                  <div className="agent-action-area">
                    <div className="agent-action-buttons" aria-label="Agent actions">
                      {actionButtons.map((action) => (
                        <Button key={action.label} icon={action.icon} onClick={() => setActionNotice(`${action.label} demo prepared from the grounded Agent Action response.`)}>{action.label}</Button>
                      ))}
                    </div>
                    {actionNotice && <MessageBar intent="success"><MessageBarBody>{actionNotice}</MessageBarBody></MessageBar>}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
