import type { ListParseResult } from "./list-parse-result";

export interface ListParserPlugin {
  id: string;
  canParse(raw: string): boolean;
  parse(raw: string): ListParseResult;
}
