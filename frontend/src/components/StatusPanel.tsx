import {
  CheckmarkCircle20Filled,
  Money20Regular,
  Key20Regular,
  Person20Regular,
  ReceiptMoney20Regular,
  ShieldCheckmark20Regular,
} from "@fluentui/react-icons";
import type { ReactNode } from "react";
import type { UserContext } from "../types/api";

type StatusPanelProps = {
  context?: UserContext;
  loading: boolean;
};

function StatusRow({ icon, label, value, accent }: { icon: ReactNode; label: string; value: string; accent?: boolean }) {
  return (
    <div className="status-row">
      <div className={`status-icon ${accent ? "status-icon-accent" : ""}`}>{icon}</div>
      <div className="min-w-0">
        <div className="status-label">{label}</div>
        <div className="status-value">{value}</div>
      </div>
    </div>
  );
}

export function StatusPanel({ context, loading }: StatusPanelProps) {
  const status = context?.status;
  const pending = loading ? "Checking..." : "Unavailable";

  return (
    <aside className="status-panel" aria-label="Work IQ environment status">
      <div className="status-heading">
        <div>
          <div className="eyebrow">ENVIRONMENT</div>
          <h2>Connection status</h2>
        </div>
        <span className="connection-dot" title="API connected" />
      </div>

      <div className="status-list">
        <StatusRow icon={<Key20Regular />} label="Authentication status" value={status?.authentication ?? pending} accent />
        <StatusRow icon={<ShieldCheckmark20Regular />} label="License information" value={status?.license ?? pending} />
        <StatusRow icon={<CheckmarkCircle20Filled />} label="Work IQ access" value={status?.workIqAccess ?? pending} />
        <StatusRow icon={<ReceiptMoney20Regular />} label="Billing method" value={status?.billingMethod ?? pending} />
        <StatusRow icon={<Money20Regular />} label="Copilot Credits" value={status?.copilotCredits ?? pending} />
        <StatusRow icon={<Person20Regular />} label="User context" value={status?.userContext ?? pending} />
      </div>

      <div className="tenant-block">
        <div className="eyebrow">TENANT</div>
        <div className="mt-2 font-semibold text-[#242424]">{context?.user.tenantName ?? pending}</div>
        <div className="mt-1 truncate text-xs text-[#616161]">{context?.user.tenantId ?? ""}</div>
      </div>
    </aside>
  );
}
