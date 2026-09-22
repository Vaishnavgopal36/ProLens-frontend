import type { ActivityCardItem } from "@/types/activity";

export const MOCK_ACTIVITY_ITEMS: ActivityCardItem[] = [
  // -------------------------------------------------------------
  // 1. NON-PROJECT: POSH Compliance & Workplace Sensitivity Training
  // -------------------------------------------------------------
  {
    id: "act-1",
    type: "non-project",
    title: "POSH Compliance Training",
    streamName: "Compliance & HR",
    referenceCode: "OPS-POSH-2026-Q3",
    date: "Sep 22, 2026",
    scheduledTime: "10:00 AM – 11:30 AM",
    description:
      "Mandatory annual Prevention of Sexual Harassment (POSH) certification session covering legal frameworks, internal complaints committee (ICC) protocols, workplace harassment redressal, and case study assessments.",
    duration: "1h 30m",
    loggedHours: "1h 30m",
    tasksCount: 4,
    scope: "Compliance",
    taskTag: "Mandatory HR",
    priority: "High",
    assignedLead: {
      name: "Lakshitha",
      initials: "LK",
      role: "Software Engineer",
    },
    members: ["LK", "SJ", "AM"],
    tasks: [
      {
        id: "task-posh-1",
        title: "Legal Framework & Policy Overview",
        duration: "30m",
        scope:
          "Review statutory legal definitions, behavioral guidelines, and organization redressal escalation paths.",
        completed: true,
        subtasks: [
          {
            id: "st-p1",
            title: "Review employee code of conduct addendum",
            completed: true,
          },
          {
            id: "st-p2",
            title: "Review ICC committee directory & contact lines",
            completed: true,
          },
        ],
        modules: [
          {
            id: "mod-p1",
            title: "Module 1: Statutory Guidelines",
            status: "verified",
            specs: [
              "Workplace boundaries & physical/virtual code",
              "Bystander intervention protocols",
            ],
          },
        ],
      },
      {
        id: "task-posh-2",
        title: "Interactive Scenario Case Studies",
        duration: "35m",
        scope:
          "Complete guided walkthroughs on real-world scenarios and micro-aggressions.",
        completed: true,
        subtasks: [
          {
            id: "st-p3",
            title: "Complete Scenario 1: Digital workspace decorum",
            completed: true,
          },
          {
            id: "st-p4",
            title: "Complete Scenario 2: Remote communication norms",
            completed: true,
          },
        ],
      },
      {
        id: "task-posh-3",
        title: "Policy Acknowledgement & Sign-off",
        duration: "10m",
        scope:
          "Sign the digital compliance document through the HRMS employee portal.",
        completed: false,
        subtasks: [
          {
            id: "st-p5",
            title: "Complete e-signature on HRMS acknowledgment slip",
            completed: false,
          },
        ],
      },
      {
        id: "task-posh-4",
        title: "Post-Session Assessment Quiz",
        duration: "15m",
        scope:
          "Achieve minimum 80% passing grade on the certification exam.",
        completed: false,
        subtasks: [
          {
            id: "st-p6",
            title: "Submit 20-question quiz",
            completed: false,
          },
          {
            id: "st-p7",
            title: "Download completion certificate",
            completed: false,
          },
        ],
      },
    ],
  },

  // -------------------------------------------------------------
  // 2. NON-PROJECT: Internal Upskilling & ClickHouse Training
  // -------------------------------------------------------------
  {
    id: "act-2",
    type: "non-project",
    title: "ClickHouse & OLAP Architecture Workshop",
    streamName: "Internal Learning",
    referenceCode: "OPS-TRN-2026-09",
    date: "Sep 22, 2026",
    scheduledTime: "3:00 PM – 4:30 PM",
    description:
      "Hands-on technical workshop exploring ClickHouse columnar storage, vector engine optimization, partition key indexing, and real-time analytical pipeline configurations.",
    duration: "1h 30m",
    loggedHours: "1h 30m",
    tasksCount: 3,
    scope: "Upskilling",
    taskTag: "Technical Training",
    priority: "Medium",
    assignedLead: {
      name: "Marcus Chen",
      initials: "MC",
      role: "Data Platform Lead",
    },
    members: ["MC", "ER", "LK"],
    tasks: [
      {
        id: "task-clk-1",
        title: "Columnar Storage Fundamentals Lab",
        duration: "30m",
        scope:
          "Benchmark row-oriented PostgreSQL reads against ClickHouse columnar storage on a 5M row dataset.",
        completed: true,
        subtasks: [
          { id: "st-c1", title: "Configure local docker-compose ClickHouse node", completed: true },
          { id: "st-c2", title: "Ingest synthetic metrics dataset", completed: true },
        ],
        modules: [
          {
            id: "mod-c1",
            title: "Module 1: MergeTree Engine",
            status: "verified",
            specs: ["Primary key indexing rules", "Data part compression ratios"],
          },
        ],
      },
      {
        id: "task-clk-2",
        title: "Materialized Views & Aggregations",
        duration: "40m",
        scope:
          "Construct materialized views for sub-second dashboard rollups.",
        completed: false,
        subtasks: [
          { id: "st-c3", title: "Write real-time SummingMergeTree query", completed: true },
          { id: "st-c4", title: "Validate query cache hits under load", completed: false },
        ],
      },
      {
        id: "task-clk-3",
        title: "Internal Sandbox Exercise",
        duration: "20m",
        scope:
          "Complete hands-on exercise and commit repository code samples.",
        completed: false,
        subtasks: [
          { id: "st-c5", title: "Push benchmark results to knowledge repo", completed: false },
        ],
      },
    ],
  },

  // -------------------------------------------------------------
  // 3. PROJECT: Apex Platform API & Performance Optimization
  // -------------------------------------------------------------
  {
    id: "act-3",
    type: "project",
    title: "Telemetry Ingestion Optimization",
    projectName: "Apex Analytics Platform",
    referenceCode: "PRJ-APX-2026-11",
    date: "Sep 21, 2026",
    scheduledTime: "1:30 PM – 4:30 PM",
    description:
      "Engineered high-throughput event buffer batching for real-time telemetry streaming, resolved connection pooling bottlenecks, and tuned database indexes.",
    duration: "3h 00m",
    loggedHours: "3h 00m",
    tasksCount: 3,
    taskTag: "Core Engineering",
    priority: "High",
    assignedLead: {
      name: "Alex Morgan",
      initials: "AM",
      role: "Engineering Lead",
    },
    members: ["AM", "LK", "ER"],
    tasks: [
      {
        id: "task-eng-1",
        title: "Connection Pooler Tuning",
        duration: "1h 15m",
        scope:
          "Audit connection leak telemetry and reconfigure PgBouncer limits.",
        completed: true,
        subtasks: [
          { id: "st-e1", title: "Profile idle connection latency", completed: true },
          { id: "st-e2", title: "Deploy tuned max_client_conn threshold", completed: true },
        ],
      },
      {
        id: "task-eng-2",
        title: "Batch Buffer Dispatcher",
        duration: "1h 15m",
        scope:
          "Implement micro-batch queue dispatcher for metric payloads.",
        completed: true,
        subtasks: [
          { id: "st-e3", title: "Implement backpressure back-off logic", completed: true },
          { id: "st-e4", title: "Run end-to-end stress test at 10k req/sec", completed: true },
        ],
      },
      {
        id: "task-eng-3",
        title: "Production Release Staging",
        duration: "30m",
        scope:
          "Prepare deployment manifest and sign-off on staging verification.",
        completed: false,
        subtasks: [
          { id: "st-e5", title: "Validate staging rollout telemetry", completed: false },
        ],
      },
    ],
  },

  // -------------------------------------------------------------
  // 4. NON-PROJECT: Group Health Insurance & Benefits Enrollment
  // -------------------------------------------------------------
  {
    id: "act-4",
    type: "non-project",
    title: "Group Health Insurance Enrolment",
    streamName: "People & Benefits",
    referenceCode: "OPS-BEN-2026-Q3",
    date: "Sep 21, 2026",
    scheduledTime: "11:00 AM – 11:45 AM",
    description:
      "Annual insurance policy update session covering corporate medical insurance coverage, parental add-on schemes, cashless hospital networks, and Flexi-benefit claims.",
    duration: "45m",
    loggedHours: "45m",
    tasksCount: 2,
    scope: "Benefits",
    taskTag: "HR & Wellness",
    priority: "Low",
    assignedLead: {
      name: "Sarah Jenkins",
      initials: "SJ",
      role: "People Ops Lead",
    },
    members: ["SJ", "LK"],
    tasks: [
      {
        id: "task-ins-1",
        title: "Policy Schedule & Dependant Verification",
        duration: "25m",
        scope:
          "Verify personal and dependant nominee data against insurer records.",
        completed: true,
        subtasks: [
          { id: "st-i1", title: "Verify nominee identification details", completed: true },
          { id: "st-i2", title: "Confirm parental coverage add-on tier", completed: true },
        ],
      },
      {
        id: "task-ins-2",
        title: "TPA Portal Registration & Digital Card",
        duration: "20m",
        scope:
          "Log in to the third-party administrator (TPA) application to fetch electronic health cards.",
        completed: true,
        subtasks: [
          { id: "st-i3", title: "Download e-insurance medical card", completed: true },
        ],
      },
    ],
  },

  // -------------------------------------------------------------
  // 5. PROJECT: Nova Mobile App Authentication Migration
  // -------------------------------------------------------------
  {
    id: "act-5",
    type: "project",
    title: "Biometric Auth SDK Integration",
    projectName: "Nova Mobile Dev",
    referenceCode: "PRJ-NOV-2026-04",
    date: "Sep 20, 2026",
    scheduledTime: "9:00 AM – 10:45 AM",
    description:
      "Implemented FaceID/Fingerprint biometric fallback flows, integrated keychain secure enclave wrappers, and validated edge failure modes on iOS and Android test devices.",
    duration: "1h 45m",
    loggedHours: "1h 45m",
    tasksCount: 3,
    taskTag: "Mobile Engineering",
    priority: "High",
    assignedLead: {
      name: "Marcus Chen",
      initials: "MC",
      role: "Mobile Specialist",
    },
    members: ["MC", "AM"],
    tasks: [
      {
        id: "task-bio-1",
        title: "iOS LocalAuthentication Wrapper",
        duration: "45m",
        scope:
          "Integrate FaceID token handoff with Secure Enclave verification.",
        completed: true,
        subtasks: [
          { id: "st-b1", title: "Handle user cancel & PIN fallback triggers", completed: true },
        ],
      },
      {
        id: "task-bio-2",
        title: "Android BiometricPrompt Implementation",
        duration: "45m",
        scope:
          "Implement AndroidX Biometric library with cryptographic cipher validation.",
        completed: true,
        subtasks: [
          { id: "st-b2", title: "Implement cipher decryption on keystore unlock", completed: true },
        ],
      },
      {
        id: "task-bio-3",
        title: "Security Token Invalidation Testing",
        duration: "15m",
        scope:
          "Ensure tokens revoke immediately upon device enrollment change.",
        completed: true,
        subtasks: [
          { id: "st-b3", title: "Trigger biometric reset audit hook", completed: true },
        ],
      },
    ],
  },

  // -------------------------------------------------------------
  // 6. NON-PROJECT: Architecture Documentation & API Guides
  // -------------------------------------------------------------
  {
    id: "act-6",
    type: "non-project",
    title: "Service Catalog & API Architecture Docs",
    streamName: "Knowledge Base",
    referenceCode: "OPS-DOC-2026-09",
    date: "Sep 20, 2026",
    scheduledTime: "2:00 PM – 3:15 PM",
    description:
      "Authored OpenAPI 3.1 specifications, updated schema entity diagrams in Confluence, and documented internal microservice authentication header requirements.",
    duration: "1h 15m",
    loggedHours: "1h 15m",
    tasksCount: 2,
    scope: "Docs",
    taskTag: "Engineering Docs",
    priority: "Low",
    assignedLead: {
      name: "Elena Rostova",
      initials: "ER",
      role: "Backend Engineer",
    },
    members: ["ER", "LK"],
    tasks: [
      {
        id: "task-doc-1",
        title: "OpenAPI Specification Consolidation",
        duration: "45m",
        scope:
          "Generate unified Swagger UI specifications across auth and analytics microservices.",
        completed: true,
        subtasks: [
          { id: "st-d1", title: "Validate endpoint response codes & error envelopes", completed: true },
        ],
      },
      {
        id: "task-doc-2",
        title: "Runbook & Onboarding Guide Updates",
        duration: "30m",
        scope:
          "Update step-by-step local development bootstrap documentation for incoming engineers.",
        completed: true,
        subtasks: [
          { id: "st-d2", title: "Verify local Docker Compose setup script", completed: true },
        ],
      },
    ],
  },
];