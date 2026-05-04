export interface DieResult {
  face: number;
  unmodified: number;
  effective: number;
  tags: string[];
}

export interface StageResult {
  id: "hits" | "wounds" | "saves" | "fnp";
  skipped?: boolean;
  reason?: string;
  dice: DieResult[];
  summary: Record<string, number>;
}
