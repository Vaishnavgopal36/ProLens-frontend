export type FeatureTimeStatus = "ACTIVE" | "COMPLETED";

export interface TimeTaskEntry {
  id: string;
  code: string;
  title: string;
  assigneeName: string;
  assigneeInitials: string;
  hoursLogged: number;
  hoursEstimated: number;
}

export interface TimeFeatureGroup {
  id: string;
  name: string;
  status: FeatureTimeStatus;
  tasks: TimeTaskEntry[];
}

export const MOCK_TIME_FEATURES: TimeFeatureGroup[] = [
  {
    id: "ts-1",
    status: "ACTIVE",
    name: "Design System & Tokens",
    tasks: [
      {
        id: "t-12",
        code: "PROL-12",
        title: "UI Design & Prototyping",
        assigneeName: "Sarah Jenkins",
        assigneeInitials: "SJ",
        hoursLogged: 24,
        hoursEstimated: 32,
      },
      {
        id: "t-04",
        code: "PROL-04",
        title: "Color Token System",
        assigneeName: "John Doe",
        assigneeInitials: "JD",
        hoursLogged: 10.5,
        hoursEstimated: 16,
      },
    ],
  },
  {
    id: "ts-2",
    status: "COMPLETED",
    name: "Information Architecture & Navigation",
    tasks: [
      {
        id: "t-01",
        code: "PROL-01",
        title: "IA Wireframes",
        assigneeName: "Sarah Jenkins",
        assigneeInitials: "SJ",
        hoursLogged: 12,
        hoursEstimated: 12,
      },
      {
        id: "t-02",
        code: "PROL-02",
        title: "User Flow Validation",
        assigneeName: "Mike Ross",
        assigneeInitials: "MR",
        hoursLogged: 6,
        hoursEstimated: 8,
      },
    ],
  },
  {
    id: "ts-3",
    status: "ACTIVE",
    name: "Reporting & Analytics Views",
    tasks: [
      {
        id: "t-24",
        code: "PROL-24",
        title: "Telemetry UI Specs",
        assigneeName: "Sarah Jenkins",
        assigneeInitials: "SJ",
        hoursLogged: 6,
        hoursEstimated: 14,
      },
      {
        id: "t-25",
        code: "PROL-25",
        title: "Dashboard Polish",
        assigneeName: "Mike Ross",
        assigneeInitials: "MR",
        hoursLogged: 3.5,
        hoursEstimated: 10,
      },
    ],
  },
];
