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
