import type { Meta, StoryObj } from "@storybook/react-vite";
import { toast } from "sonner";
import { Mail, Plus, Settings, Trash2, User } from "lucide-react";

import { Button } from "./button";
import { Badge } from "./badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import { Input } from "./input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Skeleton } from "./skeleton";
import { Toaster } from "./sonner";
import { Icon } from "./icon";

const meta: Meta = {
  title: "Overview/Component Gallery",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Every primitive in components/ui rendered together, in both themes, so brand/consistency decisions can be made by looking at the whole set instead of one component at a time. Use the toolbar's theme switcher to compare light/dark.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      <div className="flex flex-wrap items-start gap-4">{children}</div>
    </section>
  );
}

function Swatch({ label, className }: { label: string; className: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={`h-14 w-24 rounded-lg border border-border-subtle ${className}`}
      />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export const Gallery: Story = {
  render: () => (
    <div className="min-h-screen bg-canvas-bg px-6 py-8 sm:px-10">
      <Toaster />
      <div className="mx-auto flex max-w-5xl flex-col gap-12">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">
            ProLens Component Gallery
          </h1>
          <p className="text-sm text-muted-foreground">
            Colors should read roughly 80% navy / 15% teal / 5% gold across this
            page. Toggle the Storybook theme toolbar for dark mode.
          </p>
        </header>

        <Section title="Palette (80 / 15 / 5)">
          <Swatch label="navy-500" className="bg-navy-500" />
          <Swatch label="teal-500" className="bg-teal-500" />
          <Swatch label="gold-500" className="bg-gold-500" />
          <Swatch label="canvas-surface" className="bg-canvas-surface" />
          <Swatch label="canvas-bg" className="bg-canvas-bg" />
        </Section>

        <Section title="Buttons">
          <Button variant="default">Primary (navy)</Button>
          <Button variant="secondary">Secondary (teal outline)</Button>
          <Button variant="accent">Accent (gold — use once per view)</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="default" size="icon" aria-label="Add">
            <Icon icon={Plus} />
          </Button>
        </Section>

        <Section title="Badges">
          <Badge variant="default">Admin</Badge>
          <Badge variant="secondary">In Progress</Badge>
          <Badge variant="accent">High Priority</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="neutral">Backlog</Badge>
          <Badge variant="success">Active</Badge>
          <Badge variant="warning">Pending Review</Badge>
          <Badge variant="destructive">Blocked</Badge>
        </Section>

        <Section title="Card">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Project Health</CardTitle>
              <CardDescription>Last synced 4 minutes ago</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-foreground">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Open tasks</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Blocked</span>
                <span className="font-medium text-destructive">2</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" size="sm">
                View details
              </Button>
            </CardFooter>
          </Card>
        </Section>

        <Section title="Form controls">
          <div className="w-64 space-y-2">
            <Input placeholder="Search projects..." />
          </div>
          <div className="w-56">
            <Select defaultValue="open">
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Tabs defaultValue="overview" className="w-full max-w-md">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent
              value="overview"
              className="text-sm text-muted-foreground"
            >
              Overview panel content.
            </TabsContent>
            <TabsContent
              value="activity"
              className="text-sm text-muted-foreground"
            >
              Activity panel content.
            </TabsContent>
            <TabsContent
              value="settings"
              className="text-sm text-muted-foreground"
            >
              Settings panel content.
            </TabsContent>
          </Tabs>
        </Section>

        <Section title="Table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Onboarding flow</TableCell>
                <TableCell>
                  <Badge variant="success">Active</Badge>
                </TableCell>
                <TableCell>Vaishnav</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>SSO rollout</TableCell>
                <TableCell>
                  <Badge variant="warning">Pending Review</Badge>
                </TableCell>
                <TableCell>Backend team</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Section>

        <Section title="Overlays">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Open dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete project?</DialogTitle>
                <DialogDescription>
                  This action can&apos;t be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button variant="destructive">
                  <Icon icon={Trash2} size={16} />
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Icon icon={User} size={16} />
                Account
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Icon icon={Settings} size={16} />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icon icon={Mail} size={16} />
                Invite teammate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Section>

        <Section title="Feedback">
          <Button
            variant="outline"
            onClick={() => toast.success("Saved changes")}
          >
            Trigger success toast
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.warning("Review needed")}
          >
            Trigger warning toast
          </Button>
          <Button variant="outline" onClick={() => toast.error("Sync failed")}>
            Trigger error toast
          </Button>
          <div className="flex w-64 flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </Section>
      </div>
    </div>
  ),
};
