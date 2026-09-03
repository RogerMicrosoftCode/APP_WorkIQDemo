import { Avatar, Button, Tooltip } from "@fluentui/react-components";
import { SignOut20Regular } from "@fluentui/react-icons";
import { useMsal } from "@azure/msal-react";
import type { UserContext } from "../types/api";
import { apiScopes, authEnabled } from "../services/auth";
import { MicrosoftMark } from "./MicrosoftMark";

type HeaderProps = {
  context?: UserContext;
};

export function Header({ context }: HeaderProps) {
  const { instance, accounts } = useMsal();
  const account = accounts[0];

  const signIn = () => instance.loginPopup({ scopes: apiScopes });
  const signOut = () => instance.logoutPopup({ account });
  const mode = context?.mode;
  const requiresBrowserSignIn = authEnabled && mode !== "demo" && mode !== "local";

  return (
    <header className="app-header">
      <div className="flex min-w-0 items-center gap-3">
        <MicrosoftMark />
        <div className="header-divider" />
        <h1 className="truncate text-[17px] font-semibold text-[#242424]">Work IQ Demo Console</h1>
        <span className={`mode-pill mode-${mode ?? "demo"}`}>
          {(mode ?? "demo").toUpperCase()}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {requiresBrowserSignIn && !account ? (
          <Button appearance="primary" onClick={signIn}>Sign in</Button>
        ) : (
          <>
            <div className="hidden min-w-0 text-right sm:block">
              <div className="truncate text-sm font-semibold text-[#242424]">{context?.user.name ?? account?.name ?? "Loading"}</div>
              <div className="truncate text-xs text-[#616161]">{context?.user.email ?? account?.username}</div>
              <div className="truncate text-[11px] text-[#8a8886]">{context?.user.tenantName ?? "Microsoft 365"}</div>
            </div>
            <Avatar name={context?.user.name ?? account?.name ?? "User"} color="colorful" size={36} />
            {requiresBrowserSignIn && account && (
              <Tooltip content="Sign out" relationship="label">
                <Button appearance="subtle" icon={<SignOut20Regular />} onClick={signOut} aria-label="Sign out" />
              </Tooltip>
            )}
          </>
        )}
      </div>
    </header>
  );
}
