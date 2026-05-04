"use client";

import { jsonRosterParser, type ListDiagnostic, type Roster } from "@whad/domain";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function PasteImportDialog({
  onImported,
}: {
  onImported: (roster: Roster, raw: string, diagnostics: ListDiagnostic[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const handleParse = () => {
    const res = jsonRosterParser.parse(text);
    if (!res.success || !res.roster) {
      setErrors(res.diagnostics.filter((d) => d.severity === "error").map((d) => d.message));
      return;
    }
    setErrors([]);
    onImported(res.roster, text, res.diagnostics);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          Import JSON roster
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Paste roster JSON</DialogTitle>
        </DialogHeader>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder='{"roster":{...}}' />
        {errors.length > 0 && (
          <ul className="text-sm text-destructive">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
        <Button type="button" onClick={handleParse}>
          Parse
        </Button>
      </DialogContent>
    </Dialog>
  );
}
