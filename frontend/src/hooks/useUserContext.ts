import { useQuery } from "@tanstack/react-query";
import { useMsal } from "@azure/msal-react";
import { getUserContext } from "../services/api";

export function useUserContext() {
  const { accounts } = useMsal();
  const account = accounts[0];

  return useQuery({
    queryKey: ["user-context", account?.homeAccountId ?? "demo"],
    queryFn: () => getUserContext(account),
    staleTime: 60_000,
    retry: 1,
  });
}
