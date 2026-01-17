# Mikey Agent

A self-improving AI agent system built on persistent memory, operational protocols, task dependencies, and automatic hooks.

## Quick Start

See [SETUP.md](SETUP.md) for complete installation instructions.

## What This Is

Infrastructure for building AI agents that improve through use:

1. **Persistent memory** — Cross-session state via SQLite
2. **Operational protocols** — Behavioral scaffolds that can be instrumented and evolved
3. **Task dependencies** — DAG-based work management with ready queues
4. **Active inference** — Reflection and learning from outcomes
5. **Automatic hooks** — Event-driven behaviors with prompt-count-based protocol loading

## Component Repos

| Repo | Purpose | Tools |
|------|---------|-------|
| [claude-brain](https://github.com/mikeybeez/claude-brain) | Memory, state, reflection | `mikey_init`, `mikey_remember`, `mikey_recall`, `mikey_reflect` |
| [mcp-protocols](https://github.com/mikeybeez/mcp-protocols) | Protocol library, tracking | `mikey_protocol_*`, `mikey_prompt_process` |
| [mcp-brain-manager](https://github.com/mikeybeez/mcp-brain-manager) | Projects, reminders | `mikey_remind`, `mikey_project_*` |
| **mikey-agent** (this repo) | Task dependencies | `mikey_create_task`, `mikey_list_ready_work` |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Claude Code                          │
├─────────────────────────────────────────────────────────┤
│  ~/.claude/settings.json (hooks config)                 │
│  ~/.claude/CLAUDE.md (instructions)                     │
├─────────────────────────────────────────────────────────┤
│  ~/.claude/hooks/                                       │
│  ├── prompt-submit.sh      (UserPromptSubmit)          │
│  ├── prompt-processor.js   (protocol detection)        │
│  ├── mark-protocol-loaded.sh                           │
│  ├── check-find.sh         (PreToolUse: Bash)          │
│  ├── check-search.sh       (PreToolUse: Grep)          │
│  └── session-stop.sh       (Stop)                      │
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
│  ~/.claude/state/protocol-state.json (prompt tracking) │
│  brain.db (SQLite)  │  .mikey_tasks/ (JSONL)           │
└─────────────────────────────────────────────────────────┘
```

## Core Concepts

### Hooks System

Claude Code hooks provide automatic behaviors triggered by events:

**UserPromptSubmit** — Runs on every user prompt:
- Detects trigger keywords (error, project, protocol, etc.)
- Tracks which protocols are loaded and when
- Suggests protocol loading with expiry (reload after 10 prompts)
- Prevents duplicate protocols in context

**PreToolUse** — Runs before tool execution:
- Blocks `find` command (enforces `locate` for performance)
- Warns on overly broad searches

**Stop** — Runs when session ends:
- Reminds to commit tasks, reflect, update docs

State is tracked in `~/.claude/state/protocol-state.json`:
```json
{
  "promptCount": 42,
  "protocols": {
    "error-recovery": 35,
    "create-project": 28
  }
}
```

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
2. Hooks detect relevant protocols automatically
3. Harness captures usage patterns
4. `mikey_reflect` evaluates outcomes
5. High-surprise outcomes trigger proposals
6. Proposals are reviewed and applied
7. Protocols evolve based on actual data

## This Repo Contains

```
mikey-agent/
├── README.md           # This file
├── SETUP.md            # Installation guide
├── docs/               # Comprehensive documentation
│   ├── ARCHITECTURE.md # Full system architecture
│   ├── HOOKS.md        # Hooks system guide
│   ├── PROTOCOLS.md    # Protocol system guide
│   └── TROUBLESHOOTING.md
├── config/
│   ├── CLAUDE.md.template
│   ├── settings.json.template
│   └── hooks/          # Hook script templates
└── packages/
    └── mission-control/  # Task dependency system (Python)
```

## Documentation

- [SETUP.md](SETUP.md) — Installation guide
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — Full system architecture
- [docs/HOOKS.md](docs/HOOKS.md) — Hooks system guide
- [docs/PROTOCOLS.md](docs/PROTOCOLS.md) — Protocol system guide
- [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) — Common issues and solutions

## License

MIT
