# Mikey Agent Architecture

Complete technical documentation for the Mikey Agent system.

## System Overview

Mikey Agent is infrastructure for AI agents that improve through use. It provides:

- **Persistent memory** across sessions
- **Operational protocols** that guide behavior
- **Task dependencies** with ready queues
- **Automatic hooks** for event-driven behaviors
- **Active inference** for learning from outcomes

## Components

### Claude Code Layer

Claude Code is the runtime environment. Configuration files:

| File | Purpose |
|------|---------|
| `~/.claude.json` | MCP server configuration |
| `~/.claude/settings.json` | Hooks configuration |
| `~/.claude/settings.local.json` | Auto-allow rules |
| `~/.claude/CLAUDE.md` | Agent instructions |

### Hooks Layer (`~/.claude/hooks/`)

Hooks execute automatically on Claude Code events:

| Hook | Event | Purpose |
|------|-------|---------|
| `prompt-submit.sh` | UserPromptSubmit | Protocol detection, state tracking |
| `prompt-processor.js` | (internal) | Keyword matching, expiry logic |
| `mark-protocol-loaded.sh` | (manual) | Mark protocol as loaded |
| `check-find.sh` | PreToolUse:Bash | Block find, enforce locate |
| `check-search.sh` | PreToolUse:Grep | Warn on broad searches |
| `session-stop.sh` | Stop | End-of-session reminders |

### State Layer (`~/.claude/state/`)

| File | Purpose |
|------|---------|
| `protocol-state.json` | Prompt counter, protocol load times |

### MCP Servers

Four core servers provide the agent's capabilities:

#### claude-brain (Node.js)
Location: `/Users/bard/Code/claude-brain/`

Memory, state, and reflection:
- `mikey_init` — Initialize session
- `mikey_remember` — Store information
- `mikey_recall` — Search memories
- `mikey_reflect` — Evaluate outcomes
- `mikey_state_*` — Key-value state operations

#### mcp-protocols (Node.js)
Location: `/Users/bard/Code/mcp-protocols/`

Protocol library and tracking:
- `mikey_protocol_list` — List protocols
- `mikey_protocol_read` — Read protocol content
- `mikey_protocol_search` — Find protocols
- `mikey_prompt_process` — Pre-process prompts

#### mcp-brain-manager (Node.js)
Location: `/Users/bard/Code/mcp-brain-manager/`

Projects and reminders:
- `mikey_remind` — Add reminder
- `mikey_reminders` — Check reminders
- `mikey_project_*` — Project management

#### mission-control (Python)
Location: `/Users/bard/Code/mikey-agent/packages/mission-control/`

Task dependencies:
- `mikey_create_task` — Create task with dependencies
- `mikey_list_ready_work` — Get ready tasks
- `mikey_update_task_status` — Update status
- `mikey_task_summary` — Mission overview

### Storage Layer

| Location | Format | Purpose |
|----------|--------|---------|
| `~/Code/Claude_Data/brain/brain.db` | SQLite | Memory, state, reflections |
| `.mikey_tasks/tasks.jsonl` | JSONL | Task definitions |
| `~/Code/docs/session-status.md` | Markdown | Session continuity |

## Data Flow

### Prompt Processing

```
User prompt
    ↓
UserPromptSubmit hook
    ↓
prompt-processor.js
    ├── Increment promptCount
    ├── Match keywords → protocols
    ├── Check expiry (>10 prompts)
    └── Output <prompt-hook> with instructions
    ↓
Claude loads protocols via mikey_protocol_read
    ↓
mark-protocol-loaded.sh updates state
```

### Protocol Loading State

```json
{
  "promptCount": 42,
  "protocols": {
    "error-recovery": 35,
    "create-project": 28
  }
}
```

- `promptCount` increments on every prompt
- `protocols[id]` = prompt number when loaded
- Protocol expires when `promptCount - loadedAt > 10`

### Reflection Flow

```
Task completed
    ↓
mikey_reflect(task, outcome, details)
    ↓
Surprise score calculated (1-10)
    ↓
If surprise >= 7:
    mikey_propose(protocol_id, change_type, description)
    ↓
    mikey_review_proposals (human review)
    ↓
    mikey_apply_proposal (with approval)
```

## Protocol Tiers

| Tier | Purpose | Examples |
|------|---------|----------|
| 0 | Meta | prompt-processing, protocol-selection |
| 1 | Critical | active-inference, error-recovery |
| 2 | Foundation | user-communication, task-approach |
| 3 | Specialized | medium-article, create-project |

## Namespace Convention

All tools use the `mikey_` prefix to avoid collisions with built-in tools.

## File Locations Summary

```
~/.claude/
├── settings.json          # Hooks config
├── CLAUDE.md              # Agent instructions
├── hooks/
│   ├── prompt-submit.sh
│   ├── prompt-processor.js
│   ├── mark-protocol-loaded.sh
│   ├── check-find.sh
│   ├── check-search.sh
│   └── session-stop.sh
└── state/
    └── protocol-state.json

~/.claude.json              # MCP server config

~/Code/
├── claude-brain/           # Brain MCP server
├── mcp-protocols/          # Protocols MCP server
├── mcp-brain-manager/      # Manager MCP server
├── mikey-agent/            # This repo
│   └── packages/
│       └── mission-control/ # Task deps MCP server
├── Claude_Data/
│   └── brain/
│       └── brain.db        # Brain database
└── docs/
    ├── session-status.md
    ├── scratchpad.md
    └── MIKEY_AGENT_ARCHITECTURE.md
```
