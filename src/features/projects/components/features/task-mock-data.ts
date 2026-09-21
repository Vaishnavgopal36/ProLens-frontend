export interface FeatureTask {
  id: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  assigneeName: string;
  assigneeInitials: string;
  status: "To Do" | "In Progress" | "In Review" | "Done";
}

// Local, feature-tab-owned mock task data keyed by feature name. This tab
// intentionally keeps its own independent mock dataset (mirrors how Board
// and List tabs each own theirs) rather than sharing a backend.
export const TASKS_BY_FEATURE: Record<string, FeatureTask[]> = {
  "Design System": [
    {
      id: "t-ds-1",
      title: "Migrate color tokens to OKLCH scale",
      priority: "High",
      assigneeName: "Sarah Jenkins",
      assigneeInitials: "SJ",
      status: "In Progress",
    },
    {
      id: "t-ds-2",
      title: "Publish Figma component library v2",
      priority: "Medium",
      assigneeName: "Marcus Chen",
      assigneeInitials: "MC",
      status: "In Review",
    },
    {
      id: "t-ds-3",
      title: "Audit contrast ratios for WCAG AAA",
      priority: "High",
      assigneeName: "Vaishnav Gopal",
      assigneeInitials: "VG",
      status: "To Do",
    },
    {
      id: "t-ds-4",
      title: "Ship reusable Button/Input/Select primitives",
      priority: "Low",
      assigneeName: "Sarah Jenkins",
      assigneeInitials: "SJ",
      status: "Done",
    },
  ],
  Authentication: [
    {
      id: "t-au-1",
      title: "Implement OAuth2 authorization code grant",
      priority: "High",
      assigneeName: "Marcus Chen",
      assigneeInitials: "MC",
      status: "In Progress",
    },
    {
      id: "t-au-2",
      title: "Add SSO routing guards to protected routes",
      priority: "Medium",
      assigneeName: "Alex Morgan",
      assigneeInitials: "AM",
      status: "To Do",
    },
    {
      id: "t-au-3",
      title: "Rotate and refresh JWT tokens on session renewal",
      priority: "High",
      assigneeName: "Vaishnav Gopal",
      assigneeInitials: "VG",
      status: "In Review",
    },
  ],
  Reporting: [
    {
      id: "t-rp-1",
      title: "Build unified GA4 + Mixpanel ingestion pipeline",
      priority: "Medium",
      assigneeName: "Sarah Jenkins",
      assigneeInitials: "SJ",
      status: "To Do",
    },
    {
      id: "t-rp-2",
      title: "Add GDPR consent gating to analytics events",
      priority: "High",
      assigneeName: "Alex Morgan",
      assigneeInitials: "AM",
      status: "To Do",
    },
  ],
};

export interface FeatureSubtask {
  id: string;
  title: string;
  done: boolean;
}

// Subtasks of the tasks above, keyed by task id.
export const SUBTASKS_BY_TASK: Record<string, FeatureSubtask[]> = {
  "t-ds-1": [
    { id: "s-ds-1a", title: "Inventory existing hex tokens", done: true },
    { id: "s-ds-1b", title: "Generate OKLCH scale per hue", done: true },
    { id: "s-ds-1c", title: "Replace tokens in Tailwind config", done: false },
    { id: "s-ds-1d", title: "Visual regression pass", done: false },
  ],
  "t-ds-2": [
    { id: "s-ds-2a", title: "Publish core primitives", done: true },
    { id: "s-ds-2b", title: "Document variants and states", done: true },
    { id: "s-ds-2c", title: "Design review sign-off", done: false },
  ],
  "t-ds-3": [
    { id: "s-ds-3a", title: "Audit text on surfaces", done: false },
    { id: "s-ds-3b", title: "Audit interactive states", done: false },
  ],
  "t-ds-4": [
    { id: "s-ds-4a", title: "Button", done: true },
    { id: "s-ds-4b", title: "Input", done: true },
    { id: "s-ds-4c", title: "Select", done: true },
  ],
  "t-au-1": [
    { id: "s-au-1a", title: "Register the app with the provider", done: true },
    { id: "s-au-1b", title: "Authorization redirect and PKCE", done: true },
    { id: "s-au-1c", title: "Token exchange endpoint", done: false },
    { id: "s-au-1d", title: "Error and consent-denied states", done: false },
  ],
  "t-au-2": [
    { id: "s-au-2a", title: "Route guard component", done: false },
    { id: "s-au-2b", title: "Redirect back after login", done: false },
  ],
  "t-au-3": [
    { id: "s-au-3a", title: "Refresh on 401 with a single retry", done: true },
    { id: "s-au-3b", title: "Rotate refresh token on use", done: true },
    { id: "s-au-3c", title: "Revoke on logout", done: false },
  ],
  "t-rp-1": [
    { id: "s-rp-1a", title: "Define the event schema", done: false },
    { id: "s-rp-1b", title: "GA4 collector", done: false },
    { id: "s-rp-1c", title: "Mixpanel collector", done: false },
  ],
  "t-rp-2": [
    { id: "s-rp-2a", title: "Consent banner state store", done: false },
    { id: "s-rp-2b", title: "Drop events until consent is given", done: false },
  ],
};
