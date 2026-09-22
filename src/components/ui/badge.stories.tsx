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
        "surface",
        "muted",
        "teal",
        "primary",
        "red",
        "yellow",
        "plain",
        "default",
        "secondary",
        "destructive",
        "success",
        "warning",
        "neutral",
        "outline",
      ],
    },
    size: {
      control: "select",
      options: ["default", "sm", "xs"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Surface: Story = {
  args: {
    children: "Badge",
    variant: "surface",
  },
};

export const Muted: Story = {
  args: {
    children: "Badge",
    variant: "muted",
  },
};

export const Teal: Story = {
  args: {
    children: "Badge",
    variant: "teal",
  },
};

export const Primary: Story = {
  args: {
    children: "Badge",
    variant: "primary",
  },
};

export const Red: Story = {
  args: {
    children: "Badge",
    variant: "red",
  },
};

export const Yellow: Story = {
  args: {
    children: "Badge",
    variant: "yellow",
  },
};

export const Plain: Story = {
  args: {
    children: "Badge",
    variant: "plain",
  },
};

export const BadgeGroup: Story = {
  render: () => (
    <div className="inline-flex flex-wrap gap-2">
      <Badge variant="surface">Badge</Badge>
      <Badge variant="muted">Badge</Badge>
      <Badge variant="teal">Badge</Badge>
      <Badge variant="primary">Badge</Badge>
      <Badge variant="red">Badge</Badge>
      <Badge variant="yellow">Badge</Badge>
      <Badge variant="plain">Badge</Badge>
    </div>
  ),
};
