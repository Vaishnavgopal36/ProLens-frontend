import {
  History,
  Layers,
  GraduationCap,
  ClockAlert,
  CheckCircle2,
  Code2,
  Presentation,
  Award,
} from "lucide-react";
import type { ActivityDateGroup, ActivityMetric } from "@/types/activity";

export const ACTIVITY_METRICS: ActivityMetric[] = [
  {
    id: "m-1",
    label: "Total / Month",
    value: 38,
    unit: "activities",
    subtext: "22 Project • 16 Non-Project",
    icon: History,
    progressPercent: 78,
  },
  {
    id: "m-2",
    label: "Project Workstreams",
    value: 24,
    unit: "items",
    subtext: "Apex Analytics & Nova Mobile",
    icon: Layers,
    progressPercent: 63,
  },
  {
    id: "m-3",
    label: "Professional & External",
    value: 14,
    unit: "events",
    subtext: "Trainings, Toastmasters, Client",
    icon: GraduationCap,
    progressPercent: 37,
  },
  {
    id: "m-4",
    label: "Pending Verification",
    value: 2,
    unit: "items",
    subtext: "Requires manager note",
    icon: ClockAlert,
    highlight: true,
  },
];

export const MOCK_ACTIVITY_GROUPS: ActivityDateGroup[] = [
  {
    groupTitle: "Today",
    dateLabel: "Sep 18, 2026",
    items: [
      {
        id: "act-1",
        category: "non-project",
        categoryLabel: "External / Professional",
        title: "Toastmasters Leadership & Public Speaking Session",
        description:
          "Weekly lunchtime speech evaluation and executive impromptu presentation workshop.",
        timestamp: "Today, 12:30 PM - 1:30 PM",
        durationHours: "1.0 hr",
        statusBadge: { label: "Completed", variant: "success" },
        loggedBy: "Alex Morgan",
        pinColor: "navy",
        metaNote: { icon: CheckCircle2, text: "Self-verified" },
      },
      {
        id: "act-2",
        category: "project",
        categoryLabel: "Project Task Completed",
        projectName: "Apex Analytics Platform",
        title: "PostgreSQL connection pooling configuration deployed",
        description:
          "Merged PR #342 and verified zero-downtime failover with infra routing team.",
        timestamp: "Today, 10:15 AM",
        durationHours: "2.5 hrs",
        statusBadge: { label: "Completed", variant: "success" },
        assignees: "Elena Rostova, Alex Morgan",
        pinColor: "teal",
        metaNote: { icon: Code2, text: "commit 7d9a1f" },
      },
      {
        id: "act-3",
        category: "project",
        categoryLabel: "Unexpected Client Meeting",
        projectName: "Apex Analytics Platform",
        title: "Urgent telemetry sync with FinTech Partner lead",
        description:
          "Addressed webhook retry rate-limiting issues raised during high-volume APAC morning peak.",
        timestamp: "Today, 9:00 AM - 9:45 AM",
        durationHours: "0.75 hr",
        statusBadge: { label: "Resolved / Logged", variant: "secondary" },
        loggedBy: "FinTech Partner (APAC Ops)",
        pinColor: "gold",
      },
    ],
  },
  {
    groupTitle: "Yesterday",
    dateLabel: "Sep 17, 2026",
    items: [
      {
        id: "act-4",
        category: "project",
        categoryLabel: "Project Task Started",
        projectName: "Nova Mobile Dev",
        title: "Biometric auth SDK wrapper sprint kickoff",
        description:
          "Outlined iOS & Android baseline interface contracts and sprint deliverable milestones.",
        timestamp: "Yesterday, 3:30 PM",
        durationHours: "1.5 hrs",
        statusBadge: { label: "In Progress", variant: "secondary" },
        assignees: "Marcus Chen, Alex Morgan",
        pinColor: "teal",
      },
      {
        id: "act-5",
        category: "non-project",
        categoryLabel: "Training / Workshop",
        title: "AWS Certified Solutions Architect Deep-Dive Module 4",
        description:
          "Attended corporate sponsored continuous learning workshop on multi-region DynamoDB replication.",
        timestamp: "Yesterday, 1:00 PM - 2:30 PM",
        durationHours: "1.5 hrs",
        statusBadge: { label: "Attended", variant: "success" },
        pinColor: "navy",
        metaNote: { icon: Award, text: "Certification Track (Q3 Goal)" },
      },
      {
        id: "act-6",
        category: "non-project",
        categoryLabel: "Team Meeting",
        title: "Quarterly People & Culture Cross-Team Retrospective",
        description:
          "All-hands engineering management sync on onboarding processes and Q4 career coaching goals.",
        timestamp: "Yesterday, 10:00 AM - 11:00 AM",
        durationHours: "1.0 hr",
        statusBadge: { label: "Completed", variant: "success" },
        loggedBy: "Engineering Leadership Group",
        pinColor: "navy",
      },
    ],
  },
  {
    groupTitle: "Earlier This Week",
    dateLabel: "Sep 15 - 16, 2026",
    items: [
      {
        id: "act-7",
        category: "non-project",
        categoryLabel: "Presentation / Event",
        title: "Executive Keynote: Product Delivery Architecture 2026",
        description:
          "Internal company event presentation given to senior leadership regarding modular micro-frontends.",
        timestamp: "Sep 16, 2:00 PM - 3:15 PM",
        durationHours: "1.25 hrs",
        statusBadge: { label: "Completed", variant: "success" },
        pinColor: "teal",
        metaNote: {
          icon: Presentation,
          text: "Deck archived in Knowledge Base",
        },
      },
      {
        id: "act-8",
        category: "project",
        categoryLabel: "Client Meeting",
        projectName: "Nova Mobile Dev",
        title: "Nova Mobile Client Feedback & Milestone Sign-off",
        description:
          "Presented weekly sprint demo to client stakeholders; approved beta build distribution.",
        timestamp: "Sep 15, 11:00 AM - 12:00 PM",
        durationHours: "1.0 hr",
        statusBadge: { label: "Approved", variant: "success" },
        pinColor: "secondary",
        metaNote: { icon: CheckCircle2, text: "Milestone M2 Approved" },
      },
    ],
  },
];
