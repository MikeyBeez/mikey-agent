# Mikey Agent

A self-improving AI agent system built on operational protocols, task dependencies, and persistent memory.

## What This Is

Infrastructure for building AI agents that improve through use. The core insights:

1. **Operational protocols** — behavioral scaffolds that can be instrumented, measured, and evolved
2. **Task dependencies** — DAG-based work management with ready queues
3. **Persistent memory** — cross-session state that survives context limits

## Architecture

```
mikey-agent/
├── packages/
│   ├── mission-control/      # Task dependency system (Python)
│   ├── protocols/            # Protocol system with tracking harness
│   ├── naming-registry/      # Namespace management and linting
│   ├── brain-core/           # Persistent memory layer
│   ├── brain-manager/        # Memory management and routing
│   └── brain-assistant/      # Memory assistant interface
└── package.json              # Workspace root
```

## Core Concepts

### Mission Control (Task Dependencies)

Inspired by Steve Yegge's "Beads" — a DAG-based task system where work items can have dependencies.

**Key features:**
- Tasks with hash-based IDs (`m-a1b2c3`)
- Dependency graph with `get_ready_tasks()`
- Circular dependency detection via DFS
- Git-native JSONL storage in `.mikey_tasks/`
- Auto-archive completed tasks with no dependents

**MCP Tools:**
- `mikey_create_task` — Create task with dependencies
- `mikey_update_task_status` — Update status (todo/in_progress/blocked/done)
- `mikey_list_ready_work` — Get tasks ready for execution
- `mikey_check_consistency` — Verify no circular dependencies
- `mikey_task_summary` — Mission overview

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

### mission-control (Python)

Task dependency system with DAG-based ready queue.

```bash
cd packages/mission-control
python3 -m venv .venv
source .venv/bin/activate
pip install pydantic mcp
pytest  # 15 tests
```

### protocols

The protocol system with operational protocols across tiers:

**Tier 0 (Meta):** Prompt Processing, Protocol Selection
**Tier 1 (Critical):** Active Inference, Protocol Lifecycle, Architecture Update
**Tier 2 (Foundation):** Error Recovery, User Communication, Task Approach
**Tier 3 (Specialized):** Medium Article Writing, Create Project

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
- Python 3.9+ (for mission-control)
- Claude Code or another MCP-compatible client

### Installation

```bash
cd mikey-agent
npm install

# For mission-control
cd packages/mission-control
python3 -m venv .venv
source .venv/bin/activate
pip install pydantic mcp
```

### Running MCP Servers

Configure your MCP client (`~/.claude.json`):

```json
{
  "mcpServers": {
    "mission-control": {
      "command": "/path/to/mikey-agent/packages/mission-control/.venv/bin/python3",
      "args": ["/path/to/mikey-agent/packages/mission-control/src/server.py"]
    },
    "mikey-protocols": {
      "command": "node",
      "args": ["/path/to/mikey-agent/packages/protocols/src/index.js"]
    }
  }
}
```

## The Self-Improvement Loop

1. Use protocols and tasks during normal work
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
5. **Task management** — tracking dependencies across complex work

The agent isn't magic. It's infrastructure.

## License

MIT
