export type ModifierScope = "hit" | "wound" | "save" | "fnp" | "global";

export type ModifierKind =
  | "hit_bonus"
  | "wound_bonus"
  | "save_bonus"
  | "reroll_hits_one"
  | "reroll_wounds_one"
  | "lethal_hits"
  | "devastating_wounds";

export interface Modifier {
  kind: ModifierKind;
  value?: number;
  scope: ModifierScope;
}
