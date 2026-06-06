# Contributing to Traceon

Welcome to Traceon!  We're thrilled you want to contribute.
This guide will walk you through everything you need to get started —
from setting up your local environment to submitting your first PR.

---

## Table of Contents

- [About the Project](#about-the-project)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Local Setup Guide](#local-setup-guide)
- [Branching Strategy](#branching-strategy)
- [Before You Submit a PR](#before-you-submit-a-pr)
- [Submitting a PR](#submitting-a-pr)

---

## About the Project

Traceon is a unified analysis platform that maps any codebase into an
interactive dependency graph and decodes any GitHub developer's engineering
capability through LLM-powered analysis.

It is built for:
- Open-source contributors navigating unfamiliar repositories
- Developers onboarding onto new teams
- Engineering leads evaluating architecture health
- Hiring managers who need signal beyond résumés and star counts

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | MongoDB Atlas |
| Auth | NextAuth.js |
| Graph Rendering | React Flow |
| AST Parsing | TypeScript Compiler API |
| LLM | Groq – Llama 3.3 70B |
| Deployment | Vercel |

---

## Project Structure

```
TRACEON/
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── page.tsx                # Homepage
│   │   ├── analyze/                # Repository analyzer page
│   │   ├── dashboard/              # User dashboard
│   │   ├── graph/[repoId]/         # Interactive graph viewer
│   │   ├── profile/                # User profile pages
│   │   ├── profile-analytics/      # Profile DNA analytics
│   │   └── api/                    # Backend API routes
│   │       ├── analyze/            # Repo analysis endpoints
│   │       └── profile/[username]/ # Profile DNA endpoints
│   │
│   ├── components/
│   │   ├── graph/                  # Graph visualization components
│   │   ├── home/                   # Homepage components
│   │   ├── profile/                # Profile page components
│   │   │   ├── ProfileLandingHero
│   │   │   ├── ProfileDashboard
│   │   │   ├── DomainExpertise
│   │   │   ├── SkillsGrid
│   │   │   ├── TechStack
│   │   │   ├── EngineeringDNA
│   │   │   ├── CodeQualityReport
│   │   │   ├── SquadMatcher
│   │   │   └── RepositoriesList
│   │   ├── dashboard/              # Dashboard components
│   │   └── layout/                 # Layout components
│   │
│   └── lib/
│       ├── analyzer/               # Core analysis logic
│       └── graph/                  # Graph utility functions
│
├── docs/                           # Documentation files
├── public/                         # Static assets
├── scripts/                        # Helper/build scripts
├── types/                          # TypeScript type definitions
├── workers/                        # Worker threads for repo parsing
├── .env.example                    # Environment variable template
├── package.json                    # Project dependencies
├── next.config.ts                  # Next.js configuration
└── README.md                       # Project overview
```

---

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Then fill in each value:

| Variable | Description | Example |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/traceon?retryWrites=true` |
| `NEXTAUTH_SECRET` | Random secret, minimum 32 characters | `supersecretrandomstring123456789` |
| `NEXTAUTH_URL` | Your local development URL | `http://localhost:3000` |
| `GITHUB_ID` | GitHub OAuth App Client ID | `your_github_oauth_app_id` |
| `GITHUB_SECRET` | GitHub OAuth App Client Secret | `your_github_oauth_app_secret` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `your_google_client_id` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `your_google_client_secret` |
| `GROQ_API_KEY` | Groq API key for LLM analysis | `your_groq_api_key` |
| `GITHUB_TOKEN` | GitHub Personal Access Token (optional) | `your_github_personal_access_token` |

---

## Local Setup Guide

### Prerequisites

Make sure you have these installed:

- Node.js >= 18
- npm >= 9
- Git
- A free MongoDB Atlas account
- A free Groq API key (required for Profile DNA)

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Rishabhworkspace/Traceon.git
cd Traceon
npm install
cp .env.example .env.local
```

---

### Step 2 — MongoDB Atlas Setup

1. Go to [mongodb.com](https://mongodb.com) and sign up free
2. Click **"Create a New Project"**
3. Click **"Build a Database"** → choose **Free tier (M0)**
4. Create a **username and password** — save these!
5. Go to **Network Access** → **Add IP Address** → enter `0.0.0.0/0`
6. Click **"Connect"** → **"Drivers"** → copy the connection string:
   ```
   mongodb+srv://<user>:<password>@cluster.mongodb.net/traceon?retryWrites=true
   ```
7. Replace `<user>` and `<password>` with your credentials
8. Paste as `MONGODB_URI` in `.env.local`

---

### Step 3 — GitHub OAuth App Setup

1. Go to GitHub → Profile Picture → **Settings**
2. Scroll down → **Developer Settings** → **OAuth Apps**
3. Click **"New OAuth App"** and fill in:
   - **Application name:** `Traceon Local`
   - **Homepage URL:** `http://localhost:3000`
   - **Callback URL:** `http://localhost:3000/api/auth/callback/github`
4. Click **Register Application**
5. Copy **Client ID** → paste as `GITHUB_ID`
6. Click **"Generate a new client secret"** → copy immediately → paste as `GITHUB_SECRET`

---

### Step 4 — Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (top-left dropdown → **New Project**)
3. Go to **APIs & Services** → **OAuth consent screen** → select **External** → Save
4. Go to **Credentials** → **Create Credentials** → **OAuth Client ID**
5. Choose **Web Application**
6. Under **Authorized redirect URIs** add:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. Copy **Client ID** → paste as `GOOGLE_CLIENT_ID`
8. Copy **Client Secret** → paste as `GOOGLE_CLIENT_SECRET`

---

### Step 5 — Groq API Key (Required for Profile DNA)

1. Go to [console.groq.com](https://console.groq.com) and sign up free
2. Go to **API Keys** → **Create API Key**
3. Copy the key → paste as `GROQ_API_KEY` in `.env.local`

> This powers the LLM-based Engineering DNA analysis using Llama 3.3 70B.

---

### Step 6 — Run the Project

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser ✅

---

## Branching Strategy

**Never work directly on `main`.** Always create a new branch:

| Branch Prefix | Use For |
|---|---|
| `feature/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation changes |

**Examples:**
```bash
git checkout -b docs/add-contributing-md
git checkout -b feature/squad-matcher-ui
git checkout -b fix/graph-node-overlap
```

Keep your branch up to date with main:
```bash
git fetch origin
git rebase origin/main
```

---

## Before You Submit a PR 

- [ ] I created a new branch (not working on `main`)
- [ ] My branch is up to date with `main`
- [ ] I ran `npm install` with no errors
- [ ] The project runs locally without errors (`npm run dev`)
- [ ] My changes only cover what the assigned issue asks for
- [ ] I tested my changes manually in the browser
- [ ] My commit message clearly describes what I did
- [ ] I linked the related issue number in my PR description

---

## Submitting a PR

1. Push your branch:
   ```bash
   git push origin your-branch-name
   ```
2. Go to the Traceon GitHub repository
3. Click the yellow **"Compare & pull request"** banner
4. Write a clear title (e.g. `docs: add CONTRIBUTING.md`)
5. In the description write `Closes #25` to auto-link the issue
6. Click **"Create Pull Request"** 

---

## Need Help?

If you're stuck, comment on the issue you're assigned to and tag the maintainer.
We're happy to help new contributors! 