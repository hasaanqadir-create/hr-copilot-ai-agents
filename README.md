# 🤖 HR Copilot — AI Multi-Agent Recruitment Platform

An end-to-end recruitment platform where specialized AI agents handle every stage of hiring — parsing resumes, scoring them against ATS standards, matching candidates to jobs, ranking applicants, generating interview questions, drafting offer letters, and more — all coordinated by a lightweight Manager Agent.

Built with a **provider-agnostic AI layer**: switch between **OpenAI**, **Google Gemini**, or **Anthropic Claude** by changing one environment variable, with zero code changes to any agent.

![Status](https://img.shields.io/badge/status-active-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue) ![Stack](https://img.shields.io/badge/stack-MERN%20%2B%20TypeScript-purple)

---

## ✨ Why this exists

Most "AI recruiting tool" projects are a single ChatGPT wrapper. This one models recruiting as what it actually is: a **pipeline of distinct decisions** — is this resume well-formed? does it fit this job? who should we interview first? — each handled by a purpose-built agent with its own prompt, its own output schema, and its own place in the data model, coordinated by an orchestrator instead of one giant prompt trying to do everything at once.

---

## 🎨 Interface

A dark-mode-first glassmorphism UI with a light theme toggle, animated pipeline visualization, and live agent-driven dashboards — built to look like a real SaaS product, not a college project demo.

---

## 🧠 The 10 AI Agents

| Agent | What it does |
|---|---|
| **Resume Intake** | Parses PDF/DOCX resumes into structured data (contact, skills, experience, education) |
| **ATS Scoring** | Scores resumes 0–100 against ATS heuristics, flags missing keywords, gives improvement suggestions |
| **Job Matching** | Compares a resume against a specific job description — match %, matched/missing skills, fit notes |
| **Candidate Ranking** | Computes a composite rank score across all applicants for a job |
| **AI Interview Generator** | Generates resume-aware technical, HR, and behavioral interview questions at chosen difficulty |
| **Interview Scheduler** | Records interview time/timezone against an application |
| **Email Communication** | Generates professional emails for every stage — invite, rejection, follow-up, offer, reminder |
| **Offer Letter** | Drafts a formal offer letter via AI and renders it to a downloadable PDF |
| **Analytics** | Aggregates the hiring funnel, ATS averages, and match quality for the dashboard |
| **Manager Agent** | Orchestrates the above agents through a lightweight, dependency-free state machine |

## 🚀 Platform Features

Beyond the core pipeline, the app includes:

- 🌙 **Dark / Light theme** — glassmorphism dark mode by default, full light theme toggle
- 🔍 **Global search** (`⌘K` / `Ctrl+K`) — jump to any candidate or job instantly
- 🔔 **Notifications** — live feed of agent activity (scores generated, matches found, etc.)
- 📊 **Job Analytics** — per-job skill gap analysis and pipeline funnel charts
- 🎯 **ATS Improvement view** — per-candidate breakdown of AI suggestions and missing keywords
- 📧 **Email Templates studio** — generate and copy stage-appropriate emails on demand
- 📄 **Offer Letter generator** — fill in role/salary/date, get an AI letter + PDF download
- ⏱ **Activity Timeline** — full chronological audit log of every pipeline event
- ⚙️ **Settings page** — profile, theme, and notification preferences

---

## 🏗️ Architecture

```
Resume Upload
     │
     ▼
┌─────────────────┐
│ Resume Intake    │  PDF/DOCX → structured data
│ Agent            │
└────────┬─────────┘
         ▼
┌─────────────────┐
│ ATS Scoring      │  0–100 score, missing keywords, suggestions
│ Agent            │
└────────┬─────────┘
         ▼
┌─────────────────┐
│ Job Matching     │  Match % against a specific job, skill gaps
│ Agent            │
└────────┬─────────┘
         ▼
┌─────────────────┐
│ Candidate        │  Composite rank score across applicants
│ Ranking Agent    │
└────────┬─────────┘
         ▼
┌─────────────────┐
│ AI Interview     │  Resume-aware technical/HR/behavioral questions
│ Agent            │
└────────┬─────────┘
         ▼
   HR schedules → Email Agent → Offer Letter Agent → Analytics Agent (dashboard)
```

The **Manager Agent** (`backend/src/agents/managerAgent.ts`) wires these together using a small, dependency-free state machine (`backend/src/agents/orchestrator.ts`) instead of a heavy framework — every stage is a plain async function, easy to read, test, and swap for LangGraph.js later without touching agent logic.

---

## 🛠️ Tech Stack

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

---

## 📁 Project Structure

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
│       │   ├── ai/          # Provider-agnostic AI client
│       │   └── storage/     # Provider-agnostic file storage
│       └── config/          # Env validation, DB connection
└── frontend/
    └── src/
        ├── pages/           # Dashboard, Candidates, Jobs, + 7 feature pages
        ├── components/      # UI primitives, pipeline viz, search, notifications
        ├── store/           # Zustand stores (auth, theme, notifications)
        └── lib/             # Axios client
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier)
- An API key from **one** of: [OpenAI](https://platform.openai.com), [Google AI Studio](https://aistudio.google.com) (Gemini, free), or [Anthropic](https://console.anthropic.com)

### 1. Clone & configure backend

```bash
git clone https://github.com/Akhileshkachhwaha26/hr-copilot-ai-agents.git
cd hr-copilot-ai-agents/backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=your_mongodb_connection_string
AI_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-flash-latest
```

```bash
npm run dev
```

API runs on `http://localhost:5000`. Check `/health` to confirm.

### 2. Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Opens on `http://localhost:5173`, proxying `/api` to the backend automatically.

### 3. Try it out

1. Register an **HR** account.
2. **Jobs** → post a role with required skills.
3. **Candidates** → upload a resume (PDF/DOCX). Triggers Resume Intake + ATS Scoring instantly.
4. Back on **Jobs**, apply the candidate to a role — runs the full pipeline: ATS → Job Matching → Ranking.
5. Explore **Interview AI**, **Email Templates**, **Offer Letter**, **Job Analytics**, and **Activity Log** from the sidebar.

---

## 📡 API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in |
| POST | `/api/candidates` | Upload a resume |
| POST | `/api/candidates/:id/process` | Run Intake + ATS agents |
| POST | `/api/jobs` | Post a job (HR/admin only) |
| GET | `/api/jobs` | List open jobs |
| POST | `/api/applications` | Apply a candidate — runs the **full** pipeline |
| GET | `/api/applications/job/:jobId` | List applicants for a job, ranked |
| POST | `/api/interviews/:applicationId/generate` | Generate interview questions |
| PATCH | `/api/interviews/:id/schedule` | Record interview time |
| POST | `/api/offers` | Generate an AI offer letter + PDF |
| POST | `/api/emails/send` | Generate a stage-appropriate email |
| GET | `/api/analytics/dashboard` | Hiring funnel metrics |

---

## 💡 Design decisions worth knowing about

- **Provider-agnostic AI layer**: agents call `getAiClient().complete(...)` against an interface, never a vendor SDK directly. Swapping `AI_PROVIDER` in `.env` changes the entire backend's model with zero code changes.
- **Lightweight orchestration over a heavy framework**: the Manager Agent is a compact state machine, not LangGraph — deliberately chosen to stay readable and debuggable, with a documented upgrade path if needed.
- **Storage and AI providers are both behind interfaces**, so the backend runs with zero cloud dependencies beyond MongoDB and one LLM API key.

## 🔭 Roadmap / honest scope notes

Not yet implemented, and good "what's next" talking points:
- Real Google Calendar integration for scheduling (currently records time directly)
- Real email delivery via Resend/Gmail (Email Agent generates + logs content today)
- Cloudinary storage provider (interface exists, only local implementation is written)
- Voice interviews, resume OCR, multi-company support

---

## 📄 License

MIT — use this however helps you.
