import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "secondary",
        "accent",
        "outline",
        "destructive",
        "success",
        "warning",
        "neutral",
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const PrimaryNavy: Story = {
  args: {
    children: "Admin",
    variant: "default",
  },
};

export const SecondaryTeal: Story = {
  args: {
    children: "In Progress",
    variant: "secondary",
  },
};

export const AccentGold: Story = {
  args: {
    children: "High Priority",
    variant: "accent",
  },
};

export const Critical: Story = {
  args: {
    children: "Critical",
    variant: "destructive",
  },
};

export const StatusPills: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge variant="success">Active</Badge>
      <Badge variant="warning">Pending Review</Badge>
      <Badge variant="neutral">Backlog</Badge>
      <Badge variant="destructive">Blocked</Badge>
    </div>
  ),
};
