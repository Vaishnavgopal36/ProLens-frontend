import type { Meta, StoryObj } from "@storybook/react-vite";
import { Plus } from "lucide-react";
import { Button } from "./button";
import { Icon } from "./icon";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "secondary",
        "accent",
        "outline",
        "ghost",
        "link",
        "destructive",
      ],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const PrimaryNavy: Story = {
  args: {
    children: "Primary Action",
    variant: "default",
  },
};

export const SecondaryTeal: Story = {
  args: {
    children: "Secondary Action",
    variant: "secondary",
  },
};

export const AccentGold: Story = {
  args: {
    children: "Accent Action",
    variant: "accent",
  },
};

export const WithIcon: Story = {
  render: () => (
    <Button variant="default">
      <Icon icon={Plus} />
      <span>Create Task</span>
    </Button>
  ),
};
