import type { Modifier } from "./modifier-types";

const ORDER: Modifier["kind"][] = [
  "hit_bonus",
  "reroll_hits_one",
  "wound_bonus",
  "reroll_wounds_one",
  "lethal_hits",
  "devastating_wounds",
  "save_bonus",
];

export function normalizeModifierOrder(modifiers: Modifier[]): Modifier[] {
  return [...modifiers].sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind));
}

export function detectModifierConflicts(modifiers: Modifier[]): string[] {
  const errors: string[] = [];
  const lethal = modifiers.filter((m) => m.kind === "lethal_hits");
  if (lethal.length > 1) errors.push("Only one lethal hits selection is allowed");
  const dev = modifiers.filter((m) => m.kind === "devastating_wounds");
  if (dev.length > 1) errors.push("Only one devastating wounds selection is allowed");
  if (lethal.length && dev.length) errors.push("Lethal hits and devastating wounds cannot be combined in MVP");
  return errors;
}
