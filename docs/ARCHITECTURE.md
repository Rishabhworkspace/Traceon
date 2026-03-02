# Traceon — System Architecture

> **Version:** 1.0  
> **Date:** March 2, 2026  

---

## 1. Architecture Overview

Traceon is a **Next.js fullstack monolith** with background processing capabilities. The frontend and backend coexist in a single deployable unit, with computationally intensive tasks offloaded to Node.js Worker Threads.

```mermaid
graph TB
    subgraph Client["Browser Client"]
        UI["Next.js Frontend<br/>(React + Tailwind CSS)"]
        RF["React Flow<br/>Visualization"]
    end

    subgraph Server["Next.js Server"]
        API["API Routes"]
        Auth["NextAuth / JWT"]
        SA["Server Actions"]
    end

    subgraph Workers["Background Processing"]
        Cloner["Repository Cloner"]
        Scanner["File Scanner"]
        Parser["Tree-sitter Parser"]
        GraphBuilder["Graph Builder"]
        ImpactEngine["Impact Analysis Engine"]
    end

    subgraph Storage["Data Layer"]
        MongoDB["MongoDB Atlas"]
        TempFS["Temp File System<br/>(Guest Sessions)"]
    end

    subgraph External["External Services"]
        GitHub["GitHub API"]
    end

    UI --> API
    UI --> RF
    API --> Auth
    API --> SA
    SA --> Cloner
    Cloner --> GitHub
    Cloner --> Scanner
    Scanner --> Parser
    Parser --> GraphBuilder
    GraphBuilder --> ImpactEngine
    ImpactEngine --> MongoDB
    Cloner --> TempFS
    SA --> MongoDB
```

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js (React + TypeScript) | UI rendering, routing, SSR |
| **Styling** | Tailwind CSS | Utility-first responsive design |
| **Visualization** | React Flow | Interactive dependency graphs |
| **Backend** | Next.js API Routes / Server Actions | REST API, business logic |
| **Authentication** | NextAuth.js / JWT | Session management, auth flows |
| **Code Parsing** | Tree-sitter (WASM) | AST generation for JS/TS files |
| **Database** | MongoDB (Atlas) | Persistent data storage |
| **Background Jobs** | Node.js Worker Threads | CPU-intensive parsing tasks |
| **Deployment** | Vercel + MongoDB Atlas | Hosting and database |
| **CI/CD** | GitHub Actions | Automated testing and deployment |

---

## 3. Directory Structure (Planned)

```
traceon/
├── public/                    # Static assets
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── (auth)/            # Auth pages (login, signup)
│   │   ├── dashboard/         # Analysis dashboard
│   │   ├── analyze/           # Repository analysis page
│   │   ├── graph/             # Graph visualization page
│   │   └── api/               # API route handlers
│   │       ├── auth/          # Auth endpoints
│   │       ├── analyze/       # Analysis endpoints
│   │       ├── repository/    # Repository CRUD
│   │       └── graph/         # Graph data endpoints
│   ├── components/            # React components
│   │   ├── ui/                # Base UI components
│   │   ├── layout/            # Layout components
│   │   ├── graph/             # Graph visualization components
│   │   ├── dashboard/         # Dashboard widgets
│   │   └── auth/              # Auth forms
│   ├── lib/                   # Core libraries
│   │   ├── db/                # Database connection & models
│   │   ├── auth/              # Auth configuration
│   │   ├── analyzer/          # Analysis pipeline
│   │   │   ├── cloner.ts      # Repository cloning
│   │   │   ├── scanner.ts     # File discovery
│   │   │   ├── parser.ts      # Tree-sitter AST parsing
│   │   │   ├── graph.ts       # Graph construction
│   │   │   └── impact.ts      # Impact analysis
│   │   └── utils/             # Shared utilities
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript type definitions
│   └── styles/                # Global styles
├── workers/                   # Worker thread scripts
├── .env.local                 # Environment variables
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── package.json
```

---

## 4. Data Layer

### 4.1 MongoDB Collections

```mermaid
erDiagram
    USERS {
        ObjectId _id
        string email
        string passwordHash
        string name
        Date createdAt
        Date updatedAt
    }

    REPOSITORIES {
        ObjectId _id
        ObjectId userId "nullable for guest"
        string repoUrl
        string name
        string owner
        string status "pending | analyzing | complete | failed"
        string sessionId "for guest sessions"
        Date analyzedAt
        Date createdAt
    }

    ANALYSIS_RESULTS {
        ObjectId _id
        ObjectId repositoryId
        Object nodes "Array of file/module nodes"
        Object edges "Array of dependency edges"
        Object metrics "Dependency density, counts"
        Date createdAt
    }

    FILES {
        ObjectId _id
        ObjectId repositoryId
        string path
        string type "file | directory"
        Object ast "Parsed AST metadata"
        Array imports
        Array exports
    }

    SESSIONS {
        ObjectId _id
        string sessionId
        string type "guest | authenticated"
        ObjectId userId "nullable"
        Date expiresAt
        Date createdAt
    }

    USERS ||--o{ REPOSITORIES : owns
    REPOSITORIES ||--|| ANALYSIS_RESULTS : has
    REPOSITORIES ||--o{ FILES : contains
    USERS ||--o{ SESSIONS : has
```

### 4.2 Node & Edge Schema

**Node (within analysis_results.nodes):**
```json
{
  "id": "src/utils/helpers.ts",
  "label": "helpers.ts",
  "type": "module",
  "path": "src/utils/helpers.ts",
  "imports": ["lodash", "./constants"],
  "exports": ["formatDate", "parseInput"],
  "loc": 145,
  "complexity": "low"
}
```

**Edge (within analysis_results.edges):**
```json
{
  "source": "src/app/page.tsx",
  "target": "src/utils/helpers.ts",
  "relationship": "imports",
  "weight": 2
}
```

---

## 5. Analysis Pipeline

```mermaid
flowchart LR
    A["1. Clone Repository"] --> B["2. Scan Project Files"]
    B --> C["3. Parse AST (Tree-sitter)"]
    C --> D["4. Extract Relationships"]
    D --> E["5. Build Dependency Graph"]
    E --> F["6. Run Impact Analysis"]
    F --> G["7. Store Results"]
    G --> H["8. Serve to Dashboard"]

    style A fill:#1e3a5f
    style B fill:#1e3a5f
    style C fill:#2d5a3d
    style D fill:#2d5a3d
    style E fill:#5a3d2d
    style F fill:#5a3d2d
    style G fill:#3d2d5a
    style H fill:#3d2d5a
```

**Stage Details:**

| Stage | Description | Technology |
|---|---|---|
| Clone | `git clone` target repo into temp directory | `simple-git` |
| Scan | Walk directory tree, filter by extensions | Node.js `fs` |
| Parse | Generate AST for each JS/TS file | Tree-sitter WASM |
| Extract | Find import/export/call relationships | AST traversal |
| Build | Construct graph nodes and edges | Custom graph engine |
| Impact | Reverse traversal for change propagation | BFS/DFS algorithms |
| Store | Persist to MongoDB or temp storage | Mongoose ODM |
| Serve | Return graph data to frontend | Next.js API |

---

## 6. Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as NextAuth API
    participant DB as MongoDB

    U->>F: Click Login / Signup
    F->>A: POST /api/auth/signin
    A->>DB: Verify credentials
    DB-->>A: User record
    A-->>F: JWT / Session token
    F-->>U: Redirect to Dashboard

    Note over U,F: Guest Flow
    U->>F: Paste GitHub URL
    F->>A: POST /api/analyze (no auth)
    A->>DB: Create guest session
    A-->>F: Analysis results (temporary)
```

---

## 7. Deployment Architecture

```mermaid
graph LR
    subgraph Vercel["Vercel Platform"]
        App["Next.js App"]
        SF["Serverless Functions"]
    end

    subgraph MongoDB_Atlas["MongoDB Atlas"]
        DB["Database Cluster"]
    end

    subgraph GitHub_Actions["CI/CD"]
        CI["GitHub Actions"]
    end

    Git["GitHub Repo"] --> CI
    CI --> Vercel
    App --> SF
    SF --> DB
```

| Component | Service | Tier |
|---|---|---|
| Frontend + API | Vercel | Hobby / Pro |
| Database | MongoDB Atlas | Free (M0) / Shared |
| CI/CD | GitHub Actions | Free tier |
| Domain | Custom domain via Vercel | Optional |

---

## 8. Security Architecture

| Concern | Mitigation |
|---|---|
| Repository cloning | Sandboxed temp directories, auto-cleanup |
| User input | URL validation, path sanitization |
| Authentication | Hashed passwords, JWT with expiry |
| API access | Protected routes, session-based authorization |
| Guest data | Isolated temp storage, TTL-based expiration |
| Rate limiting | API rate limits to prevent abuse |
