<div align="center">

<img src="public/logo.png" alt="Traceon" width="120" />

# Traceon

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/Rishabhworkspace/Traceon?utm_source=oss&utm_medium=github&utm_campaign=Rishabhworkspace%2FTraceon&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

**Two powerful lenses. One unified platform.**

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![React Flow](https://img.shields.io/badge/React_Flow-FF0072?style=flat-square&logo=react&logoColor=white)](https://reactflow.dev/)
[![Groq](https://img.shields.io/badge/Groq_Llama_3.3-F54E00?style=flat-square&logo=meta&logoColor=white)](https://groq.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

[Features](#features) · [Getting Started](#getting-started) · [Architecture](#architecture) · [API Reference](#api-reference) · [Roadmap](#roadmap)

[Live Demo](https://traceon.vercel.app) · [Report Bug](https://github.com/Rishabhworkspace/Traceon/issues) · [Request Feature](https://github.com/Rishabhworkspace/Traceon/issues)

</div>

## About

You just joined a team, inherited a monorepo, or found an open-source project you want to contribute to. Step one is always the same: figure out what depends on what, which files are load-bearing, and whether the person who wrote it actually knows what they're doing. That usually takes days of reading code. Traceon does it in seconds.

It is a unified analysis platform that maps any codebase into an interactive dependency graph and decodes any GitHub developer's engineering capability through LLM-powered analysis — built for open-source contributors navigating unfamiliar repositories, developers onboarding onto new teams, engineering leads evaluating architecture health, and hiring managers who need signal beyond résumés and star counts.

### Repository Analyzer

Paste any GitHub URL (or upload a ZIP). Traceon clones the repository, spawns worker threads to parse every source file into an Abstract Syntax Tree via the TypeScript Compiler API, constructs a full dependency graph, and renders it as an interactive force-directed visualization in your browser. Select any node to see its impact score (0–100), blast radius, and circular dependency chains. Compare architectural snapshots across commit history with visual red/green diffs. Export the graph as PNG, SVG, PDF, or a standalone HTML viewer you can drop into a wiki.

### Profile DNA Checker

Enter any GitHub username. Traceon fetches their public repositories, language byte distributions, recent commits, and README samples — then feeds the raw telemetry into Groq's Llama 3.3 70B model with a rigorous staff-engineer rubric. The result is a multi-dimensional "Engineering DNA" dashboard: six scored axes (Reliability, Security, Maintainability, Uniqueness, Influence, Contribution), an archetype classification, a domain radar chart, a code quality report with strengths and weaknesses, and a Squad Matcher that lets you paste your team's required tech stack to get an instant compatibility percentage.

<div align="center">
  <img src="public/graph-demo.png" alt="Traceon — Interactive dependency graph with impact analysis" width="90%" />
  <br />
  <sub>Repository Analyzer — interactive dependency graph with impact analysis panel</sub>
</div>

---

## Features

### Repository Analyzer

- **AST-powered analysis** — Uses the TypeScript Compiler API for proper AST parsing, not regex or string matching.
- **Interactive dependency graph** — Force-directed graph with zoom, pan, search, and filter via React Flow. Nodes are color-coded by type.
- **Impact analysis engine** — Select any file to see its impact score (0–100), risk level, direct/transitive dependents, and visual blast radius.
- **Circular dependency detection** — Automatically flags `A → B → C → A` loops that cause build issues.
- **Time Travel & Architectural Diffs** — View the graph at different commit hashes with visual red/green edge diffs.
- **Monorepo / Workspace Support** — Visualizes cross-package dependencies for Turborepo, Nx, and Lerna projects.
- **Traceon AI (Codebase Chat)** — Chat with your codebase architecture, ask about component relationships, and auto-generate architecture summaries.
- **High-Resolution & HTML Exports** — Export your graph as PNG, SVG, PDF, or a standalone interactive HTML viewer.
- **Multiple ingestion methods** — Paste a GitHub URL or upload a ZIP archive.
- **Dashboard & metrics** — Track analyzed repositories, file counts, dependency density, critical modules, and architectural heatmaps.

### Profile DNA Checker

- **Engineering DNA analysis** — Enter any GitHub username to decode true engineering capability from public commits — not self-reported skills.
- **LLM-powered assessment** — Raw GitHub telemetry is fed into Groq's Llama 3.3 70B model, which evaluates code against a rigorous staff-engineer rubric.
- **6-axis scoring radar** — Scores across Reliability, Security, Maintainability, Uniqueness, Influence, and Contribution (each 0–100), each with a one-sentence explanation.
- **Archetype classification** — Assigns a developer archetype (e.g., "Fullstack Architect", "Frontend Visionary", "Systems Engineer").
- **Domain DNA Map** — Visualizes capabilities across Frontend, Backend, DevOps, Data Science, and Security as an interactive radar chart.
- **Tech Stack Volumes** — Analyzes exact byte counts across languages for true proficiency signal instead of language listing.
- **Code Quality Report** — Detailed strengths/weaknesses and an Engineering DNA breakdown: Problem Solving, Architecture Maturity, and Documentation quality.
- **Squad Matcher** — Paste your team's required tech stack to get a % compatibility score showing verified capabilities and missing skills.
- **Commit Hygiene evaluation** — Inspects recent commit message quality and README clarity.
- **24-hour result caching** — Analysis results are cached in MongoDB, so repeat lookups on the same username are instant.
- **Trending profiles marquee** — Quick-launch analysis on prominent open-source developers.

### Platform

- **Authentication** — Email/password, GitHub OAuth, Google OAuth, JWT sessions, and guest mode.
- **User profile settings** — Manage account details in the dedicated `/profile` settings page.

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **MongoDB Atlas** cluster (free tier works)
- **Groq API Key** — free at [console.groq.com](https://console.groq.com) (required for Profile DNA)
- **Git** installed locally

### Setup

```bash
git clone https://github.com/Rishabhworkspace/Traceon.git
cd Traceon
npm install
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Database
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/traceon

# NextAuth
NEXTAUTH_SECRET=your_random_secret_minimum_32_chars
NEXTAUTH_URL=http://localhost:3000

# GitHub OAuth
GITHUB_ID=your_github_oauth_app_id
GITHUB_SECRET=your_github_oauth_app_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Groq (for Profile DNA analysis)
GROQ_API_KEY=your_groq_api_key

# GitHub Token (optional — raises API rate limits for Profile DNA and Repo cloning)
GITHUB_TOKEN=your_github_personal_access_token
```

> [!TIP]
> Generate a secure NextAuth secret with `openssl rand -base64 32`

> [!NOTE]
> `GITHUB_TOKEN` is optional but strongly recommended for production. Without it, GitHub's public API rate limit (60 req/hr) can block profile lookups for busy deployments.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you're live.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (React)                          │
│  Landing Page → Analyzer UI → Graph Viewer → Profile DNA        │
├─────────────────────────────────────────────────────────────────┤
│                      Next.js App Router                         │
│  Server Components │ API Routes │ Server Actions                │
├──────────────────────────────┬──────────────────────────────────┤
│      Repository Pipeline     │       Profile DNA Pipeline       │
│  Clone → Scan → Parse (WT)   │  GitHub Fetch → LLM Analysis     │
│  → Build Graph               │  → Cache → DNA Dashboard         │
├──────────────────────────────┴──────────────────────────────────┤
│                           Data Layer                            │
│  MongoDB Atlas │ Mongoose ODM │ Connection Pooling              │
└─────────────────────────────────────────────────────────────────┘
```

### Repository Analysis pipeline

1. **Clone** — `simple-git` clones the repo to a temp directory.
2. **Scan** — Walks the file tree, filters source files, ignores `node_modules`.
3. **Parse** — Spawns worker threads for parallel AST parsing via the TypeScript Compiler API. Extracts imports, exports, functions, classes, and LOC.
4. **Build graph** — Resolves import paths into nodes + edges. Calculates dependency density, in/out degree, and critical modules. Detects circular dependencies via DFS.
5. **Visualize** — Renders with React Flow using Dagre layout, custom color-coded nodes, animated edges, and interactive inspection panels.

### Profile DNA pipeline

1. **GitHub Fetch** — Hits the GitHub REST API to collect repositories, language byte counts, recent commits, and README snippets.
2. **LLM Execution** — Sends a structured payload to Groq's `llama-3.3-70b-versatile` model with a detailed staff-engineer rubric prompt.
3. **Schema validation** — Parses and validates the JSON response against a strict Zod schema before persisting.
4. **Cache & serve** — Saves the result to MongoDB. Subsequent requests within 24 hours are served from cache instantly.

### Impact scoring

The impact engine uses reverse BFS traversal to quantify how much damage a change to any file could cause:

| Risk Level | Score  | Meaning                                 |
|------------|--------|-----------------------------------------|
| Critical   | 60–100 | Changing this file breaks many things   |
| Moderate   | 30–59  | Proceed with caution                    |
| Low        | 0–29   | Safe to modify                          |

---

## Tech Stack

| Layer      | Technology                     | Why                                              |
|------------|--------------------------------|--------------------------------------------------|
| Framework  | Next.js 16 (App Router)        | Server Components, API routes, streaming         |
| Language   | TypeScript 5                   | Type safety across the full stack                |
| Styling    | Tailwind CSS v4                | CSS-first config, custom design tokens           |
| Graph      | React Flow (@xyflow/react)     | Best-in-class graph rendering                    |
| Layout     | Dagre                          | Hierarchical graph layout algorithm              |
| Database   | MongoDB Atlas + Mongoose       | Flexible document model for graph & profile data |
| Auth       | NextAuth.js                    | GitHub, Google, Credentials providers            |
| Parsing    | TypeScript Compiler API        | Production-grade AST parsing                     |
| Cloning    | simple-git                     | Lightweight Git operations                       |
| LLM        | Groq Llama 3.3 70B (via Vercel AI SDK) | Fast, structured Profile DNA generation |
| Animation  | Framer Motion                  | Physics-based UI animations                      |
| Icons      | Lucide React                   | Clean, consistent icon set                       |

---

## Project Structure

```
src/
├── app/                          # Next.js App Router pages & API routes
│   ├── page.tsx                  # Landing page
│   ├── analyze/                  # Repository analysis progress UI
│   ├── dashboard/                # User dashboard (protected)
│   ├── graph/[repoId]/           # Interactive graph viewer
│   ├── profile/                  # Profile settings (/profile) & DNA viewer (/profile/[username])
│   ├── profile-analytics/        # Profile analytics page
│   └── api/                      # REST endpoints
│       ├── analyze/              # Repository analysis routes
│       ├── profile/[username]/   # Profile DNA API
│       └── ...
│
├── components/
│   ├── graph/                    # Graph visualization (CustomNode, ImpactPanel, etc.)
│   ├── home/                     # Landing page sections (incl. InteractiveShowcase)
│   ├── profile/                  # All Profile DNA components
│   │   ├── ProfileLandingHero    # Username search entry point
│   │   ├── ProfileDashboardView  # Tabbed dashboard (Overview, Squad, Skills, …)
│   │   ├── DomainExpertise       # 6-axis radar / score cards
│   │   ├── SkillsGrid            # AI-extracted skills by domain
│   │   ├── TechStack             # Language breakdown with byte volumes
│   │   ├── EngineeringDNA        # Problem solving / architecture / docs narrative
│   │   ├── CodeQualityReport     # Strengths & weaknesses traits
│   │   ├── SquadMatcher          # Stack compatibility checker
│   │   └── RepositoriesList      # Top repositories browser
│   ├── dashboard/                # Dashboard widgets
│   └── layout/                   # Navbar, Footer, ErrorBoundary
│
├── lib/
│   ├── analyzer/                 # Clone, scan, parse, pipeline orchestration
│   │   └── graph/                # Graph builder + impact scoring
│   ├── profile/                  # Profile DNA logic
│   │   ├── githubFetcher.ts      # GitHub API data aggregation
│   │   ├── analyzer.ts           # Groq LLM prompt + Zod validation
│   │   └── service.ts            # Cache-aware orchestration service
│   ├── auth.ts                   # NextAuth configuration
│   └── db/                       # MongoDB connection + Mongoose models
│
└── workers/
    └── parse-worker.js           # Worker thread for CPU-intensive AST parsing
```

---

## API Reference

### Repository Analysis

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/analyze` | Optional | Start repository analysis |
| `POST` | `/api/analyze/upload` | Optional | Upload ZIP for analysis |
| `GET`  | `/api/graph/:repoId` | Session | Fetch graph data |
| `GET`  | `/api/impact/:repoId` | Session | Fetch impact analysis |
| `GET`  | `/api/dashboard` | Required | User dashboard data |
| `GET`  | `/api/repository/:id` | Session | Repository status |

### Profile DNA

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET`  | `/api/profile/:username` | Public | Run or retrieve cached DNA analysis |

### Auth & User

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/signup` | Public | User registration |
| `GET`  | `/api/user/profile` | Required | Get user profile |
| `PUT`  | `/api/user/profile` | Required | Update user profile |

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub.
2. Import the project in the [Vercel Dashboard](https://vercel.com/new).
3. Add all environment variables from `.env.example` (plus `GROQ_API_KEY` and optionally `GITHUB_TOKEN`) in project settings.
4. Deploy — Vercel auto-detects Next.js.

> [!IMPORTANT]
> Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access for Vercel's dynamic egress IPs.

> [!NOTE]
> Worker threads used by the repository parser are fully compatible with Vercel's Node.js runtime. No extra configuration is required.

---

## Roadmap

- [x] Repository cloning & file scanning
- [x] TypeScript AST parsing with Worker Threads
- [x] Dependency graph construction & rendering
- [x] Impact analysis engine
- [x] User dashboard with metrics
- [x] GitHub & Google OAuth
- [x] ZIP upload support
- [x] Circular dependency detection
- [x] Traceon AI (Codebase chat & refactoring suggestions)
- [x] Time-travel architectural commit history & diffs
- [x] Monorepo & workspace graph visualization
- [x] Export graph as PNG/SVG/PDF and Interactive HTML
- [x] **Profile DNA Checker** — LLM-powered engineering analysis from public GitHub data
- [x] **Squad Matcher** — Stack compatibility scoring for hiring & team-building
- [ ] VS Code extension
- [ ] Multi-language support (Python, Go, Rust)
- [ ] Team collaboration features

---

<div align="center">

**Built by [Rishabh](https://github.com/Rishabhworkspace)**

*Traceon — Because understanding code, and the people who write it, shouldn't require reading all of it.*

</div>
