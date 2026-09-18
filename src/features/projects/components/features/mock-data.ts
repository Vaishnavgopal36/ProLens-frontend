export interface FeatureStreamAvatar {
  initials: string;
  colorClass: string;
}

export interface FeatureStream {
  id: string;
  name: string;
  status: "ACTIVE" | "COMPLETED ";
  progress: number;
  description: string;
  tasksCount: number;
  tasksCompleted: number;
  avatars: FeatureStreamAvatar[];
}

export const MOCK_FEATURE_STREAMS: FeatureStream[] = [
  {
    id: "f-101",
    name: "Design System",
    status: "ACTIVE",
    progress: 75,
    description:
      "Complete WCAG AAA design token migration, Figma specs, and reusable components.",
    tasksCount: 8,
    tasksCompleted: 6,
    avatars: [
      { initials: "SJ", colorClass: "bg-navy-800" },
      { initials: "JD", colorClass: "bg-teal-600" },
    ],
  },
  {
    id: "f-102",
    name: "Authentication",
    status: "ACTIVE",
    progress: 52,
    description:
      "OAuth2 authorization code grant, SSO routing guards, and JWT token rotation.",
    tasksCount: 5,
    tasksCompleted: 3,
    avatars: [
      { initials: "JD", colorClass: "bg-teal-600" },
      { initials: "MR", colorClass: "bg-navy-800" },
    ],
  },
  {
    id: "f-103",
    name: "Reporting",
    status: "ACTIVE",
    progress: 25,
    description:
      "Mixpanel and GA4 unified ingestion pipeline with GDPR consent handling.",
    tasksCount: 4,
    tasksCompleted: 1,
    avatars: [{ initials: "SJ", colorClass: "bg-navy-800" }],
  },
];
