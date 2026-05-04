import type { Roster } from "../game/game";

export type DiagnosticSeverity = "error" | "warn";

export interface ListDiagnostic {
  severity: DiagnosticSeverity;
  message: string;
  line?: number;
  column?: number;
}

export interface ListParseResult {
  success: boolean;
  roster: Roster | null;
  diagnostics: ListDiagnostic[];
  formatId: string;
}
