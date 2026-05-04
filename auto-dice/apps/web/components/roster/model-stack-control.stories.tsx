import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ModelStackControl } from "./model-stack-control";

function Stateful() {
  const [c, setC] = useState(3);
  return <ModelStackControl label="Models" count={c} onChange={setC} />;
}

const meta: Meta<typeof ModelStackControl> = {
  title: "Roster/ModelStackControl",
  component: ModelStackControl,
};

export default meta;

type Story = StoryObj<typeof ModelStackControl>;

export const Interactive: Story = {
  render: () => <Stateful />,
};
