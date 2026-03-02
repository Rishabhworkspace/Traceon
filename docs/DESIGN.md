# Traceon — UI/UX Design Document

> **Version:** 1.0  
> **Date:** March 2, 2026  

---

## 1. Design Philosophy

Traceon's interface should feel like a **modern developer tool** — clean, dark-themed, data-dense but not cluttered. Think GitHub's clarity meets Figma's interactivity.

**Core Principles:**
- **Instant Value** — Users should see insights within seconds, not minutes
- **Progressive Disclosure** — Show overview first, details on interaction
- **Developer-First** — Keyboard shortcuts, monospace fonts for code, syntax-aware colors
- **Dark Mode Default** — Easy on the eyes for long analysis sessions

---

## 2. Design System

### 2.1 Color Palette

| Token | Value | Usage |
|---|---|---|
| `--bg-primary` | `#0a0a0f` | Main background |
| `--bg-secondary` | `#12121a` | Cards, panels |
| `--bg-elevated` | `#1a1a28` | Hover states, modals |
| `--accent-primary` | `#6366f1` | Primary actions (Indigo) |
| `--accent-secondary` | `#22d3ee` | Links, highlights (Cyan) |
| `--accent-success` | `#10b981` | Success states (Emerald) |
| `--accent-warning` | `#f59e0b` | Warning states (Amber) |
| `--accent-danger` | `#ef4444` | Error, critical nodes (Red) |
| `--text-primary` | `#f1f5f9` | Main text |
| `--text-secondary` | `#94a3b8` | Muted text |
| `--border` | `#1e293b` | Borders, dividers |

### 2.2 Typography

| Element | Font | Size | Weight |
|---|---|---|---|
| Headings | Inter | 24–36px | 700 |
| Body | Inter | 14–16px | 400 |
| Code / Paths | JetBrains Mono | 13–14px | 400 |
| Labels | Inter | 12px | 500 |

### 2.3 Spacing & Layout

- **Grid:** 8px base unit
- **Container:** Max-width 1440px, centered
- **Card padding:** 24px
- **Section spacing:** 48px

---

## 3. Screen Inventory

| # | Screen | Route | Auth Required |
|---|---|---|---|
| 1 | Landing Page | `/` | No |
| 2 | Login | `/login` | No |
| 3 | Signup | `/signup` | No |
| 4 | Repository Upload | `/analyze` | No |
| 5 | Analysis Dashboard | `/dashboard/:repoId` | No |
| 6 | Dependency Graph | `/graph/:repoId` | No |
| 7 | File Inspector | `/graph/:repoId?file=...` | No |
| 8 | Saved Repositories | `/repositories` | Yes |

---

## 4. Screen Layouts

### 4.1 Landing Page (`/`)

```
┌─────────────────────────────────────────────────────┐
│  Logo    [Features]  [How it Works]  [Login] [Try]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│           Understand Any Codebase                   │
│              Instantly.                             │
│                                                     │
│    Paste any GitHub URL to visualize architecture,  │
│    trace dependencies, and predict impact.          │
│                                                     │
│   ┌──────────────────────────────────────┐  [→]     │
│   │  https://github.com/user/repo        │          │
│   └──────────────────────────────────────┘          │
│                                                     │
│        [Analyze Repository]                         │
│                                                     │
├─────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ AST      │  │ Graph    │  │ Impact   │          │
│  │ Parsing  │  │ Builder  │  │ Analysis │          │
│  └──────────┘  └──────────┘  └──────────┘          │
├─────────────────────────────────────────────────────┤
│  Interactive demo / animated graph preview          │
├─────────────────────────────────────────────────────┤
│  Footer: Links, GitHub, Socials                     │
└─────────────────────────────────────────────────────┘
```

**Key Elements:**
- Hero section with GitHub URL input as the primary CTA
- Animated background with subtle graph nodes/edges
- Feature cards with icons
- Live demo preview showing a sample graph

### 4.2 Analysis Dashboard (`/dashboard/:repoId`)

```
┌─────────────────────────────────────────────────────┐
│  Logo    [Dashboard]  [Graph]  [History]   [User]   │
├─────────┬───────────────────────────────────────────┤
│         │                                           │
│ Project │  ┌─────────┐ ┌─────────┐ ┌─────────┐     │
│ Info    │  │ Files   │ │ Deps    │ │ Risk    │     │
│         │  │   247   │ │   812   │ │  12 ⚠  │     │
│ repo    │  └─────────┘ └─────────┘ └─────────┘     │
│ name    │                                           │
│ branch  │  Dependency Density Chart                 │
│ size    │  ┌───────────────────────────────────┐     │
│ lang    │  │  ██░░██████░░████░░██░░████████   │     │
│         │  └───────────────────────────────────┘     │
│         │                                           │
│ Quick   │  Top Critical Modules                     │
│ Actions │  ┌───────────────────────────────────┐     │
│ ────    │  │ 1. src/core/engine.ts    ██████  │     │
│ View    │  │ 2. src/lib/parser.ts     █████   │     │
│ Graph   │  │ 3. src/utils/index.ts    ████    │     │
│         │  └───────────────────────────────────┘     │
│ Impact  │                                           │
│ Test    │  File Type Distribution (Donut Chart)     │
│         │                                           │
└─────────┴───────────────────────────────────────────┘
```

### 4.3 Dependency Graph Viewer (`/graph/:repoId`)

```
┌─────────────────────────────────────────────────────┐
│  Logo   [Dashboard]  [Graph]  [History]    [User]   │
├─────────────────────────────────────┬───────────────┤
│                                     │ File Panel    │
│    ┌─React Flow Canvas──────────┐   │               │
│    │                            │   │ selected.ts   │
│    │    ○──────○──────○         │   │ ─────────     │
│    │    │      │      │         │   │ Imports: 5    │
│    │    ○──○   ○──────○         │   │ Exports: 3    │
│    │    │  │           │        │   │ LOC: 145      │
│    │    ○  ○───────────○        │   │               │
│    │                            │   │ Dependencies: │
│    │  [Zoom+] [Zoom-] [Fit]    │   │ - utils.ts    │
│    └────────────────────────────┘   │ - config.ts   │
│                                     │               │
│  ┌── Legend ──────────────────┐     │ Dependents:   │
│  │ ○ Module  ○ Util  ○ Entry │     │ - app.tsx     │
│  │ ── imports  ── exports     │     │ - page.tsx    │
│  └────────────────────────────┘     │               │
│                                     │ [View Impact] │
└─────────────────────────────────────┴───────────────┘
```

**Key Interactions:**
- Click node → Show file details in side panel
- Hover node → Highlight direct connections
- Double-click → Expand/collapse clusters
- Right-click → Context menu (impact analysis, view source)
- Mouse wheel → Zoom in/out

### 4.4 Impact Analysis View

```
┌─────────────────────────────────────────────────────┐
│  Impact Analysis: src/core/engine.ts                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ⚠ Modifying this file may affect 8 modules:       │
│                                                     │
│  Direct Dependencies (3):                           │
│  ┌─────────────────────────────────────────┐        │
│  │ 🔴 src/app/page.tsx        (critical)  │        │
│  │ 🟡 src/lib/analyzer.ts     (moderate)  │        │
│  │ 🟢 src/utils/format.ts     (low)       │        │
│  └─────────────────────────────────────────┘        │
│                                                     │
│  Transitive Dependencies (5):                       │
│  ┌─────────────────────────────────────────┐        │
│  │ 🟡 src/components/Graph.tsx             │        │
│  │ 🟢 src/hooks/useAnalysis.ts             │        │
│  │ ...                                     │        │
│  └─────────────────────────────────────────┘        │
│                                                     │
│  Risk Score: ████████░░ 8/10 (High)                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 5. Component Hierarchy

```
App
├── Layout
│   ├── Navbar
│   │   ├── Logo
│   │   ├── NavLinks
│   │   └── UserMenu / LoginButton
│   └── Footer
├── LandingPage
│   ├── HeroSection
│   │   └── RepoUrlInput
│   ├── FeaturesSection
│   ├── DemoPreview
│   └── CTASection
├── AuthPages
│   ├── LoginForm
│   └── SignupForm
├── AnalyzePage
│   ├── RepoUrlInput
│   └── AnalysisProgress
├── DashboardPage
│   ├── ProjectInfoSidebar
│   ├── MetricCards
│   ├── DependencyDensityChart
│   ├── CriticalModulesList
│   └── FileDistributionChart
├── GraphPage
│   ├── GraphCanvas (React Flow)
│   │   ├── CustomNode
│   │   └── CustomEdge
│   ├── GraphControls
│   ├── GraphLegend
│   └── FileInspectorPanel
└── RepositoryHistoryPage
    └── RepositoryCard
```

---

## 6. Graph Node Design

| Node Type | Color | Icon | Example |
|---|---|---|---|
| Entry Point | `#6366f1` (Indigo) | ▶ | `app/page.tsx` |
| Module | `#3b82f6` (Blue) | ◆ | `lib/parser.ts` |
| Utility | `#22d3ee` (Cyan) | ○ | `utils/helpers.ts` |
| Component | `#a78bfa` (Violet) | □ | `Graph.tsx` |
| Config | `#94a3b8` (Gray) | ⚙ | `next.config.ts` |
| Critical (high deps) | `#ef4444` (Red) | ⚠ | Highly-coupled modules |

---

## 7. Animations & Micro-interactions

| Element | Animation | Duration |
|---|---|---|
| Page transitions | Fade + slide up | 300ms |
| Card hover | Scale 1.02 + shadow lift | 200ms |
| Graph node hover | Glow + pulse connected edges | 300ms |
| Analysis progress | Pulsing steps indicator | Continuous |
| Metric counters | Count-up animation on load | 800ms |
| Side panel open | Slide from right | 250ms |
| Toast notifications | Slide in from top-right | 200ms |

---

## 8. Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|---|---|---|
| Mobile | < 640px | Single column, collapsed nav, stacked cards |
| Tablet | 640–1024px | Two columns, collapsible sidebar |
| Desktop | 1024–1440px | Full layout with sidebar |
| Wide | > 1440px | Centered container, extra graph space |
