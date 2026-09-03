import { Button, Field, Input, Textarea } from "@fluentui/react-components";
import { ArrowSync20Regular, Sparkle20Filled } from "@fluentui/react-icons";
import { useState } from "react";
import { ResultPanel } from "../components/ResultPanel";
import type { AskResponse } from "../types/api";

type HrConnectPageProps = {
  busy: boolean;
  disabled: boolean;
  error?: string;
  onClear: () => void;
  onGenerate: (prompt: string) => void;
  result?: AskResponse;
};

const reflectionAreas = [
  {
    number: "01",
    title: "What results did you deliver, and how did you do it?",
    description: "Impact, delivered outcomes, achieved goals, and evidence of security, quality, and AI in the work.",
  },
  {
    number: "02",
    title: "Reflect on recent setbacks",
    description: "What did you learn, what changed in your approach, and how did you grow?",
  },
];

const pillars = [
  { label: "Your teamwork", description: "Behaviors and actions that helped you and your team excel." },
  { label: "Your partners", description: "How collaboration created clarity, shared success, and trust." },
  { label: "Your main customer", description: "Customer outcomes, partnership, feedback, and durable value." },
];

function buildHrPrompt(period: string, customer: string, context: string) {
  return `Create an evidence-based Microsoft HR Connect reflection for ${period} using my Microsoft 365 work context (emails, meetings, Teams messages, and documents).

Primary customer or account: ${customer || "not specified"}.
Additional employee context: ${context || "none provided"}.

Use first person and concise, professional language. Ground every claim in evidence you can find. Do not invent metrics, outcomes, customer feedback, goals, or setbacks. When evidence is incomplete, write "Evidence to add" and identify what is missing. Prefer concrete outcomes and examples over activity lists. Do not expose confidential content or unnecessary personal data.

Return Markdown with exactly this structure:

# What results did you deliver, and how did you do it?
## Business impact and results delivered
Summarize measurable outcomes, employee impact, and goals achieved.
## Security, quality, and AI
Explain how security, quality, responsible AI, and good engineering judgment were built into the work.
## How I delivered
Connect behaviors and actions to how I helped myself, my team, and Microsoft excel, grow, and build trust.

# Reflect on recent setbacks - what did you learn and how did you grow?
Describe specific setbacks or course corrections, lessons learned, actions taken, and evidence of growth. Do not frame normal work as a setback without evidence.

# Relationship pillars
## Your teamwork
Show outcomes, behaviors, inclusion, coaching, knowledge sharing, and trust within the team.
## Your partners
Show cross-team collaboration, alignment, influence, shared execution, and trust with partners.
## Your main customer - ${customer || "customer"}
Show customer outcomes, feedback, advocacy, partnership, and follow-through. Separate verified evidence from recommendations for evidence to add.

# Evidence summary
List the strongest source types and approximate dates used, without exposing private message content or long URLs.`;
}

export function HrConnectPage({ busy, disabled, error, onClear, onGenerate, result }: HrConnectPageProps) {
  const [period, setPeriod] = useState("Current Connect period");
  const [customer, setCustomer] = useState("Bimbo");
  const [context, setContext] = useState("");

  const generate = () => onGenerate(buildHrPrompt(period.trim(), customer.trim(), context.trim()));

  return (
    <div className="hr-connect-page">
      <section className="hr-intro">
        <div className="eyebrow">HR CONNECT</div>
        <h2 className="workspace-title">Build your impact reflection</h2>
        <p>Turn your Microsoft 365 work signals into a grounded draft focused on outcomes, learning, and how you enabled others.</p>
      </section>

      <section className="hr-setup" aria-label="HR Connect review setup">
        <div className="hr-fields">
          <Field label="Review period" required>
            <Input value={period} onChange={(_, data) => setPeriod(data.value)} disabled={busy || disabled} />
          </Field>
          <Field label="Main customer or account">
            <Input value={customer} onChange={(_, data) => setCustomer(data.value)} disabled={busy || disabled} placeholder="For example, Bimbo" />
          </Field>
        </div>
        <Field label="Context to emphasize" hint="Optional: goals, aliases, project names, or outcomes that Work IQ should look for.">
          <Textarea
            value={context}
            onChange={(_, data) => setContext(data.value)}
            disabled={busy || disabled}
            resize="vertical"
            placeholder="Example: Foundry adoption, customer workshops, delivery quality, mentoring..."
          />
        </Field>
        <div className="hr-actions">
          <Button icon={<ArrowSync20Regular />} onClick={onClear} disabled={busy || !result}>Clear draft</Button>
          <Button appearance="primary" icon={<Sparkle20Filled />} onClick={generate} disabled={busy || disabled || !period.trim()}>
            {busy ? "Building reflection..." : "Build grounded draft"}
          </Button>
        </div>
      </section>

      <section className="reflection-map" aria-label="Reflection sections">
        {reflectionAreas.map((area) => (
          <article className="reflection-area" key={area.number}>
            <span>{area.number}</span>
            <div><h3>{area.title}</h3><p>{area.description}</p></div>
          </article>
        ))}
      </section>

      <section className="pillars-section">
        <div className="eyebrow">THREE PILLARS</div>
        <div className="pillar-grid">
          {pillars.map((pillar) => (
            <article className="pillar" key={pillar.label}>
              <h3>{pillar.label}</h3>
              <p>{pillar.description}{pillar.label === "Your main customer" && customer ? ` Current focus: ${customer}.` : ""}</p>
            </article>
          ))}
        </div>
      </section>

      <ResultPanel
        eyebrow="GROUNDED DRAFT"
        title="Your Connect reflection"
        emptyMessage="Your evidence-based HR Connect draft will appear here."
        loadingLabel="Reviewing your Microsoft 365 work signals"
        loading={busy}
        result={result}
        error={error}
      />
    </div>
  );
}