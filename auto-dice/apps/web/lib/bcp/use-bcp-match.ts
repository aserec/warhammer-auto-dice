"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchBcpMatchLists } from "./bcp-adapter";

export function useBcpMatch(eventId: string, matchId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["bcp", "match", eventId, matchId],
    queryFn: () => fetchBcpMatchLists(eventId, matchId),
    enabled,
  });
}
