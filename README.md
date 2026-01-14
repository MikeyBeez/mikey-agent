# Mikey Agent

A self-improving AI agent system built on operational protocols, automatic tracking, and persistent memory.

## What This Is

This is infrastructure for building AI agents that improve through use. The core insight: agents need an intermediate layer between memory and tools — **operational protocols** that can be instrumented, measured, and evolved.

## Architecture

```
mikey-agent/
├── packages/
│   ├── protocols/         # Protocol system with tracking harness
│   ├── naming-registry/   # Namespace management and linting
│   ├── brain-core/        # Persistent memory layer
│   ├── brain-manager/     # Memory management and routing
│   └── brain-assistant/   # Memory assistant interface
└── package.json           # Workspace root
```

## Core Concepts

### Protocols as Scaffolds

Protocols aren't documentation — they're operational scaffolds that describe:

- **What is true** (current state)
- **What to do** (transformation rules)
- **When to activate** (trigger conditions)

### The Tracking Harness

Every protocol access is automatically logged:

- Heat map of protocol usage (frequency + recency)
- Daily stats with 30-day retention
- Monthly archives for long-term patterns
- Graduation candidates for high-use protocols

### Namespace Protection

The `mikey_` prefix prevents collisions with built-in tools. The naming registry includes a linter to enforce this.

## Packages

### protocols

The protocol system with 11 operational protocols:

**Meta (Tier 1):** Protocol Selection, Protocol Lifecycle, Protocol Writing, Naming Linter, Active Inference

**Foundation (Tier 2):** Error Recovery, User Communication, Task Approach, Information Integration, Progress Communication

**Specialized (Tier 3):** Medium Article Writing

### naming-registry

Canonical namespace registry with linting:

```bash
node packages/naming-registry/lint.js
```

### brain-core, brain-manager, brain-assistant

Persistent memory system for cross-session state.

## Setup

### Prerequisites

- Node.js 18+
- Claude Code or another MCP-compatible client

### Installation

```bash
cd mikey-agent
npm install
```

### Running MCP Servers

Each package in `packages/` is an MCP server. Configure your MCP client to point to them:

```json
{
  "mcpServers": {
    "mikey-protocols": {
      "command": "node",
      "args": ["/path/to/mikey-agent/packages/protocols/src/index.js"]
    }
  }
}
```

## The Self-Improvement Loop

1. Use protocols during normal work
2. Harness captures every access automatically
3. Heat map accumulates usage patterns
4. Graduation candidates emerge from high-use protocols
5. Review and evolve protocols based on actual data

## What This Is Not

- **Not RL fine-tuning** — model weights don't change
- **Not prompt chaining** — protocols are triggered behavioral invariants
- **Not unbounded memory** — storage is explicitly bounded with rotation
- **Not model-specific** — works with any MCP-compatible system

## Background

This system was built to solve real problems:

1. **Broken persistence** — memory systems that lie about state
2. **Namespace collisions** — custom tools conflicting with built-ins
3. **Behavioral consistency** — reliable patterns for common situations
4. **Self-observation** — knowing what actually works vs. what we think works

The agent isn't magic. It's infrastructure.

## License

MIT
