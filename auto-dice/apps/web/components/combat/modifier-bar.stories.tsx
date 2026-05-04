import type { Meta, StoryObj } from "@storybook/react";
import { useAttackWizardStore } from "@/lib/stores/attack-wizard-store";
import { ModifierBar } from "./modifier-bar";

const meta: Meta<typeof ModifierBar> = {
  title: "Combat/ModifierBar",
  component: ModifierBar,
  decorators: [
    (Story) => {
      useAttackWizardStore.setState({ modifiers: [] });
      return <Story />;
    },
  ],
};

export default meta;

type Story = StoryObj<typeof ModifierBar>;

export const Default: Story = {
  render: () => (
    <ModifierBar active={useAttackWizardStore.getState().modifiers} onToggle={useAttackWizardStore.getState().toggleModifier} />
  ),
};
