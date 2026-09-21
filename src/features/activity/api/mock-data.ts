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
import type { ActivityItem, ActivityMetric } from "@/types/activity";

// Helper: Format Date object to "YYYY-MM-DD"
function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Compute dynamic reference dates based on today's calendar date
const now = new Date();
const todayISO = toISODate(now);

const tomorrowDate = new Date(now);
tomorrowDate.setDate(now.getDate() + 1);
const tomorrowISO = toISODate(tomorrowDate);

const dayAfterDate = new Date(now);
dayAfterDate.setDate(now.getDate() + 2);
const dayAfterISO = toISODate(dayAfterDate);

const laterDate1 = new Date(now);
laterDate1.setDate(now.getDate() + 4);
const laterISO1 = toISODate(laterDate1);

const laterDate2 = new Date(now);
laterDate2.setDate(now.getDate() + 6);
const laterISO2 = toISODate(laterDate2);

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

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  // ------------------- TODAY -------------------
  {
    id: "act-1",
    category: "non-project",
    categoryLabel: "External / Professional",
    title: "Toastmasters Leadership & Public Speaking Session",
    description:
      "Weekly lunchtime speech evaluation and executive impromptu presentation workshop.",
    date: todayISO,
    timeWindow: "12:30 PM – 1:30 PM",
    durationHours: "1.0 hr",
    statusBadge: { label: "Completed", variant: "success" },
    loggedBy: "Alex Morgan",
    pinColor: "navy",
  },
  {
    id: "act-2",
    category: "project",
    categoryLabel: "Project Task Completed",
    projectName: "Apex Analytics Platform",
    title: "PostgreSQL connection pooling configuration deployed",
    description:
      "Merged PR #342 and verified zero-downtime failover with infra routing team.",
    date: todayISO,
    timeWindow: "10:15 AM – 12:45 PM",
    durationHours: "2.5 hrs",
    statusBadge: { label: "Completed", variant: "success" },
    loggedBy: "Elena Rostova",
    pinColor: "teal",
  },
  {
    id: "act-3",
    category: "project",
    categoryLabel: "Client Meeting",
    projectName: "Apex Analytics Platform",
    title: "Urgent telemetry sync with FinTech Partner lead",
    description:
      "Addressed webhook retry rate-limiting issues raised during high-volume APAC morning peak.",
    date: todayISO,
    timeWindow: "9:00 AM – 9:45 AM",
    durationHours: "45 mins",
    statusBadge: { label: "Scheduled", variant: "neutral" },
    loggedBy: "FinTech Partner (APAC Ops)",
    pinColor: "gold",
  },

  // ------------------- TOMORROW -------------------
  {
    id: "act-4",
    category: "project",
    categoryLabel: "Project Task Started",
    projectName: "Nova Mobile Dev",
    title: "Biometric auth SDK wrapper sprint kickoff",
    description:
      "Outlined iOS & Android baseline interface contracts and sprint deliverable milestones.",
    date: tomorrowISO,
    timeWindow: "3:30 PM – 5:00 PM",
    durationHours: "1.5 hrs",
    statusBadge: { label: "In Progress", variant: "secondary" },
    loggedBy: "Marcus Chen",
    pinColor: "teal",
  },
  {
    id: "act-5",
    category: "non-project",
    categoryLabel: "Training / Workshop",
    title: "AWS Certified Solutions Architect Deep-Dive Module 4",
    description:
      "Attended corporate sponsored continuous learning workshop on multi-region DynamoDB replication.",
    date: tomorrowISO,
    timeWindow: "1:00 PM – 2:30 PM",
    durationHours: "1.5 hrs",
    statusBadge: { label: "Scheduled", variant: "neutral" },
    loggedBy: "Elena Rostova",
    pinColor: "navy",
  },

  // ------------------- DAY AFTER TOMORROW -------------------
  {
    id: "act-6",
    category: "non-project",
    categoryLabel: "Team Meeting",
    title: "Quarterly People & Culture Cross-Team Retrospective",
    description:
      "All-hands engineering management sync on onboarding processes and Q4 career coaching goals.",
    date: dayAfterISO,
    timeWindow: "10:00 AM – 11:00 AM",
    durationHours: "1.0 hr",
    statusBadge: { label: "Scheduled", variant: "neutral" },
    loggedBy: "Alex Morgan",
    pinColor: "navy",
  },
  {
    id: "act-7",
    category: "project",
    categoryLabel: "Release Sprint",
    projectName: "Apex Analytics Platform",
    title: "Staging Pipeline Verification & Sign-off",
    description:
      "Regression test suite run and integration testing before main branch merge.",
    date: dayAfterISO,
    timeWindow: "3:00 PM – 4:30 PM",
    durationHours: "1.5 hrs",
    statusBadge: { label: "Scheduled", variant: "neutral" },
    loggedBy: "David Kim",
    pinColor: "teal",
  },

  // ------------------- UPCOMING (4+ DAYS LATER) -------------------
  {
    id: "act-8",
    category: "non-project",
    categoryLabel: "Presentation / Event",
    title: "Executive Keynote: Product Delivery Architecture 2026",
    description:
      "Internal company event presentation given to senior leadership regarding modular micro-frontends.",
    date: laterISO1,
    timeWindow: "2:00 PM – 3:15 PM",
    durationHours: "1h 15m",
    statusBadge: { label: "Scheduled", variant: "neutral" },
    loggedBy: "Sarah Jenkins",
    pinColor: "teal",
  },
  {
    id: "act-9",
    category: "project",
    categoryLabel: "Client Meeting",
    projectName: "Nova Mobile Dev",
    title: "Nova Mobile Client Feedback & Milestone Sign-off",
    description:
      "Presented weekly sprint demo to client stakeholders; approved beta build distribution.",
    date: laterISO2,
    timeWindow: "11:00 AM – 12:00 PM",
    durationHours: "1.0 hr",
    statusBadge: { label: "Scheduled", variant: "neutral" },
    loggedBy: "Alex Morgan",
    pinColor: "teal",
  },
];
