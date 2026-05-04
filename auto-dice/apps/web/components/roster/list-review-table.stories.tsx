import type { Meta, StoryObj } from "@storybook/react";
import type { Roster } from "@whad/domain";
import { ListReviewTable } from "./list-review-table";

const roster: Roster = {
  source: { kind: "json", importedAt: new Date().toISOString(), formatId: "test" },
  rawPayload: "{}",
  rawText: "",
  units: [
    {
      id: "u1",
      name: "Intercessors",
      modelRows: [{ kind: "stack", profileId: "p1", equipmentSignature: "", count: 5, weaponLoadoutIds: ["w1"] }],
      weapons: [
        { id: "w1", name: "Bolt rifle", type: "ranged", attacks: "2", skill: "3+", strength: "4", ap: "-1", damage: "1" },
      ],
    },
  ],
};

const meta: Meta<typeof ListReviewTable> = {
  title: "Roster/ListReviewTable",
  component: ListReviewTable,
};

export default meta;

type Story = StoryObj<typeof ListReviewTable>;

export const Default: Story = {
  args: { roster },
};
