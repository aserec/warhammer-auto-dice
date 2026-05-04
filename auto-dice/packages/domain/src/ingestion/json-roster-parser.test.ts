import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { jsonRosterParser } from "./strategies/json-roster-parser";

const here = path.dirname(fileURLToPath(import.meta.url));

describe("jsonRosterParser", () => {
  it("parses votann golden fixture with units and weapons", () => {
    const raw = readFileSync(path.join(here, "__fixtures__", "example-votann-list.json"), "utf8");
    expect(jsonRosterParser.canParse(raw)).toBe(true);
    const res = jsonRosterParser.parse(raw);
    expect(res.success).toBe(true);
    expect(res.roster?.units.length).toBeGreaterThan(0);
    const withWeapons = res.roster?.units.filter((u) => u.weapons.length > 0) ?? [];
    expect(withWeapons.length).toBeGreaterThan(0);
  });

  it("parses tzeentch golden fixture", () => {
    const raw = readFileSync(path.join(here, "__fixtures__", "example-tzeentch-list.json"), "utf8");
    const res = jsonRosterParser.parse(raw);
    expect(res.success).toBe(true);
    expect(res.roster?.units.length).toBeGreaterThan(0);
  });

  it("rejects malformed JSON", () => {
    const res = jsonRosterParser.parse("{ not json");
    expect(res.success).toBe(false);
    expect(res.diagnostics.some((d) => d.severity === "error")).toBe(true);
  });

  it("rejects document without roster", () => {
    const res = jsonRosterParser.parse('{"foo":1}');
    expect(res.success).toBe(false);
  });
});
