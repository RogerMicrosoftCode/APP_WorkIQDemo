import { useMutation } from "@tanstack/react-query";
import { useMsal } from "@azure/msal-react";
import { Tab, TabList, type SelectTabData, type SelectTabEvent } from "@fluentui/react-components";
import { useState } from "react";
import { Header } from "../components/Header";
import { PromptComposer } from "../components/PromptComposer";
import { ResultPanel } from "../components/ResultPanel";
import { StatusPanel } from "../components/StatusPanel";
import { useUserContext } from "../hooks/useUserContext";
import { askQuestion } from "../services/api";
import { authEnabled } from "../services/auth";
import { HrConnectPage } from "./HrConnectPage";
import { LogisticsIntelligencePage } from "./LogisticsIntelligencePage";
import { BusinessValuePage } from "./BusinessValuePage";

type WorkspaceTab = "work-iq" | "hr-connect" | "logistics" | "business-value";

export function ConsolePage() {
  const { accounts } = useMsal();
  const account = accounts[0];
  const contextQuery = useUserContext();
  const [conversationId, setConversationId] = useState<string>();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("work-iq");

  const askMutation = useMutation({
    mutationFn: (question: string) => askQuestion({
      question,
      conversationId,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }, account),
    onSuccess: (result) => setConversationId(result.conversationId),
  });

  const clear = () => {
    setConversationId(undefined);
    askMutation.reset();
  };

  const signedOut = authEnabled && contextQuery.data?.mode === "remote" && !account;
  const selectTab = (_event: SelectTabEvent, data: SelectTabData) => {
    setActiveTab(data.value as WorkspaceTab);
    clear();
  };

  return (
    <div className="app-frame">
      <Header context={contextQuery.data} />
      <nav className="workspace-tabs" aria-label="Application sections">
        <TabList selectedValue={activeTab} onTabSelect={selectTab} size="large">
          <Tab value="work-iq">Work IQ Console</Tab>
          <Tab value="hr-connect">HR Connect</Tab>
          <Tab value="logistics">Logistics Intelligence</Tab>
          <Tab value="business-value">Business Value</Tab>
        </TabList>
      </nav>
      <main className="app-main">
        <div className="workspace">
          {activeTab === "work-iq" ? (
            <>
              <PromptComposer busy={askMutation.isPending} disabled={signedOut} onAsk={(question) => askMutation.mutate(question)} onClear={clear} />
              {signedOut && <p className="signin-note">Sign in with your Microsoft 365 account to ask Work IQ.</p>}
              <ResultPanel loading={askMutation.isPending} result={askMutation.data} error={askMutation.error instanceof Error ? askMutation.error.message : undefined} />
            </>
          ) : activeTab === "hr-connect" ? (
            <HrConnectPage
              busy={askMutation.isPending}
              disabled={signedOut}
              onGenerate={(prompt) => askMutation.mutate(prompt)}
              onClear={clear}
              result={askMutation.data}
              error={askMutation.error instanceof Error ? askMutation.error.message : undefined}
            />
          ) : activeTab === "logistics" ? (
            <LogisticsIntelligencePage
              busy={askMutation.isPending}
              disabled={signedOut}
              onGenerate={(prompt) => askMutation.mutate(prompt)}
              onClear={clear}
              result={askMutation.data}
              error={askMutation.error instanceof Error ? askMutation.error.message : undefined}
            />
          ) : (
            <BusinessValuePage
              disabled={signedOut}
              onAsk={(question) => askQuestion({
                question,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              }, account)}
            />
          )}
        </div>
        <StatusPanel context={contextQuery.data} loading={contextQuery.isLoading} />
      </main>
    </div>
  );
}
