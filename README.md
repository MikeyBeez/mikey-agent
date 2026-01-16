# Mikey Agent

A self-improving AI agent system built on persistent memory, operational protocols, and task dependencies.

## Quick Start

See [SETUP.md](SETUP.md) for complete installation instructions.

## What This Is

Infrastructure for building AI agents that improve through use:

1. **Persistent memory** — Cross-session state via SQLite
2. **Operational protocols** — Behavioral scaffolds that can be instrumented and evolved
3. **Task dependencies** — DAG-based work management with ready queues
4. **Active inference** — Reflection and learning from outcomes

## Component Repos

| Repo | Purpose | Tools |
|------|---------|-------|
| [claude-brain](https://github.com/mikeybeez/claude-brain) | Memory, state, reflection | `mikey_init`, `mikey_remember`, `mikey_recall`, `mikey_reflect` |
| [mcp-protocols](https://github.com/mikeybeez/mcp-protocols) | Protocol library, tracking | `mikey_protocol_*`, `mikey_prompt_process` |
| [mikey-manager](https://github.com/mikeybeez/mikey-manager) | Projects, reminders | `mikey_remind`, `mikey_project_*` |
| **mikey-agent** (this repo) | Task dependencies | `mikey_create_task`, `mikey_list_ready_work` |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Claude Code                          │
├─────────────────────────────────────────────────────────┤
│  CLAUDE.md (instructions)                               │
├─────────────────────────────────────────────────────────┤
│                    MCP Servers                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │ claude-brain │ │mcp-protocols │ │mikey-manager │    │
│  │   (Node.js)  │ │   (Node.js)  │ │   (Node.js)  │    │
│  └──────────────┘ └──────────────┘ └──────────────┘    │
│  ┌──────────────┐                                       │
│  │mission-control│                                      │
│  │   (Python)   │                                       │
│  └──────────────┘                                       │
├─────────────────────────────────────────────────────────┤
│  brain.db (SQLite)  │  .mikey_tasks/ (JSONL)           │
└─────────────────────────────────────────────────────────┘
```

## Core Concepts

### Memory System (claude-brain)
- **Remember**: Store facts, decisions, patterns
- **Recall**: Semantic search across memories
- **State**: Key-value store for session data
- **Reflect**: Evaluate outcomes, propose improvements

### Protocol System (mcp-protocols)
- **Tier 0**: Meta (prompt processing, protocol selection)
- **Tier 1**: Critical (active inference, error recovery)
- **Tier 2**: Foundation (user communication, task approach)
- **Tier 3**: Specialized (project-specific protocols)

### Task Dependencies (mission-control)
- Tasks with hash-based IDs (`m-a1b2c3`)
- Dependency graph with ready queue
- Git-native JSONL storage
- Circular dependency detection

## The Self-Improvement Loop

1. Work using protocols and tasks
2. Harness captures usage automatically
3. `mikey_reflect` evaluates outcomes
4. High-surprise outcomes trigger proposals
5. Proposals are reviewed and applied
6. Protocols evolve based on actual data

## This Repo Contains

```
mikey-agent/
├── README.md           # This file
├── SETUP.md            # Installation guide
├── config/
│   └── CLAUDE.md.template
└── packages/
    └── mission-control/  # Task dependency system (Python)
```

## License

MIT
