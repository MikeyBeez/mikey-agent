# Mikey Mission Control

Task dependency management system for Mikey Agent, inspired by Steve Yegge's "Beads" concept.

## Overview

Mission Control provides a way to track tasks with explicit dependencies, stored in a git-native format. The agent can query what work is "ready" (all dependencies satisfied) and create new tasks linked to current objectives.

## Features

- **Task Dependencies**: Tasks can depend on other tasks, forming a directed acyclic graph
- **Ready Queue**: `list_ready_work()` returns only tasks whose dependencies are all done
- **Git-Native Storage**: Tasks stored as JSONL in `.mikey_tasks/` directory
- **Consistency Checking**: Detects circular dependencies and missing references
- **MCP Integration**: All operations exposed as MCP tools with `mikey_` prefix

## Installation

```bash
cd packages/mission-control
pip install -e .
```

## MCP Tools

| Tool | Description |
|------|-------------|
| `mikey_create_task` | Create a new task with dependencies |
| `mikey_update_task_status` | Update task status (todo/in_progress/blocked/done) |
| `mikey_list_ready_work` | Get tasks ready to start (dependencies satisfied) |
| `mikey_list_tasks` | List all tasks with optional filters |
| `mikey_check_consistency` | Verify no circular dependencies exist |
| `mikey_task_summary` | Get mission status overview |
| `mikey_get_task` | Get task details with dependency chain |
| `mikey_commit_tasks` | Commit task state to git |
| `mikey_delete_task` | Delete a task (if no dependents) |

## Usage

### Agent Workflow

```
1. At session start: call `mikey_list_ready_work` to orient
2. When discovering subtasks: call `mikey_create_task` with depends_on
3. When starting work: call `mikey_update_task_status` -> in_progress
4. When completing: call `mikey_update_task_status` -> done
5. Periodically: call `mikey_commit_tasks` to persist
```

### Python API

```python
from mission_control import MissionControl, TaskStatus

mc = MissionControl()

# Create tasks with dependencies
setup = mc.create_task("Set up database schema", priority=8)
api = mc.create_task("Implement API endpoints", depends_on=[setup.id])
tests = mc.create_task("Write integration tests", depends_on=[api.id])

# Check what's ready
ready = mc.list_ready_work()  # Returns [setup] since it has no deps

# Mark as done
mc.update_task_status(setup.id, TaskStatus.DONE)

# Now api is ready
ready = mc.list_ready_work()  # Returns [api]

# Check for cycles
is_ok, errors = mc.check_consistency()
```

## Storage Format

Tasks are stored in `.mikey_tasks/tasks.jsonl`:

```jsonl
{"id": "m-a1b2c3", "title": "Set up database", "status": "done", "depends_on": [], ...}
{"id": "m-d4e5f6", "title": "Implement API", "status": "todo", "depends_on": ["m-a1b2c3"], ...}
```

Completed tasks can be archived to `.mikey_tasks/archive.jsonl`.

## Task Model

```python
class Task:
    id: str              # Hash-based ID (e.g., "m-a1b2c3")
    title: str           # Short description
    description: str     # Detailed description
    status: TaskStatus   # todo | in_progress | blocked | done
    depends_on: [str]    # IDs of prerequisite tasks
    blocked_by: [str]    # Currently blocking tasks (computed)
    tags: [str]          # Categorization tags
    priority: int        # 1-10 (10 highest)
    metadata:
        branch: str      # Git branch where created/updated
        commit_hash: str # Git commit hash
        created_at: str  # ISO timestamp
        updated_at: str  # ISO timestamp
```

## Claude Code Config

Add to `~/.claude.json`:

```json
{
  "mcpServers": {
    "mission-control": {
      "command": "python3",
      "args": ["/path/to/mikey-agent/packages/mission-control/src/server.py"]
    }
  }
}
```

## System Prompt Integration

Add to CLAUDE.md:

```markdown
## Mission Control

Before starting any work, run `mikey_list_ready_work` to orient yourself.
If a task is discovered during execution, use `mikey_create_task` to link it to the current objective.
```
