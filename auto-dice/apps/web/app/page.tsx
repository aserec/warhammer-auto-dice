import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Warhammer Auto Dice</h1>
      <p className="text-muted-foreground">
        Local two-player games, list import, and dice resolution — scaffold in progress.
      </p>
      <Button asChild>
        <Link href="/games/new">New game</Link>
      </Button>
    </main>
  );
}
