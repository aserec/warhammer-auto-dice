import type { Meta, StoryObj } from "@storybook/react";
import type { StageResult } from "@whad/domain";
import { DiceStageBreakdown } from "./dice-stage-breakdown";

const stages: StageResult[] = [
  {
    id: "hits",
    dice: [
      { face: 4, unmodified: 4, effective: 4, tags: ["hit"] },
      { face: 1, unmodified: 1, effective: 1, tags: ["auto_fail", "miss"] },
    ],
    summary: { hits: 1 },
  },
  {
    id: "wounds",
    dice: [{ face: 5, unmodified: 5, effective: 5, tags: ["wound"] }],
    summary: { wounds: 1 },
  },
  { id: "saves", skipped: false, dice: [], summary: {} },
  { id: "fnp", skipped: true, reason: "no fnp", dice: [], summary: {} },
];

const meta: Meta<typeof DiceStageBreakdown> = {
  title: "Combat/DiceStageBreakdown",
  component: DiceStageBreakdown,
};

export default meta;

type Story = StoryObj<typeof DiceStageBreakdown>;

export const Sample: Story = {
  args: { stages },
};
