import type { BcpListResponse } from "./bcp-types";

export async function fetchBcpMatchLists(eventId: string, matchId: string): Promise<BcpListResponse> {
  const url = `/api/bcp/match?eventId=${encodeURIComponent(eventId)}&matchId=${encodeURIComponent(matchId)}`;
  const started = performance.now();
  const res = await fetch(url);
  const elapsed = performance.now() - started;
  if (elapsed >= 30_000) {
    return { status: "error", message: "Preload exceeded guard window" };
  }
  if (!res.ok) {
    return { status: "network", message: `HTTP ${res.status}` };
  }
  return (await res.json()) as BcpListResponse;
}
