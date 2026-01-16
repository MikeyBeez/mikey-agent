#!/usr/bin/env python3
"""
Mission Control MCP Server

Exposes task dependency management as MCP tools:
- mikey_create_task: Create a new task with dependencies
- mikey_update_task_status: Update task status
- mikey_list_ready_work: Get tasks ready for execution
- mikey_list_tasks: List all tasks with filters
- mikey_check_consistency: Verify no circular dependencies
- mikey_task_summary: Get mission status summary
"""

import json
import sys
from typing import Any, Dict, List, Optional

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import (
    Tool,
    TextContent,
    CallToolResult,
)

import sys
from pathlib import Path

# Add src directory to path for imports
src_dir = Path(__file__).parent
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

from mission_control import (
    MissionControl,
    TaskStatus,
    Task,
    get_mission_control,
)


# =============================================================================
# SERVER SETUP
# =============================================================================

server = Server("mikey-mission-control")

# Global mission control instance (initialized per-project)
_mc: Optional[MissionControl] = None


def get_mc() -> MissionControl:
    """Get or create the MissionControl instance."""
    global _mc
    if _mc is None:
        _mc = get_mission_control()
    return _mc


# =============================================================================
# TOOL DEFINITIONS
# =============================================================================

TOOLS = [
    Tool(
        name="mikey_create_task",
        description="""Create a new task with optional dependencies.

Use this when:
- A new objective is discovered during work
- Breaking down a complex task into subtasks
- Linking a discovered task to the current objective

The task will be stored in .mikey_tasks/ and can be committed to git.""",
        inputSchema={
            "type": "object",
            "properties": {
                "title": {
                    "type": "string",
                    "description": "Short description of the task"
                },
                "description": {
                    "type": "string",
                    "description": "Detailed description of what needs to be done"
                },
                "depends_on": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of task IDs that must be completed before this task can start"
                },
                "tags": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Tags for categorization (e.g., 'bug', 'feature', 'refactor')"
                },
                "priority": {
                    "type": "integer",
                    "minimum": 1,
                    "maximum": 10,
                    "description": "Priority 1-10 (10 is highest). Default is 5."
                },
                "project_path": {
                    "type": "string",
                    "description": "Optional project path. Uses git root or cwd if not specified."
                }
            },
            "required": ["title"]
        }
    ),
    Tool(
        name="mikey_update_task_status",
        description="""Update a task's status.

Valid statuses:
- todo: Not started
- in_progress: Currently being worked on
- blocked: Cannot proceed (dependencies or external blockers)
- done: Completed

When a task is marked 'done', other tasks depending on it may become ready.""",
        inputSchema={
            "type": "object",
            "properties": {
                "task_id": {
                    "type": "string",
                    "description": "The task ID (e.g., 'm-a1b2c3')"
                },
                "status": {
                    "type": "string",
                    "enum": ["todo", "in_progress", "blocked", "done"],
                    "description": "New status for the task"
                },
                "project_path": {
                    "type": "string",
                    "description": "Optional project path"
                }
            },
            "required": ["task_id", "status"]
        }
    ),
    Tool(
        name="mikey_list_ready_work",
        description="""Get all tasks that are ready to start.

A task is ready when:
- Its status is 'todo'
- All tasks it depends on have status 'done'

Use this at the start of work to orient yourself and find what can be done next.
Returns tasks sorted by priority (highest first).""",
        inputSchema={
            "type": "object",
            "properties": {
                "project_path": {
                    "type": "string",
                    "description": "Optional project path"
                }
            }
        }
    ),
    Tool(
        name="mikey_list_tasks",
        description="""List all tasks with optional filtering.

Use to see the full picture of what's in progress, blocked, or completed.""",
        inputSchema={
            "type": "object",
            "properties": {
                "status": {
                    "type": "string",
                    "enum": ["todo", "in_progress", "blocked", "done"],
                    "description": "Filter by status"
                },
                "tags": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Filter by any matching tag"
                },
                "project_path": {
                    "type": "string",
                    "description": "Optional project path"
                }
            }
        }
    ),
    Tool(
        name="mikey_check_consistency",
        description="""Verify the task graph has no circular dependencies.

Run this periodically or after creating many interdependent tasks.
Returns any cycles or missing dependency references found.""",
        inputSchema={
            "type": "object",
            "properties": {
                "project_path": {
                    "type": "string",
                    "description": "Optional project path"
                }
            }
        }
    ),
    Tool(
        name="mikey_task_summary",
        description="""Get a summary of the current mission status.

Returns counts by status, ready tasks, and consistency check results.
Good for getting oriented at the start of a session.""",
        inputSchema={
            "type": "object",
            "properties": {
                "project_path": {
                    "type": "string",
                    "description": "Optional project path"
                }
            }
        }
    ),
    Tool(
        name="mikey_get_task",
        description="""Get details of a specific task by ID.""",
        inputSchema={
            "type": "object",
            "properties": {
                "task_id": {
                    "type": "string",
                    "description": "The task ID"
                },
                "include_chain": {
                    "type": "boolean",
                    "description": "If true, include the full dependency chain"
                },
                "include_impact": {
                    "type": "boolean",
                    "description": "If true, include tasks that depend on this one"
                },
                "project_path": {
                    "type": "string",
                    "description": "Optional project path"
                }
            },
            "required": ["task_id"]
        }
    ),
    Tool(
        name="mikey_commit_tasks",
        description="""Commit current task state to git.

Use after making significant task changes to persist across branches.""",
        inputSchema={
            "type": "object",
            "properties": {
                "message": {
                    "type": "string",
                    "description": "Commit message. Auto-generated if not provided."
                },
                "project_path": {
                    "type": "string",
                    "description": "Optional project path"
                }
            }
        }
    ),
    Tool(
        name="mikey_delete_task",
        description="""Delete a task by ID. Use with caution - this removes the task permanently.""",
        inputSchema={
            "type": "object",
            "properties": {
                "task_id": {
                    "type": "string",
                    "description": "The task ID to delete"
                },
                "project_path": {
                    "type": "string",
                    "description": "Optional project path"
                }
            },
            "required": ["task_id"]
        }
    ),
]


# =============================================================================
# TOOL HANDLERS
# =============================================================================

def task_to_dict(task: Task) -> Dict[str, Any]:
    """Convert a Task to a serializable dict."""
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "status": task.status.value,
        "depends_on": task.depends_on,
        "blocked_by": task.blocked_by,
        "tags": task.tags,
        "priority": task.priority,
        "metadata": {
            "branch": task.metadata.branch,
            "commit_hash": task.metadata.commit_hash,
            "created_at": task.metadata.created_at,
            "updated_at": task.metadata.updated_at,
        }
    }


async def handle_create_task(arguments: Dict[str, Any]) -> str:
    """Handle mikey_create_task."""
    project_path = arguments.get("project_path")
    mc = MissionControl(project_path) if project_path else get_mc()

    task = mc.create_task(
        title=arguments["title"],
        description=arguments.get("description", ""),
        depends_on=arguments.get("depends_on", []),
        tags=arguments.get("tags", []),
        priority=arguments.get("priority", 5)
    )

    return json.dumps({
        "success": True,
        "task": task_to_dict(task),
        "message": f"Created task {task.id}: {task.title}"
    }, indent=2)


async def handle_update_task_status(arguments: Dict[str, Any]) -> str:
    """Handle mikey_update_task_status."""
    project_path = arguments.get("project_path")
    mc = MissionControl(project_path) if project_path else get_mc()

    task_id = arguments["task_id"]
    status = TaskStatus(arguments["status"])

    task = mc.update_task_status(task_id, status)

    if task:
        # Check what became ready as a result
        ready = mc.list_ready_work()
        newly_ready = [t for t in ready if t.id != task_id]

        return json.dumps({
            "success": True,
            "task": task_to_dict(task),
            "newly_ready": [{"id": t.id, "title": t.title} for t in newly_ready[:5]],
            "message": f"Updated {task_id} to {status.value}"
        }, indent=2)
    else:
        return json.dumps({
            "success": False,
            "error": f"Task {task_id} not found"
        }, indent=2)


async def handle_list_ready_work(arguments: Dict[str, Any]) -> str:
    """Handle mikey_list_ready_work."""
    project_path = arguments.get("project_path")
    mc = MissionControl(project_path) if project_path else get_mc()

    ready = mc.list_ready_work()

    if ready:
        return json.dumps({
            "success": True,
            "count": len(ready),
            "tasks": [task_to_dict(t) for t in ready],
            "message": f"{len(ready)} task(s) ready for work"
        }, indent=2)
    else:
        # Also show what's blocked
        blocked = mc.list_blocked()
        return json.dumps({
            "success": True,
            "count": 0,
            "tasks": [],
            "blocked_count": len(blocked),
            "blocked_summary": [
                {"id": t.id, "title": t.title, "blocked_by": blockers}
                for t, blockers in blocked[:5]
            ],
            "message": "No tasks ready. Check blocked tasks or create new work."
        }, indent=2)


async def handle_list_tasks(arguments: Dict[str, Any]) -> str:
    """Handle mikey_list_tasks."""
    project_path = arguments.get("project_path")
    mc = MissionControl(project_path) if project_path else get_mc()

    status_filter = TaskStatus(arguments["status"]) if arguments.get("status") else None
    tags_filter = arguments.get("tags")

    tasks = mc.list_tasks(status=status_filter, tags=tags_filter)

    return json.dumps({
        "success": True,
        "count": len(tasks),
        "tasks": [task_to_dict(t) for t in tasks],
        "filters_applied": {
            "status": arguments.get("status"),
            "tags": tags_filter
        }
    }, indent=2)


async def handle_check_consistency(arguments: Dict[str, Any]) -> str:
    """Handle mikey_check_consistency."""
    project_path = arguments.get("project_path")
    mc = MissionControl(project_path) if project_path else get_mc()

    is_consistent, errors = mc.check_consistency()

    return json.dumps({
        "success": True,
        "is_consistent": is_consistent,
        "errors": errors,
        "message": "Graph is consistent" if is_consistent else f"Found {len(errors)} issue(s)"
    }, indent=2)


async def handle_task_summary(arguments: Dict[str, Any]) -> str:
    """Handle mikey_task_summary."""
    project_path = arguments.get("project_path")
    mc = MissionControl(project_path) if project_path else get_mc()

    summary = mc.summary()

    return json.dumps({
        "success": True,
        **summary
    }, indent=2)


async def handle_get_task(arguments: Dict[str, Any]) -> str:
    """Handle mikey_get_task."""
    project_path = arguments.get("project_path")
    mc = MissionControl(project_path) if project_path else get_mc()

    task_id = arguments["task_id"]
    task = mc.get_task(task_id)

    if not task:
        return json.dumps({
            "success": False,
            "error": f"Task {task_id} not found"
        }, indent=2)

    result = {
        "success": True,
        "task": task_to_dict(task)
    }

    if arguments.get("include_chain"):
        chain = mc.get_task_chain(task_id)
        result["dependency_chain"] = [task_to_dict(t) for t in chain if t.id != task_id]

    if arguments.get("include_impact"):
        impact = mc.get_task_impact(task_id)
        result["dependent_tasks"] = [task_to_dict(t) for t in impact]

    return json.dumps(result, indent=2)


async def handle_commit_tasks(arguments: Dict[str, Any]) -> str:
    """Handle mikey_commit_tasks."""
    project_path = arguments.get("project_path")
    mc = MissionControl(project_path) if project_path else get_mc()

    message = arguments.get("message")
    success = mc.commit(message)

    return json.dumps({
        "success": success,
        "message": "Tasks committed to git" if success else "Failed to commit (may need manual commit)"
    }, indent=2)


async def handle_delete_task(arguments: Dict[str, Any]) -> str:
    """Handle mikey_delete_task."""
    project_path = arguments.get("project_path")
    mc = MissionControl(project_path) if project_path else get_mc()

    task_id = arguments["task_id"]

    # Check for dependents first
    dependents = mc.get_task_impact(task_id)
    if dependents:
        return json.dumps({
            "success": False,
            "error": f"Cannot delete task {task_id} - {len(dependents)} task(s) depend on it",
            "dependent_tasks": [{"id": t.id, "title": t.title} for t in dependents]
        }, indent=2)

    deleted = mc.delete_task(task_id)

    return json.dumps({
        "success": deleted,
        "message": f"Deleted task {task_id}" if deleted else f"Task {task_id} not found"
    }, indent=2)


# Handler dispatch
HANDLERS = {
    "mikey_create_task": handle_create_task,
    "mikey_update_task_status": handle_update_task_status,
    "mikey_list_ready_work": handle_list_ready_work,
    "mikey_list_tasks": handle_list_tasks,
    "mikey_check_consistency": handle_check_consistency,
    "mikey_task_summary": handle_task_summary,
    "mikey_get_task": handle_get_task,
    "mikey_commit_tasks": handle_commit_tasks,
    "mikey_delete_task": handle_delete_task,
}


# =============================================================================
# MCP SERVER CALLBACKS
# =============================================================================

@server.list_tools()
async def list_tools() -> List[Tool]:
    """Return available tools."""
    return TOOLS


@server.call_tool()
async def call_tool(name: str, arguments: Dict[str, Any]) -> CallToolResult:
    """Handle tool calls."""
    handler = HANDLERS.get(name)

    if not handler:
        return CallToolResult(
            content=[TextContent(type="text", text=json.dumps({
                "success": False,
                "error": f"Unknown tool: {name}"
            }))]
        )

    try:
        result = await handler(arguments)
        return CallToolResult(
            content=[TextContent(type="text", text=result)]
        )
    except Exception as e:
        return CallToolResult(
            content=[TextContent(type="text", text=json.dumps({
                "success": False,
                "error": str(e)
            }))]
        )


# =============================================================================
# MAIN
# =============================================================================

async def main():
    """Run the MCP server."""
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options()
        )


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
