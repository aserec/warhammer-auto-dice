import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchBcpMatchLists } from "./bcp-adapter";

describe("bcp-adapter", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("resolves mocked success quickly (SC-005 guard)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ status: "ok", lists: [{ id: "1", name: "A" }] }),
      })) as unknown as typeof fetch,
    );
    const t0 = performance.now();
    const res = await fetchBcpMatchLists("e1", "m1");
    const dt = performance.now() - t0;
    expect(dt).toBeLessThan(30_000);
    expect(res).toMatchObject({ status: "ok" });
  });

  it("maps network failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, status: 500 })) as unknown as typeof fetch,
    );
    const res = await fetchBcpMatchLists("e", "m");
    expect(res.status).toBe("network");
  });
});
