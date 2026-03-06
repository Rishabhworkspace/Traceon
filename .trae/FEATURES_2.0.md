# Traceon 2.0 Feature Backlog

This document outlines the proposed roadmap for the next major iteration of Traceon, organized into implementation phases. 

## Phase 1: Interactive Graph Enhancements
*   **[x] Full-text Node Search**: Add a search bar to instantly locate specific files/modules inside the graph space and zoom to them.
*   **[x] Sub-graph Expansion**: Collapse directories into single nodes to reduce noise, and allow double-clicking to expand them in-place.
*   **[x] Architectural Heatmaps**: Color code nodes based on churn (git history - frequently changed) or cyclomatic complexity metadata from AST.

## Phase 2: Advanced AI Capabilities (Traceon AI)
*   **[x] Architecture Summarization**: Generate automated `README.architecture.md` style pages based on the graph shape and component relationships.
*   **[x] Codebase Chat**: Directly map prompts to the graph (e.g., Ask "Why does `api/auth` depend on `components/ui`?" and receive an AI response highlighting the exact edges).
*   **[x] Refactoring Suggestions**: Automatically highlight "God objects" (nodes with massive edge counts) and suggest modularization strategies.

## Phase 3: Monorepo Support / Workspace Visualization
*   **[x] Workspace Scanning**: Scale scanning to support enterprise monorepos (Turborepo, Nx, Lerna) with multiple independent packages.
*   **[x] Package Boundaries**: Group nodes by package/workspace boundaries and visually segregate them.
*   **[x] Boundary Validation**: Show inter-package dependencies and flag architectural rules (e.g., frontend shouldn't import from backend core directly).

## Phase 4: History and Commit Tracking
*   **[x] Time-slider Navigation**: View the architectural graph at different commit hashes to see how it evolved over time.
*   **[x] Visual Architectural Diffs**: Use red edges for deleted dependencies and green edges for added dependencies across commits.

## Phase 5: Export, Reporting, & Integrations
*   **[x] High-Resolution Exports**: Export graphs as SVG, PNG, or PDF for documentation and presentations.
*   **[x] Static HTML Generation**: Generate a static standalone HTML viewer of the graph to embed directly in company wikis or Notion pages.
*   **[ ] VS Code Extension**: Bring Traceon directly into the developer's editor to visualize the blast radius of the file they currently have open.
