# HR Copilot — AI Multi-Agent Recruitment Platform

An end-to-end recruitment platform where specialized AI agents handle each stage of hiring: parsing resumes, scoring them against ATS standards, matching candidates to jobs, ranking applicants, generating interview questions, and drafting offer letters — all coordinated by a lightweight Manager Agent.

Built with a provider-agnostic AI layer: switch between **OpenAI**, **Google Gemini**, or **Anthropic Claude** by changing one environment variable, with zero code changes to any agent.

## Why this exists

Most "AI recruiting tool" projects are a single ChatGPT wrapper. This one models recruiting as what it actually is: a pipeline of distinct decisions (is this resume well-formed? does it fit this job? who should we interview first?), each handled by a purpose-built agent with its own prompt, its own output schema, and its own place in the data model — coordinated by an orchestrator rather than one giant prompt trying to do everything at once.

## Architecture

```
Resume Upload
     │
     ▼
┌─────────────────┐
│ Resume Intake    │  PDF/DOCX → structured data (contact, skills, experience)
│ Agent            │
└────────┬─────────┘
         ▼
┌─────────────────┐
│ ATS Scoring      │  0–100 score, missing keywords, improvement suggestions
│ Agent            │
└────────┬─────────┘
         ▼
┌─────────────────┐
│ Job Matching     │  Match % against a specific job, skill gap analysis
│ Agent            │
└────────┬─────────┘
         ▼
┌─────────────────┐
│ Candidate        │  Composite rank score across all applicants for a job
│ Ranking Agent    │
└────────┬─────────┘
         ▼
┌─────────────────┐
│ AI Interview     │  Resume-aware technical/HR/behavioral questions
│ Agent            │
└────────┬─────────┘
         ▼
   HR schedules → Email Agent (invite) → Offer Letter Agent (PDF) → Analytics Agent (dashboard)
```

The **Manager Agent** (`backend/src/agents/managerAgent.ts`) wires these together using a small, dependency-free state machine (`backend/src/agents/orchestrator.ts`) instead of a heavy framework — every stage is a plain async function, easy to read, test, and swap for LangGraph.js later without touching agent logic.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite + TypeScript, Tailwind CSS, Framer Motion, Recharts, Zustand |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB + Mongoose |
| AI | Provider-agnostic client (OpenAI / Gemini / Anthropic) |
| Auth | JWT, role-based access (admin / hr / candidate) |
| File storage | Local disk (abstracted; Cloudinary-ready) |
| PDF generation | pdf-lib (offer letters) |
| Resume parsing | pdf-parse, mammoth |

## Project structure

```
hr-copilot/
├── backend/
│   └── src/
│       ├── agents/          # All 10 AI agents + orchestrator
│       ├── controllers/     # Route handlers
│       ├── models/          # Mongoose schemas
│       ├── routes/          # Express routers
│       ├── middleware/      # Auth, upload, error handling
│       ├── services/
│       │   ├── ai/          # Provider-agnostic AI client (openai/gemini/anthropic)
│       │   └── storage/     # Provider-agnostic file storage (local/cloudinary)
│       └── config/          # Env validation, DB connection
└── frontend/
    └── src/
        ├── pages/           # Login, Register, Dashboard, Candidates, Jobs
        ├── components/      # UI primitives, pipeline visualization, forms
        ├── store/           # Zustand auth store
        └── lib/             # Axios client
```

## Getting started

### Prerequisites
- Node.js 18+
- MongoDB running locally (or a connection string from MongoDB Atlas)
- An API key from **one** of: OpenAI, Google Gemini, or Anthropic

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env: set MONGODB_URI, AI_PROVIDER, and the matching API key
npm run dev
```

The API starts on `http://localhost:5000`. Check `http://localhost:5000/health` to confirm it's running.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens on `http://localhost:5173`, proxying `/api` requests to the backend automatically (see `vite.config.ts`).

### 3. Try it out

1. Register an HR account at `/register`.
2. Go to **Jobs** → post a role with required skills.
3. Go to **Candidates** → upload a resume (PDF or DOCX). This triggers the Resume Intake and ATS Scoring agents immediately.
4. Back on **Jobs**, select your posted role and apply the candidate. This runs the full pipeline: ATS → Job Matching → Ranking.
5. Check **Dashboard** for the live hiring funnel.

## API overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in |
| POST | `/api/candidates` | Upload a resume |
| POST | `/api/candidates/:id/process` | Run Intake + ATS agents (no job needed) |
| POST | `/api/jobs` | Post a job (HR/admin only) |
| GET | `/api/jobs` | List open jobs |
| POST | `/api/applications` | Apply a candidate to a job — runs the **full** pipeline |
| GET | `/api/applications/job/:jobId` | List applicants for a job, ranked |
| POST | `/api/interviews/:applicationId/generate` | Generate interview questions |
| PATCH | `/api/interviews/:id/schedule` | Record interview time |
| POST | `/api/offers` | Generate an AI offer letter + PDF |
| POST | `/api/emails/send` | Generate (and log) a stage-appropriate email |
| GET | `/api/analytics/dashboard` | Hiring funnel metrics |

## Design decisions worth knowing about (for interviews)

- **Provider-agnostic AI layer**: agents call `getAiClient().complete(...)` against an interface, never a vendor SDK directly. Swapping `AI_PROVIDER=openai` → `gemini` → `anthropic` in `.env` changes the entire backend's model with no code changes.
- **Lightweight orchestration over a heavy framework**: the Manager Agent is a ~100-line state machine, not LangGraph. Each agent is a plain function; the orchestrator just sequences them and persists context between steps. This was a deliberate choice to keep the system readable and debuggable for a portfolio/interview context, with a documented upgrade path to LangGraph.js if needed.
- **Storage and AI providers are both behind interfaces**, so the entire backend can run with zero cloud dependencies beyond MongoDB and one LLM API key.

## Known limitations / honest scope notes

This is Phase 1–5 of the original 6-phase plan. Not yet implemented:
- Real Google Calendar integration for interview scheduling (currently records the time directly; `calendarEventId` field exists but is unset)
- Real email delivery via Resend/Gmail (the Email Agent generates content and logs it; wiring an actual send call is a small, isolated change in `backend/src/agents/emailAgent.ts`)
- Cloudinary storage provider (interface exists in `services/storage`, only the local implementation is written)
- Voice interviews, resume OCR, multi-company support, audit logs (bonus features from the original spec)

These are good "what would you add next" talking points in an interview rather than gaps to apologize for — the architecture was built so each one is a contained addition, not a rewrite.

## License

MIT — use this however helps you.
