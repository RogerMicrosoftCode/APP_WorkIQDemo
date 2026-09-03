import { Button, Checkbox, Field, Input, Textarea } from "@fluentui/react-components";
import {
  ArrowSync20Regular,
  BoxMultiple20Regular,
  CheckmarkCircle20Regular,
  Lightbulb20Regular,
  PeopleTeam20Regular,
  QuestionCircle20Regular,
  Sparkle20Filled,
} from "@fluentui/react-icons";
import type { ReactNode } from "react";
import { useState } from "react";
import { ResultPanel } from "../components/ResultPanel";
import type { AskResponse } from "../types/api";

type LogisticsIntelligencePageProps = {
  busy: boolean;
  disabled: boolean;
  error?: string;
  onClear: () => void;
  onGenerate: (prompt: string) => void;
  result?: AskResponse;
};

const intelligenceQuestions: Array<{ label: string; description: string; icon: ReactNode }> = [
  { label: "What happened?", description: "Build a time-ordered view of the operational signal and business impact.", icon: <BoxMultiple20Regular /> },
  { label: "Why did it happen?", description: "Separate confirmed causes, contributing factors, and open hypotheses.", icon: <QuestionCircle20Regular /> },
  { label: "Who is working on it?", description: "Identify owners, responders, partner teams, and unresolved handoffs.", icon: <PeopleTeam20Regular /> },
  { label: "What was already decided?", description: "Recover decisions, commitments, constraints, and due dates.", icon: <CheckmarkCircle20Regular /> },
  { label: "What should we do next?", description: "Recommend prioritized actions, owners, timing, and escalation triggers.", icon: <Lightbulb20Regular /> },
];

const liveDefaults = {
  incident: "Review active logistics disruptions and delivery risks",
  scope: "Bimbo",
  timeWindow: "Last 14 days",
  context: "",
};

const syntheticScenario = {
  incident: "Cold-chain temperature excursion on shipment MX-45821",
  scope: "Bimbo | Monterrey DC to Dallas Distribution Center",
  timeWindow: "August 21-24, 2026",
  context: "Reefer telemetry exceeded 8 C for 47 minutes near Laredo. The carrier reported a refrigeration reset, Quality placed the load on hold, and the customer requested a disposition before the 4:00 PM delivery window.",
};

const syntheticResult: AskResponse = {
  mode: "demo",
  grounded: false,
  durationMs: 0,
  answer: `# Logistics Intelligence Control Tower

## Executive signal

**Severity:** High  
**Status:** Contained; quality disposition pending  
**Affected scope:** Synthetic shipment MX-45821, Monterrey DC to Dallas Distribution Center  
**Customer impact:** The planned delivery window is at risk until Product Quality approves release or replacement.

## What happened?

- **August 23, 1:42 PM:** Synthetic reefer telemetry exceeded the 8 C threshold.
- **1:45-2:32 PM:** Temperature remained outside the approved range for 47 minutes near Laredo.
- **2:10 PM:** The carrier reset the refrigeration unit and reported stable telemetry.
- **2:25 PM:** Quality placed the shipment on hold pending temperature-history review.
- **Current state:** The load remains staged; no customer delivery has occurred.

## Why did it happen?

- **Verified fact:** The refrigeration unit generated a compressor fault and was reset by the carrier.
- **Working hypothesis:** Extended door-open time during inspection may have increased the excursion duration.
- **Evidence gap:** Maintenance logs and the complete sensor calibration record must be reviewed before confirming root cause.

## Who is working on it?

- Logistics Operations is coordinating the carrier and delivery slot.
- Product Quality is reviewing product exposure and release criteria.
- The carrier's fleet team is validating the refrigeration fault.
- The Bimbo account team is preparing the customer update.
- **Owner to confirm:** Final decision owner for release versus replacement.

## What was already decided?

- Hold the shipment until Quality completes disposition.
- Preserve the full telemetry export and carrier maintenance record.
- Keep the customer delivery slot on provisional hold until 4:00 PM.
- Prepare a replacement load if release is not approved by 3:00 PM.

## What should we do next?

| Priority | Action | Owner | Target timing | Expected outcome | Escalation trigger |
| --- | --- | --- | --- | --- | --- |
| P0 | Complete product disposition | Product Quality | 2:45 PM | Release or reject decision | No decision by 3:00 PM |
| P0 | Confirm replacement capacity | Logistics Operations | 2:30 PM | Protected customer delivery | No backup trailer available |
| P1 | Send a factual customer update | Account team | 3:00 PM | Shared expectations and trust | Delivery window changes |
| P1 | Complete refrigeration root-cause review | Carrier fleet team | End of day | Corrective action identified | Repeat compressor fault |

## Risks and watch signals

- **Quality:** Product exposure may exceed approved tolerance.
- **Schedule:** The 4:00 PM delivery window could be missed.
- **Customer:** Delayed or inconsistent updates could reduce trust.
- **Watch:** Reefer temperature, Quality disposition time, replacement capacity, and customer acknowledgement.

## Evidence summary

This is a **synthetic demonstration**. The timeline, shipment, owners, decisions, and actions are fictional and are not sourced from Microsoft 365.`,
};

function buildLogisticsPrompt(incident: string, scope: string, timeWindow: string, context: string) {
  return `Create a Logistics Intelligence Control Tower brief powered by Work IQ using my Microsoft 365 context (emails, Teams messages, meetings, and documents).

Operational signal or incident: ${incident || "Review current logistics risks and active disruptions"}.
Customer, shipment, route, site, or program: ${scope || "not specified"}.
Time window: ${timeWindow || "recent activity"}.
Additional context: ${context || "none provided"}.

Ground every statement in evidence you can find. Do not invent shipment status, causes, owners, decisions, dates, customer impact, metrics, or actions. Clearly distinguish Verified fact, Working hypothesis, and Evidence gap. Use concise control-tower language. Protect confidential and personal data; identify people only when operational ownership is relevant. If multiple incidents match, separate them and state which one appears most urgent.

Return Markdown with exactly this structure:

# Logistics Intelligence Control Tower
## Executive signal
State severity, current status, affected scope, latest verified update, and business/customer impact in a compact summary.

## What happened?
Provide a chronological timeline with approximate dates/times, operational milestones, impact, and current state.

## Why did it happen?
List confirmed root causes first, then contributing factors and working hypotheses. Label every unconfirmed item. Include evidence gaps blocking root-cause confidence.

## Who is working on it?
List accountable owner, active responders, partner teams, customer contacts when relevant, and pending handoffs. Include the latest known update from each without exposing private message text.

## What was already decided?
List decisions, commitments, mitigations, constraints, owners, and due dates. Distinguish final decisions from proposals or discussions.

## What should we do next?
Provide a prioritized action table with Priority, Action, Owner, Target timing, Expected outcome, and Escalation trigger. Do not assign an owner without evidence; use Owner to confirm when missing.

## Risks and watch signals
List customer, schedule, cost, quality, security, compliance, and dependency risks supported by evidence, plus the signals to monitor.

## Evidence summary
List source type and approximate date for the strongest evidence. Do not reproduce private content or long URLs.`;
}

export function LogisticsIntelligencePage({
  busy,
  disabled,
  error,
  onClear,
  onGenerate,
  result,
}: LogisticsIntelligencePageProps) {
  const [liveScenarioEnabled, setLiveScenarioEnabled] = useState(true);
  const [incident, setIncident] = useState(liveDefaults.incident);
  const [scope, setScope] = useState(liveDefaults.scope);
  const [timeWindow, setTimeWindow] = useState(liveDefaults.timeWindow);
  const [context, setContext] = useState(liveDefaults.context);

  const setScenarioMode = (enabled: boolean) => {
    setLiveScenarioEnabled(enabled);
    onClear();
    const values = enabled ? liveDefaults : syntheticScenario;
    setIncident(values.incident);
    setScope(values.scope);
    setTimeWindow(values.timeWindow);
    setContext(values.context);
  };

  const generate = () => onGenerate(buildLogisticsPrompt(
    incident.trim(),
    scope.trim(),
    timeWindow.trim(),
    context.trim(),
  ));

  return (
    <div className="logistics-page">
      <section className="logistics-intro">
        <div className="eyebrow">LOGISTICS INTELLIGENCE</div>
        <h2 className="workspace-title">Control Tower powered by Work IQ</h2>
        <p>Connect fragmented operational signals into a grounded view of disruption, ownership, decisions, and next actions.</p>
      </section>

      <section className="control-tower-setup" aria-label="Logistics control tower setup">
        <div className="scenario-mode">
          <div>
            <div className="scenario-mode-title">Live Work IQ scenario</div>
            <div className="scenario-mode-description">
              {liveScenarioEnabled
                ? "Enabled: query your authenticated Microsoft 365 context."
                : "Disabled: use fictional data and a prebuilt response for demonstration."}
            </div>
          </div>
          <Checkbox
            checked={liveScenarioEnabled}
            disabled={busy}
            onChange={(_, data) => setScenarioMode(data.checked === true)}
            label={liveScenarioEnabled ? "Enabled" : "Disabled"}
            aria-label="Enable live Work IQ logistics scenario"
          />
        </div>
        <div className="control-tower-fields">
          <Field label="Operational signal or incident" required>
            <Input value={incident} onChange={(_, data) => setIncident(data.value)} disabled={busy || disabled || !liveScenarioEnabled} />
          </Field>
          <Field label="Customer, route, site, or program">
            <Input value={scope} onChange={(_, data) => setScope(data.value)} disabled={busy || disabled || !liveScenarioEnabled} placeholder="For example, Bimbo or Monterrey DC" />
          </Field>
          <Field label="Time window">
            <Input value={timeWindow} onChange={(_, data) => setTimeWindow(data.value)} disabled={busy || disabled || !liveScenarioEnabled} placeholder="For example, last 14 days" />
          </Field>
        </div>
        <Field label="Known signal or context" hint="Optional: shipment IDs, project names, aliases, locations, or a suspected issue.">
          <Textarea
            value={context}
            onChange={(_, data) => setContext(data.value)}
            disabled={busy || disabled || !liveScenarioEnabled}
            resize="vertical"
            placeholder="Example: delayed warehouse automation equipment, customer escalation, customs hold..."
          />
        </Field>
        <div className="control-tower-actions">
          <Button icon={<ArrowSync20Regular />} onClick={onClear} disabled={busy || !result || !liveScenarioEnabled}>Clear brief</Button>
          <Button appearance="primary" icon={<Sparkle20Filled />} onClick={generate} disabled={busy || disabled || !incident.trim() || !liveScenarioEnabled}>
            {liveScenarioEnabled ? (busy ? "Building intelligence brief..." : "Build control tower brief") : "Synthetic preview loaded"}
          </Button>
        </div>
      </section>

      <section className="intelligence-questions" aria-label="Control tower intelligence questions">
        {intelligenceQuestions.map((question, index) => (
          <article className="intelligence-question" key={question.label}>
            <div className="question-index">0{index + 1}</div>
            <div className="question-icon">{question.icon}</div>
            <div><h3>{question.label}</h3><p>{question.description}</p></div>
          </article>
        ))}
      </section>

      <ResultPanel
        eyebrow="CONTROL TOWER BRIEF"
        title="Grounded logistics intelligence"
        emptyMessage="Your incident timeline, ownership map, decisions, and next actions will appear here."
        loadingLabel="Connecting logistics signals across Microsoft 365"
        loading={liveScenarioEnabled && busy}
        result={liveScenarioEnabled ? result : syntheticResult}
        error={error}
      />
    </div>
  );
}