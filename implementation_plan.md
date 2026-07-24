# Platform Pembelajaran Interaktif - Development & Deployment Plan

This document divides the development process for the Interactive Web Application and AI Agent ecosystem as defined by `AGENTS.agent` and `AGENTS-UI.agent`. It also outlines the creation of the comprehensive deployment documentation requested.

## User Review Required

> [!IMPORTANT]
> Please review the phased development process below. Building a complete Next.js 14 application with AI integrations is a large task. We will need to execute this step-by-step. 

## Open Questions

> [!WARNING]
> **Database ORM Conflict:** Your `AGENTS.agent` specification mentions using **Prisma ORM**, but your `.agents/skills` folder contains guidelines for **Drizzle ORM**. Which ORM should be used for this project?

> [!NOTE]
> **Execution Scope:** Do you want me to begin generating the actual Next.js codebase (Step 1) immediately after this plan is approved, or should we focus strictly on generating the **Deployment & Troubleshooting Documentation** first?

## Phase 1: Deployment & Environment Documentation
Before coding, we will create the **Deployment & Troubleshooting Guide** (`deployment_guide.md`) as requested. This will cover:
1. Environment Variable Configuration (`DATABASE_URL`, `NEXTAUTH_SECRET`, `OPENROUTER_API_KEY`, etc.)
2. Neon Postgres Database Provisioning
3. Vercel Deployment Steps
4. End-to-End Troubleshooting

## Phase 2: Project Scaffolding & Setup
1. **Initialize Next.js 14 (App Router)** with TypeScript, Tailwind CSS, and Shadcn UI (from skills).
2. **Design System:** Implement the design tokens (e.g., `--bg-base`, `--trace-teal`) and typography (Grotesk, Inter, Monospace) specified in `AGENTS-UI.agent`.
3. **Database Setup:** Initialize the chosen ORM (Prisma or Drizzle) with the ERD schema.
4. **Auth.js Integration:** Set up credential-based authentication and role guards (`student`, `teacher`).

## Phase 3: Core Modules Development (Backend + Frontend)
Following the strict sequence defined in `AGENTS.agent`:

### Step 1: Auth & Users
- **Backend:** `registerUser`, `loginUser`, `getCurrentUser`, `requireRole`
- **UI:** `/login`, `/register`, AuthCard, RoleToggle

### Step 2: Class Management
- **Backend:** `createClass`, `enrollStudent`, `getStudentClasses`, etc.
- **UI:** `/kelas`, `/dashboard-guru`

### Step 3: Materials [COMPLETED]
- **Backend:** `getChapters`, `getSubchapters`, `getMaterialTree`, `getSubchapterById` created in `src/actions/materials.ts`.
- **UI:** `/materi/page.tsx` (list view), `/materi/[chapterId]/[subchapterId]/page.tsx` (detail view), and `LessonViewer` (PDF, Video, Text with monospace styling).

### Step 4: Simulations [COMPLETED]
- **Backend:** `getSimulationsBySubchapter`, `getSandboxSimulations` created in `src/actions/simulations.ts`.
- **UI:** `/simulasi/page.tsx`, `ResistorCalculatorWidget`, `CircuitBuilderCanvas` created as interactive client components.

### Step 5: Assessments [COMPLETED]
- **Backend:** `getAssessments`, `getAssessmentWithQuestions`, `startAttempt`, `submitAnswers` created in `src/actions/assessments.ts`.
- **UI:** `/asesmen/page.tsx`, `/asesmen/[id]/page.tsx`, and `AssessmentRunner` client component.

### Step 6: Evaluation (AI) [COMPLETED]
- **Backend:** `generateEvaluation`, `getStudentEvaluations` created using OpenRouter in `src/actions/evaluations.ts`.
- **UI:** `/evaluasi/page.tsx` and `EvaluationClient` component to trigger and display insights.

### Step 7: Chatbot (AI) [COMPLETED]
- **Backend:** `getOrCreateChatSession`, `getChatHistory`, `sendMessage` created using OpenRouter in `src/actions/chatbot.ts`.
- **UI:** Global `ChatbotFAB` added to `layout.tsx` for persistent access.

### Step 8: Progress & Dashboard [COMPLETED]
- **Backend:** `updateLearningProgress`, `getClassProgressOverview` created in `src/actions/progress.ts`.
- **UI:** Teacher Dashboard mapped to `/dashboard/classes/[classId]/page.tsx` with student completion percentages and stats.

## Verification Plan

### Automated/Manual Testing
- **Local Testing:** We will run `npm run dev` and ensure each module builds without errors.
- **UI Verification:** Ensure the trace-line animations and monospace typography match the design guidelines.
- **AI Verification:** Test Openrouter integration using the free-tier model.
