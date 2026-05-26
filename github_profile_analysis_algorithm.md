# GitHub Profile Analysis Algorithm
## Technical Specification Document
### Inspired by GitRoll's CURISM Framework

> **Purpose:** This document defines the complete algorithm for analyzing GitHub profiles — covering data sources, scoring dimensions, static analysis tooling, formula definitions, ranking thresholds, and implementation guidance. Use this as the engineering blueprint for building a GitRoll-style profile analysis feature.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Data Sources & GitHub API Inputs](#2-data-sources--github-api-inputs)
3. [The CURISM Scoring Framework](#3-the-curism-scoring-framework)
4. [Dimension 1 — Reliability (Hard Skill)](#4-dimension-1--reliability-hard-skill)
5. [Dimension 2 — Security (Hard Skill)](#5-dimension-2--security-hard-skill)
6. [Dimension 3 — Maintainability (Hard Skill)](#6-dimension-3--maintainability-hard-skill)
7. [Dimension 4 — Influence (Soft Skill)](#7-dimension-4--influence-soft-skill)
8. [Dimension 5 — Contribution (Soft Skill)](#8-dimension-5--contribution-soft-skill)
9. [Dimension 6 — Uniqueness / ACID Builder Score](#9-dimension-6--uniqueness--acid-builder-score)
10. [The Master Scoring Formula](#10-the-master-scoring-formula)
11. [Repository Pre-Processing & Filtering](#11-repository-pre-processing--filtering)
12. [Language-Specific Linter & Rule Engine](#12-language-specific-linter--rule-engine)
13. [Developer Rank Thresholds](#13-developer-rank-thresholds)
14. [Project-Level Analysis](#14-project-level-analysis)
15. [Implementation Roadmap](#15-implementation-roadmap)

---

## 1. System Overview

The analyzer scans a GitHub user's public repositories and activity signals, passes code through a multi-layer static analysis engine, and aggregates the results into a single weighted score (0–10) across six dimensions, grouped into three skill categories.

```
GitHub API
    │
    ▼
Repository Collector ──► Filter Engine ──► Code Cloner (per repo)
                                                   │
                                    ┌──────────────┼──────────────┐
                                    ▼              ▼              ▼
                              Hard Skills     Soft Skills   Builder Skills
                            (R + S + M)      (I + C)          (U / ACID)
                                    │              │              │
                                    └──────────────┴──────────────┘
                                                   │
                                           Master Score (0–10)
                                                   │
                                            Rank Assignment
                                     (C → B → A → S → S+)
```

---

## 2. Data Sources & GitHub API Inputs

All data is fetched via the **GitHub REST API v3** (or GraphQL API for efficiency).

### 2.1 User-Level Endpoints

| Signal | Endpoint |
|---|---|
| Profile metadata | `GET /users/{username}` |
| Public repos list | `GET /users/{username}/repos?per_page=100` |
| Starred repos | `GET /users/{username}/starred` |
| Events (recent activity) | `GET /users/{username}/events/public` |
| Followers/Following | `GET /users/{username}/followers` |
| Organizations | `GET /users/{username}/orgs` |

### 2.2 Repository-Level Endpoints

| Signal | Endpoint |
|---|---|
| Repo metadata | `GET /repos/{owner}/{repo}` |
| Commits | `GET /repos/{owner}/{repo}/commits?author={username}` |
| Pull Requests | `GET /repos/{owner}/{repo}/pulls?state=all` |
| Issues | `GET /repos/{owner}/{repo}/issues?state=all` |
| Contributors | `GET /repos/{owner}/{repo}/contributors` |
| Languages | `GET /repos/{owner}/{repo}/languages` |
| Topics/Tags | `GET /repos/{owner}/{repo}/topics` |
| Code frequency | `GET /repos/{owner}/{repo}/stats/code_frequency` |
| Commit activity | `GET /repos/{owner}/{repo}/stats/commit_activity` |
| Releases | `GET /repos/{owner}/{repo}/releases` |
| Contents (README check) | `GET /repos/{owner}/{repo}/contents/README.md` |

### 2.3 Contribution Signals

| Signal | Endpoint |
|---|---|
| PRs authored in other repos | `GET /search/issues?q=author:{user}+type:pr` |
| Issues filed in other repos | `GET /search/issues?q=author:{user}+type:issue` |
| PRs reviewed | `GET /search/issues?q=reviewed-by:{user}+type:pr` |
| Forks of user's repos | Aggregated from repo metadata |

---

## 3. The CURISM Scoring Framework

GitRoll's algorithm is built on **6 dimensions** forming the acronym **CURISM**:

| Letter | Dimension | Category | Weight in Final Score |
|---|---|---|---|
| C | Contribution | Soft Skill | Part of 40% |
| U | Uniqueness | Builder Skill | Part of 30% |
| R | Reliability | Hard Skill | Part of 30% |
| I | Influence | Soft Skill | Part of 40% |
| S | Security | Hard Skill | Part of 30% |
| M | Maintainability | Hard Skill | Part of 30% |

### 3.1 Category Groupings and Weights

```
Final Score = (0.30 × Hard_Skills) + (0.40 × Soft_Skills) + (0.30 × Builder_Skills)

Hard_Skills   = avg(Reliability, Security, Maintainability)   → weighted by repo recency & complexity
Soft_Skills   = avg(Influence, Contribution)
Builder_Skills = Uniqueness (ACID score)
```

All sub-dimension scores are normalized to a **0–10 scale** before aggregation.

---

## 4. Dimension 1 — Reliability (Hard Skill)

> Demonstrates strong logical thinking and produces code that behaves predictably.

### 4.1 What It Measures

Reliability captures the absence of logic errors, bad patterns, and structural defects that cause runtime failures.

### 4.2 Signals & Sub-Metrics

| Sub-Metric | Description | Source |
|---|---|---|
| **Cyclomatic Complexity** | McCabe complexity per function (CC ≤ 10 ideal, ≥ 20 is high risk) | AST parsing / Lizard |
| **Cognitive Complexity** | SonarSource's cognitive load metric — penalizes nesting, breaks in flow | ESLint / SonarQube rules |
| **Function Length** | Functions > 50 lines flagged as reliability risks | AST analysis |
| **Dead Code** | Unreachable branches, unused variables/imports | Linter rules |
| **Error Handling Coverage** | Ratio of try/catch blocks to risky operations (I/O, API calls, DB) | AST pattern matching |
| **Null/Undefined Safety** | Unguarded null dereferences, missing optional chaining | ESLint, TypeScript strict mode |
| **Test Coverage Signal** | Presence of test files (`*.test.js`, `*.spec.py`, `__tests__/`) | Repo file scan |
| **CI/CD Presence** | `.github/workflows/`, `.travis.yml`, `Jenkinsfile` — signals quality culture | Repo file scan |

### 4.3 Scoring Formula

```
Raw_Reliability = 10
  - (avg_cyclomatic_complexity - 5) × 0.3         # penalize high complexity
  - (dead_code_ratio × 10) × 0.2                  # penalize dead code
  - (missing_error_handling_ratio × 10) × 0.2     # penalize missing try/catch
  + (has_tests ? 1 : 0) × 0.5                     # reward test presence
  + (has_ci ? 1 : 0) × 0.5                        # reward CI setup

Reliability_Score = clamp(Raw_Reliability, 0, 10)
```

### 4.4 Tools to Use

- **JavaScript/TypeScript:** ESLint with `complexity`, `max-lines-per-function`, `no-unused-vars` rules
- **Python:** `radon` for cyclomatic complexity, `pylint`, `flake8`
- **Java:** Checkstyle, PMD
- **Go:** `gocyclo`, `staticcheck`
- **Universal:** `lizard` (multi-language cyclomatic complexity)

---

## 5. Dimension 2 — Security (Hard Skill)

> Ability to produce secure code without vulnerabilities or data leaks.

### 5.1 What It Measures

Security scoring detects the presence of known vulnerability patterns, unsafe coding practices, and leaked credentials.

### 5.2 Signals & Sub-Metrics

| Sub-Metric | Description | Severity |
|---|---|---|
| **Hardcoded Secrets** | API keys, passwords, tokens in source code | Critical |
| **SQL Injection Vectors** | String-concatenated queries without parameterization | Critical |
| **XSS Vulnerabilities** | Unescaped user input rendered to DOM (`innerHTML`, `dangerouslySetInnerHTML`) | High |
| **Insecure Dependencies** | Known CVEs in `package.json`, `requirements.txt`, `pom.xml` | High |
| **CSRF Missing** | Forms/endpoints lacking CSRF protection | Medium |
| **Sensitive Data Logging** | Logging passwords, tokens, PII to console/files | High |
| **Insecure Crypto** | Use of MD5, SHA1 for passwords; use of `Math.random()` for tokens | High |
| **Path Traversal** | Unvalidated file paths from user input | High |
| **Eval / Code Injection** | Use of `eval()`, `exec()`, `pickle.loads()` on untrusted data | Critical |
| **CORS Misconfiguration** | `Access-Control-Allow-Origin: *` on sensitive endpoints | Medium |

### 5.3 Severity Weighting

```
Security_Penalty = Σ (issue_count × severity_weight)

Severity weights:
  Critical = 2.5
  High     = 1.5
  Medium   = 0.8
  Low      = 0.2

Security_Score = max(0, 10 - Security_Penalty)
```

### 5.4 Tools to Use

| Language | Tool |
|---|---|
| JavaScript/TypeScript | `eslint-plugin-security`, `nodejsscan` |
| Python | `bandit`, `semgrep` |
| Java | SpotBugs + FindSecBugs plugin |
| All languages | `semgrep` (rule sets: `p/owasp-top-ten`, `p/secrets`) |
| Dependency audit | `npm audit`, `pip-audit`, `OWASP Dependency-Check` |
| Secret detection | `truffleHog`, `git-secrets`, `detect-secrets` |

---

## 6. Dimension 3 — Maintainability (Hard Skill)

> Ability to write clean, easily readable, and maintainable code.

### 6.1 What It Measures

Maintainability evaluates whether another developer could understand, modify, and extend the code without excessive effort. It maps closely to the **Maintainability Index (MI)** standard.

```
Maintainability Index (MI) = 171 - 5.2 × ln(HV) - 0.23 × CC - 16.2 × ln(LOC)

Where:
  HV  = Halstead Volume (token-based complexity measure)
  CC  = Cyclomatic Complexity
  LOC = Lines of Code
```

### 6.2 Signals & Sub-Metrics

| Sub-Metric | Description | Tools |
|---|---|---|
| **Naming Quality** | Meaningful variable/function names; no single-letter vars outside loops | NLP-based name analysis |
| **Duplication (DRY)** | Copy-pasted code blocks (token similarity ≥ 80%) | `jscpd`, `lizard` clone detection |
| **Comment Ratio** | Comments / total lines; too low (< 5%) or too high (> 40%) penalized | File parser |
| **File/Module Length** | Files > 500 lines flagged | File stats |
| **Single Responsibility** | Classes/modules doing too many unrelated things | Heuristic: method count × avg CC |
| **Dependency Coupling** | High fan-in / fan-out between modules | Import graph analysis |
| **Code Formatting Consistency** | Mixed indentation, inconsistent quotes, trailing spaces | Prettier/ESLint auto-detection |
| **Magic Numbers** | Unnamed numeric/string literals in logic | AST rule: `no-magic-numbers` |
| **Halstead Metrics** | Vocabulary, length, volume, difficulty, effort | `radon` (Python), custom AST |

### 6.3 Scoring Formula

```
Maintainability_Score = normalize(avg(MI per file), [0, 171], [0, 10])
  - (duplication_ratio × 3)         # heavy DRY penalty
  - (avg_file_length / 1000)        # slight penalty for large files
  + (comment_ratio in [0.05, 0.3] ? 0.5 : 0)  # reward reasonable commenting
```

### 6.4 Tools to Use

- **JavaScript:** ESLint (`complexity`, `max-lines`, `no-magic-numbers`), `jscpd`
- **Python:** `radon mi`, `pylint`, `xenon`
- **Multi-language:** SonarQube (Maintainability debt), `lizard`

---

## 7. Dimension 4 — Influence (Soft Skill)

> Experience leading projects acknowledged by other developers.

### 7.1 What It Measures

Influence measures whether the developer's work has real-world impact — whether others use, reference, and build upon their code.

### 7.2 Signals & Sub-Metrics

| Signal | Description | Weight |
|---|---|---|
| **GitHub Stars (logarithmic)** | `log2(total_stars + 1)` across owned repos | High |
| **GitHub Forks** | `log2(total_forks + 1)` — others building on your work | High |
| **Followers** | `log2(followers + 1)` — community respect | Medium |
| **Watchers** | Developers monitoring for updates | Low |
| **Dependent Repos** | Repos importing user's packages via npm/PyPI/etc. | High (if available) |
| **Used in Issues/PRs** | External repos referencing user's code | Medium |
| **npm / PyPI Downloads** | Package download stats (if packages published) | High |
| **Topic Diversity** | Repos spanning multiple categories → broader influence | Low |

### 7.3 Logarithmic Normalization

Logarithmic scaling prevents a single mega-popular repo from dominating:

```javascript
function influenceScore(repos) {
  const totalStars  = repos.reduce((s, r) => s + r.stargazers_count, 0);
  const totalForks  = repos.reduce((s, r) => s + r.forks_count, 0);
  const followers   = user.followers;

  const starScore     = Math.log2(totalStars + 1) / Math.log2(10001) * 10;  // normalized to [0,10] assuming 10k stars = 10
  const forkScore     = Math.log2(totalForks + 1) / Math.log2(5001) * 10;
  const followerScore = Math.log2(followers + 1) / Math.log2(1001) * 10;

  return (starScore * 0.45) + (forkScore * 0.35) + (followerScore * 0.20);
}
```

### 7.4 Recency Weighting

Stars from repositories created within the last 2 years carry more weight than older repos:

```
recency_weight = 1.0 (last 6 months)
               = 0.8 (6–12 months)
               = 0.6 (1–2 years)
               = 0.3 (2+ years)
```

---

## 8. Dimension 5 — Contribution (Soft Skill)

> Contribution to influential open-source projects.

### 8.1 What It Measures

Contribution evaluates collaborative engagement — how actively the developer participates in the broader ecosystem beyond their own projects.

### 8.2 Signals & Sub-Metrics

| Signal | Description | Weight |
|---|---|---|
| **PRs Merged in Other Repos** | Accepted contributions to external projects | Very High |
| **PRs Raised (not own repo)** | Intent to contribute even if not all merged | High |
| **Issues Filed (External)** | Bug reports and feature requests in popular repos | Medium |
| **PR Reviews Done** | Code reviewed for others — shows expertise & collaboration | High |
| **Issue Comments** | Helpful discussion participation | Low |
| **Organizations Joined** | Member of active open-source orgs | Medium |
| **Contribution to Stars-Weighted Repos** | PRs to repos with > 1k stars carry more weight | High |
| **Commit Streak / Consistency** | Days with commits in the last year (contribution graph) | Medium |

### 8.3 Quality vs. Quantity Weighting

```javascript
function contributionScore(user) {
  const externalPRsMerged = prs.filter(pr => pr.merged && pr.repo.owner !== username);
  const prWeight = externalPRsMerged.reduce((score, pr) => {
    const repoWeight = Math.log2(pr.repo.stargazers_count + 1) / 10;  // weight by repo size
    return score + (1 × repoWeight);
  }, 0);

  const reviewScore = prReviews.length * 0.6;
  const issueScore  = externalIssues.length * 0.2;
  const streakScore = (activeDaysLastYear / 365) * 2;  // up to 2 bonus points

  return normalize(prWeight + reviewScore + issueScore + streakScore, 0, 10);
}
```

### 8.4 Commit Activity Matrix

Track activity using the GitHub contribution graph (52 weeks × 7 days):

```
contribution_density = active_days / 365
streak_bonus         = longest_streak / 365 × 2
```

---

## 9. Dimension 6 — Uniqueness / ACID Builder Score

> Evaluates projects for innovation, architecture quality, and documentation completeness.

This is GitRoll's **proprietary ACID© system**. The name stands for four sub-dimensions:

### 9.1 ACID Sub-Dimensions

#### A — Architecture

Evaluates the structural design and organization of the codebase.

| Signal | Detection Method |
|---|---|
| Clear separation of concerns (MVC, Clean Architecture, Hexagonal) | Folder structure pattern matching |
| Modular design (≥ 3 distinct layers: `api/`, `services/`, `models/`, `utils/`) | Directory depth + naming analysis |
| No God files (no single file > 30% of total LOC) | File LOC distribution |
| Well-defined entry points (`index.js`, `main.py`, `App.tsx` present) | File existence check |
| Config externalisation (`.env`, `config/`, no hardcoded URLs) | Pattern search |

```
Architecture_Score = Σ(signal_present × signal_weight) / max_possible × 10
```

#### C — Cross-Domain Integration

Measures integration across different technical domains and technologies.

| Signal | Examples | Weight |
|---|---|---|
| Multiple languages used | JS + Python + SQL | Medium |
| Cloud integrations | AWS SDK, GCP client, Azure | High |
| API integrations | Third-party REST/GraphQL clients | Medium |
| Database diversity | SQL + NoSQL + Cache | Medium |
| Infrastructure-as-Code | Dockerfile, `docker-compose.yml`, Terraform | High |
| Auth systems | OAuth2, JWT, sessions implemented | Medium |
| Messaging/queues | Kafka, RabbitMQ, Redis Pub/Sub | High |

```
CrossDomain_Score = min(10, unique_domains × 1.5)
// Each distinct technical domain integration = 1.5 pts, capped at 10
```

#### I — Innovation

Assesses novelty and creative approaches in the project.

| Signal | Detection |
|---|---|
| Novel topic tags (ML, blockchain, IoT, AR/VR, WebAssembly) | `topics` array in repo metadata |
| Use of recent/cutting-edge libraries (released < 2 years ago) | Package version + release date lookup |
| No tutorial boilerplate | Compare against known scaffold templates (CRA, etc.) |
| Original problem statement in README | NLP: not a "clone", "tutorial", or "course" repo |
| Research / academic nature | Presence of citations, equations, papers |

```
Innovation_Score = novelty_tag_score + recency_score + originality_score
// Each scored 0–10, averaged
```

#### D — Documentation

Reviews quality and completeness of project documentation.

| Signal | Max Points |
|---|---|
| README present | 1.0 |
| README length > 300 words | 1.0 |
| README has installation instructions | 1.5 |
| README has usage examples / code snippets | 1.5 |
| README has screenshots / demo GIF | 1.0 |
| API documentation (Swagger, JSDoc, docstrings) | 1.5 |
| CONTRIBUTING.md present | 0.5 |
| LICENSE file present | 0.5 |
| CHANGELOG or release notes | 0.5 |
| Wiki enabled with content | 0.5 |

```
Documentation_Score = Σ(signals met × point_value)   // max = 10
```

### 9.2 ACID Final Score

```
ACID_Score = (Architecture × 0.30) + (CrossDomain × 0.25) + (Innovation × 0.20) + (Documentation × 0.25)
Uniqueness_Score = ACID_Score  // same value
```

---

## 10. The Master Scoring Formula

### 10.1 Per-Repo Scoring

Each repository receives individual CURISM sub-scores. Repos are then aggregated with recency and complexity weighting.

```javascript
function repoWeight(repo) {
  const monthsOld    = monthsSince(repo.created_at);
  const recency      = monthsOld < 6  ? 1.0
                     : monthsOld < 12 ? 0.85
                     : monthsOld < 24 ? 0.70
                     : 0.50;
  const linesOfCode  = estimateLOC(repo);
  const complexity   = linesOfCode > 10000 ? 1.2
                     : linesOfCode > 1000  ? 1.0
                     : 0.7;

  return recency × complexity;
}
```

### 10.2 Category Aggregation

```javascript
// Weighted average of repos for hard skills
function hardSkillsScore(repos, repoScores) {
  const weighted = repos.map(r => repoScores[r.id].hardSkills × repoWeight(r));
  const totalWeight = repos.reduce((s, r) => s + repoWeight(r), 0);
  return weighted.reduce((s, v) => s + v, 0) / totalWeight;
}

const Hard_Skills   = hardSkillsScore(repos, scores);  // R, S, M averaged
const Soft_Skills   = (Influence_Score + Contribution_Score) / 2;
const Builder_Skills = Uniqueness_Score;
```

### 10.3 Final Score Computation

```
Final_Score = (Hard_Skills × 0.30) + (Soft_Skills × 0.40) + (Builder_Skills × 0.30)
```

All scores are on a **0–10 scale**.

---

## 11. Repository Pre-Processing & Filtering

Not every repo should be analyzed. Apply these filters before scoring:

### 11.1 Inclusion Criteria

```
INCLUDE repo if:
  - repo.fork == false                    // exclude forks (not original work)
  - repo.size > 50                        // exclude near-empty repos (< ~50KB)
  - repo.pushed_at within last 4 years    // exclude abandoned repos
  - primary_language != null              // exclude pure markdown / config repos
  - lines_of_code > 100                   // minimum meaningful code
```

### 11.2 Quality Signals for Inclusion Weight

```
weight_boost if:
  - repo.stargazers_count > 5   → × 1.3
  - repo.forks_count > 2        → × 1.2
  - has_readme                  → × 1.1
  - has_license                 → × 1.05
  - has_topics                  → × 1.05
```

### 11.3 Language Detection Strategy

Use the GitHub Languages API and `linguist` rules. Map to linter toolchain:

```javascript
const LANGUAGE_TOOL_MAP = {
  "JavaScript": ["eslint", "semgrep-js"],
  "TypeScript": ["eslint-ts", "semgrep-ts"],
  "Python":     ["bandit", "radon", "pylint"],
  "Java":       ["pmd", "spotbugs", "checkstyle"],
  "Go":         ["staticcheck", "gosec", "gocyclo"],
  "Ruby":       ["rubocop", "brakeman"],
  "PHP":        ["phpstan", "psalm"],
  "C/C++":      ["cppcheck", "clang-tidy"],
  "Rust":       ["clippy"],
  "default":    ["semgrep"]
};
```

---

## 12. Language-Specific Linter & Rule Engine

GitRoll uses over **3,000+ rules** combining open-source and self-hardcoded patterns. Here is the architecture:

### 12.1 Rule Categories

| Category | Count (approx.) | Examples |
|---|---|---|
| Security (OWASP Top 10) | ~400 rules | SQL injection, XSS, path traversal |
| Reliability Patterns | ~600 rules | Null checks, error handling, async safety |
| Maintainability | ~800 rules | Naming, complexity, duplication |
| Code Smells | ~500 rules | God class, feature envy, dead code |
| Best Practices | ~700 rules | No var in JS, f-strings in Python, etc. |

### 12.2 Rule Execution Pipeline

```
Source File
    │
    ▼
[1] Language Detection (linguist)
    │
    ▼
[2] AST Parsing (tree-sitter / language-specific parser)
    │
    ├──► [3a] Static Linter Rules (ESLint / Pylint / PMD)
    ├──► [3b] SAST Security Rules (Semgrep / Bandit)
    ├──► [3c] Complexity Metrics (Lizard / Radon)
    └──► [3d] Pattern Matching (custom regex + AST patterns)
    │
    ▼
[4] Issue Aggregation (severity + category tagging)
    │
    ▼
[5] Score Computation per dimension
```

### 12.3 Semgrep Rule Integration

Semgrep is the recommended multi-language SAST engine. Use these rule packs:

```yaml
# .semgrep-config.yml
rules:
  - id: owasp-top-ten          # security
  - id: p/secrets              # hardcoded secrets
  - id: p/javascript           # JS-specific
  - id: p/python               # Python-specific
  - id: p/react                # React best practices
  - id: p/nodejs               # Node.js security
```

---

## 13. Developer Rank Thresholds

Scores map to developer seniority levels, calibrated against thousands of analyzed profiles:

| Score Range | Grade | Title |
|---|---|---|
| 8.91 – 10.00 | S+ | Staff Engineer / Exemplary |
| 7.34 – 8.90 | S | Senior Developer |
| 5.89 – 7.33 | A | Mid-Level Developer |
| 5.01 – 5.88 | B | Junior Developer |
| 0.00 – 5.00 | C | Intern / Beginner |

### 13.1 Percentile Calibration

Maintain a global distribution table. Update periodically:

```javascript
function getPercentile(score, globalDistribution) {
  const belowCount = globalDistribution.filter(s => s < score).length;
  return (belowCount / globalDistribution.length) × 100;
}
// "You are above X% of developers scanned"
```

---

## 14. Project-Level Analysis

In addition to profile scoring, each individual repository gets its own breakdown.

### 14.1 Per-Repository Score Card

```json
{
  "repo": "my-project",
  "overall": 7.4,
  "grade": "A",
  "hard_skills": {
    "reliability": 8.1,
    "security": 6.9,
    "maintainability": 7.2
  },
  "builder_skills": {
    "acid_score": 7.6,
    "architecture": 8.0,
    "cross_domain": 7.5,
    "innovation": 6.5,
    "documentation": 8.5
  },
  "issues": [
    { "severity": "high", "category": "security", "rule": "hardcoded-api-key", "file": "config.js", "line": 12 },
    { "severity": "medium", "category": "maintainability", "rule": "function-too-long", "file": "utils.js", "line": 88 }
  ],
  "strengths": ["Good test coverage", "Excellent documentation", "CI/CD configured"],
  "improvements": ["Hardcoded secrets detected", "High cyclomatic complexity in 3 functions"]
}
```

### 14.2 Language Distribution Visualization

Track language composition per repo and across all repos:

```javascript
function languageProfile(repos) {
  const totals = {};
  for (const repo of repos) {
    const langs = await fetchLanguages(repo);  // bytes per language
    for (const [lang, bytes] of Object.entries(langs)) {
      totals[lang] = (totals[lang] || 0) + bytes;
    }
  }
  // Normalize to percentages
  const total = Object.values(totals).reduce((s, v) => s + v, 0);
  return Object.fromEntries(Object.entries(totals).map(([k, v]) => [k, v / total × 100]));
}
```

---

## 15. Implementation Roadmap

### Phase 1 — Data Collection (Week 1–2)
- GitHub OAuth integration
- Rate-limit-aware API client (respect 5000 req/hr limit, use ETags for caching)
- Repository metadata collection pipeline
- Incremental scanning (only re-scan repos updated since last scan)

### Phase 2 — Static Analysis Engine (Week 3–5)
- Repository cloning service (shallow clone: `git clone --depth 1`)
- Language detection via `linguist` or file extension mapping
- ESLint integration for JS/TS repos
- `semgrep` integration for multi-language SAST
- `radon`/`lizard` for complexity metrics
- Parallel repo scanning with job queue (BullMQ / Redis)

### Phase 3 — Scoring Logic (Week 6–7)
- Implement all 6 CURISM dimension formulas
- Recency & complexity weighting
- Repository filtering engine
- Profile-level aggregation
- Percentile calculation against stored benchmark data

### Phase 4 — ACID Builder Score (Week 8–9)
- README parsing (NLP for quality assessment)
- Folder structure analysis for architecture scoring
- Dependency graph analysis for cross-domain scoring
- Topic/tag innovation scoring

### Phase 5 — API & Frontend (Week 10–11)
- REST API: `POST /api/analyze/{github_username}`
- Cached results (TTL: 24 hours)
- Score card JSON response
- Frontend profile card component (radar chart for CURISM dimensions)

### Phase 6 — Calibration (Week 12)
- Seed global benchmark with 1,000+ scanned profiles
- Tune rank thresholds
- A/B test scoring weights

---

### Key Technology Stack (Recommended)

| Layer | Technology |
|---|---|
| GitHub API Client | Octokit.js / PyGithub |
| SAST Engine | Semgrep (primary), language linters (secondary) |
| Complexity Analysis | Lizard (multi-lang), Radon (Python), ESLint (JS) |
| Secret Detection | Trufflehog / detect-secrets |
| Job Queue | BullMQ + Redis |
| Database | PostgreSQL (scores) + Redis (cache) |
| Code Storage | Ephemeral (clone → scan → delete) |
| API Framework | Node.js (Express/Fastify) or Python (FastAPI) |

---

*Document Version 1.0 | Algorithm inspired by GitRoll's publicly documented CURISM framework*
*Sources: GitRoll Algorithm Page (gitroll.io/our-algo), GitRoll 2.0 Medium post, HR Tech Outlook 2025 profile*
