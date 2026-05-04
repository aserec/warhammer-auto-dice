import path from "node:path";
import { fileURLToPath } from "node:url";

const e2eDir = path.dirname(fileURLToPath(import.meta.url));

export function goldenRosterPath(name: "votann" | "tzeentch" = "votann"): string {
  const file = name === "votann" ? "example-votann-list.json" : "example-tzeentch-list.json";
  return path.join(e2eDir, "../../../packages/domain/src/ingestion/__fixtures__", file);
}
