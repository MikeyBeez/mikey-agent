#!/usr/bin/env python3
"""
Mission Control - Task Dependency System for Mikey Agent
Inspired by Steve Yegge's 'Beads' system.

Provides:
- Task model with dependencies
- Git-native JSONL storage
- Dependency graph traversal
- Circular dependency detection
"""

import hashlib
import json
import os
import subprocess
import time
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

from pydantic import BaseModel, Field, model_validator


# =============================================================================
# ENUMS AND CONSTANTS
# =============================================================================

class TaskStatus(str, Enum):
    """Valid task statuses."""
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    BLOCKED = "blocked"
    DONE = "done"


TASK_DIR_NAME = ".mikey_tasks"
TASKS_FILE = "tasks.jsonl"
ARCHIVE_FILE = "archive.jsonl"


# =============================================================================
# TASK MODEL
# =============================================================================

class GitMetadata(BaseModel):
    """Git context for a task."""
    branch: str = ""
    commit_hash: str = ""
    created_at: str = Field(default_factory=lambda: datetime.now(tz=None).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(tz=None).isoformat())


class Task(BaseModel):
    """
    A task with dependency tracking.

    Attributes:
        id: Unique hash-based ID (e.g., m-a1b2c3)
        title: Short description of the task
        description: Detailed description
        status: Current status [todo, in_progress, blocked, done]
        depends_on: List of task IDs that must be done before this can start
        blocked_by: List of task IDs currently blocking this task (computed)
        tags: Optional tags for categorization
        priority: 1-10 scale (10 highest)
        metadata: Git branch and commit context
    """
    id: str = ""
    title: str
    description: str = ""
    status: TaskStatus = TaskStatus.TODO
    depends_on: List[str] = Field(default_factory=list)
    blocked_by: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    priority: int = Field(default=5, ge=1, le=10)
    metadata: GitMetadata = Field(default_factory=GitMetadata)

    @model_validator(mode='after')
    def generate_id_if_empty(self) -> 'Task':
        """Generate a hash-based ID if not provided."""
        if not self.id:
            timestamp = str(time.time_ns())
            hash_input = f"{self.title}{timestamp}".encode('utf-8')
            hash_hex = hashlib.sha256(hash_input).hexdigest()[:6]
            self.id = f"m-{hash_hex}"
        return self


# =============================================================================
# GIT UTILITIES
# =============================================================================

def get_git_root(path: Optional[str] = None) -> Optional[Path]:
    """Find the git repository root from the given path."""
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            capture_output=True,
            text=True,
            cwd=path or os.getcwd(),
            timeout=5
        )
        if result.returncode == 0:
            return Path(result.stdout.strip())
    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass
    return None


def get_current_branch() -> str:
    """Get the current git branch name."""
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            return result.stdout.strip()
    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass
    return "unknown"


def get_current_commit() -> str:
    """Get the current git commit hash (short)."""
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--short", "HEAD"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            return result.stdout.strip()
    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass
    return "unknown"


def git_add_file(filepath: Path) -> bool:
    """Stage a file for git commit."""
    try:
        result = subprocess.run(
            ["git", "add", str(filepath)],
            capture_output=True,
            text=True,
            cwd=filepath.parent,
            timeout=5
        )
        return result.returncode == 0
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return False


def git_commit_tasks(message: str, task_dir: Path) -> bool:
    """Commit task files with the given message."""
    try:
        # Stage all files in task directory
        result = subprocess.run(
            ["git", "add", str(task_dir)],
            capture_output=True,
            text=True,
            cwd=task_dir.parent,
            timeout=5
        )
        if result.returncode != 0:
            return False

        # Commit
        result = subprocess.run(
            ["git", "commit", "-m", message, "--", str(task_dir)],
            capture_output=True,
            text=True,
            cwd=task_dir.parent,
            timeout=10
        )
        return result.returncode == 0
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return False


# =============================================================================
# TASK STORAGE (JSONL)
# =============================================================================

class TaskStorage:
    """
    Git-native JSONL storage for tasks.

    Stores tasks in .mikey_tasks/ directory as JSONL files.
    Supports reading, writing, and archiving tasks.
    """

    def __init__(self, project_path: Optional[str] = None):
        """
        Initialize storage.

        Args:
            project_path: Path to project. If None, uses git root or cwd.
        """
        if project_path:
            self.root = Path(project_path)
        else:
            git_root = get_git_root()
            self.root = git_root if git_root else Path.cwd()

        self.task_dir = self.root / TASK_DIR_NAME
        self.tasks_file = self.task_dir / TASKS_FILE
        self.archive_file = self.task_dir / ARCHIVE_FILE

        # Ensure directory exists
        self.task_dir.mkdir(parents=True, exist_ok=True)

        # Create .gitkeep if needed
        gitkeep = self.task_dir / ".gitkeep"
        if not gitkeep.exists():
            gitkeep.touch()

    def _read_jsonl(self, filepath: Path) -> List[Dict[str, Any]]:
        """Read all records from a JSONL file."""
        if not filepath.exists():
            return []

        records = []
        with open(filepath, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line:
                    try:
                        records.append(json.loads(line))
                    except json.JSONDecodeError:
                        continue  # Skip malformed lines
        return records

    def _write_jsonl(self, filepath: Path, records: List[Dict[str, Any]]) -> None:
        """Write all records to a JSONL file (overwrites)."""
        with open(filepath, 'w', encoding='utf-8') as f:
            for record in records:
                f.write(json.dumps(record, ensure_ascii=False) + '\n')

    def _append_jsonl(self, filepath: Path, record: Dict[str, Any]) -> None:
        """Append a single record to a JSONL file."""
        with open(filepath, 'a', encoding='utf-8') as f:
            f.write(json.dumps(record, ensure_ascii=False) + '\n')

    def load_all_tasks(self) -> List[Task]:
        """Load all active tasks from storage."""
        records = self._read_jsonl(self.tasks_file)
        tasks = []
        for record in records:
            try:
                tasks.append(Task(**record))
            except Exception:
                continue  # Skip invalid records
        return tasks

    def load_task(self, task_id: str) -> Optional[Task]:
        """Load a specific task by ID."""
        tasks = self.load_all_tasks()
        for task in tasks:
            if task.id == task_id:
                return task
        return None

    def save_task(self, task: Task) -> Task:
        """
        Save a task (create or update).

        Updates git metadata automatically.
        """
        # Update git metadata
        task.metadata.branch = get_current_branch()
        task.metadata.commit_hash = get_current_commit()
        task.metadata.updated_at = datetime.now(tz=None).isoformat()

        # Load existing tasks
        tasks = self.load_all_tasks()

        # Find and update or append
        found = False
        for i, existing in enumerate(tasks):
            if existing.id == task.id:
                tasks[i] = task
                found = True
                break

        if not found:
            tasks.append(task)

        # Write back
        self._write_jsonl(self.tasks_file, [t.model_dump() for t in tasks])

        return task

    def delete_task(self, task_id: str) -> bool:
        """Delete a task by ID. Returns True if deleted."""
        tasks = self.load_all_tasks()
        original_count = len(tasks)
        tasks = [t for t in tasks if t.id != task_id]

        if len(tasks) < original_count:
            self._write_jsonl(self.tasks_file, [t.model_dump() for t in tasks])
            return True
        return False

    def archive_task(self, task_id: str) -> bool:
        """Move a completed task to archive. Returns True if archived."""
        task = self.load_task(task_id)
        if not task:
            return False

        # Append to archive
        self._append_jsonl(self.archive_file, task.model_dump())

        # Remove from active tasks
        return self.delete_task(task_id)

    def commit_changes(self, message: str = "Update mission control tasks") -> bool:
        """Commit task files to git."""
        return git_commit_tasks(message, self.task_dir)

    def get_task_dir(self) -> Path:
        """Return the task directory path."""
        return self.task_dir


# =============================================================================
# DEPENDENCY GRAPH OPERATIONS
# =============================================================================

class DependencyGraph:
    """
    Manages task dependencies and provides graph traversal operations.
    """

    def __init__(self, storage: TaskStorage):
        self.storage = storage

    def _build_graph(self) -> Tuple[Dict[str, Task], Dict[str, Set[str]]]:
        """
        Build adjacency list representation of task dependencies.

        Returns:
            Tuple of (task_dict, adjacency_dict)
            - task_dict: id -> Task
            - adjacency_dict: id -> set of dependency ids
        """
        tasks = self.storage.load_all_tasks()
        task_dict = {t.id: t for t in tasks}
        adj = {t.id: set(t.depends_on) for t in tasks}
        return task_dict, adj

    def get_ready_tasks(self) -> List[Task]:
        """
        Get tasks that are ready to start.

        A task is ready if:
        - status == 'todo'
        - all tasks in depends_on have status == 'done'

        Returns:
            List of tasks ready for work, sorted by priority (highest first)
        """
        task_dict, adj = self._build_graph()
        ready = []

        for task_id, task in task_dict.items():
            if task.status != TaskStatus.TODO:
                continue

            # Check all dependencies
            all_deps_done = True
            blocking = []

            for dep_id in task.depends_on:
                dep_task = task_dict.get(dep_id)
                if dep_task is None:
                    # Dependency doesn't exist - treat as unresolved
                    all_deps_done = False
                    blocking.append(dep_id)
                elif dep_task.status != TaskStatus.DONE:
                    all_deps_done = False
                    blocking.append(dep_id)

            if all_deps_done:
                ready.append(task)
            else:
                # Update blocked_by field
                task.blocked_by = blocking

        # Sort by priority (descending) then by creation time (ascending)
        ready.sort(key=lambda t: (-t.priority, t.metadata.created_at))

        return ready

    def get_blocked_tasks(self) -> List[Tuple[Task, List[str]]]:
        """
        Get tasks that are blocked and what's blocking them.

        Returns:
            List of (task, blocking_task_ids) tuples
        """
        task_dict, adj = self._build_graph()
        blocked = []

        for task_id, task in task_dict.items():
            if task.status != TaskStatus.TODO:
                continue

            blocking = []
            for dep_id in task.depends_on:
                dep_task = task_dict.get(dep_id)
                if dep_task is None or dep_task.status != TaskStatus.DONE:
                    blocking.append(dep_id)

            if blocking:
                blocked.append((task, blocking))

        return blocked

    def check_consistency(self) -> Tuple[bool, List[str]]:
        """
        Verify no circular dependencies exist in the task graph.

        Uses DFS-based cycle detection with three colors:
        - white (0): unvisited
        - gray (1): visiting (in current DFS path)
        - black (2): visited (completed)

        Returns:
            Tuple of (is_consistent, error_messages)
            - is_consistent: True if no cycles found
            - error_messages: List of cycle descriptions if cycles exist
        """
        task_dict, adj = self._build_graph()

        WHITE, GRAY, BLACK = 0, 1, 2
        color = {task_id: WHITE for task_id in task_dict}
        parent = {task_id: None for task_id in task_dict}
        cycles = []

        def dfs(node: str, path: List[str]) -> bool:
            """
            DFS traversal. Returns True if cycle found.
            """
            color[node] = GRAY
            path.append(node)

            for neighbor in adj.get(node, set()):
                if neighbor not in color:
                    # Dependency points to non-existent task
                    continue

                if color[neighbor] == GRAY:
                    # Found cycle - extract it
                    cycle_start = path.index(neighbor)
                    cycle = path[cycle_start:] + [neighbor]
                    cycle_str = " -> ".join(cycle)
                    cycles.append(f"Circular dependency detected: {cycle_str}")
                    return True

                if color[neighbor] == WHITE:
                    if dfs(neighbor, path):
                        return True

            color[node] = BLACK
            path.pop()
            return False

        # Run DFS from each unvisited node
        for task_id in task_dict:
            if color[task_id] == WHITE:
                dfs(task_id, [])

        # Also check for missing dependencies
        errors = list(cycles)
        for task_id, task in task_dict.items():
            for dep_id in task.depends_on:
                if dep_id not in task_dict:
                    errors.append(
                        f"Task '{task_id}' depends on non-existent task '{dep_id}'"
                    )

        return len(errors) == 0, errors

    def get_dependency_chain(self, task_id: str) -> List[Task]:
        """
        Get the full dependency chain for a task (what must be done first).

        Returns tasks in topological order (dependencies first).
        """
        task_dict, adj = self._build_graph()

        if task_id not in task_dict:
            return []

        visited = set()
        chain = []

        def dfs(node: str):
            if node in visited:
                return
            visited.add(node)

            # Visit dependencies first
            for dep_id in adj.get(node, set()):
                if dep_id in task_dict:
                    dfs(dep_id)

            chain.append(task_dict[node])

        dfs(task_id)
        return chain

    def get_dependents(self, task_id: str) -> List[Task]:
        """
        Get all tasks that depend on the given task.

        Useful for understanding impact of completing/changing a task.
        """
        task_dict, _ = self._build_graph()
        dependents = []

        for task in task_dict.values():
            if task_id in task.depends_on:
                dependents.append(task)

        return dependents


# =============================================================================
# MISSION CONTROL (MAIN API)
# =============================================================================

class MissionControl:
    """
    Main API for the mission control system.

    Combines storage and graph operations into a unified interface.
    """

    def __init__(self, project_path: Optional[str] = None):
        """
        Initialize mission control.

        Args:
            project_path: Path to project. If None, uses git root or cwd.
        """
        self.storage = TaskStorage(project_path)
        self.graph = DependencyGraph(self.storage)

    # -------------------------------------------------------------------------
    # TASK CRUD
    # -------------------------------------------------------------------------

    def create_task(
        self,
        title: str,
        description: str = "",
        depends_on: Optional[List[str]] = None,
        tags: Optional[List[str]] = None,
        priority: int = 5
    ) -> Task:
        """
        Create a new task.

        Args:
            title: Short task description
            description: Detailed description
            depends_on: List of task IDs this depends on
            tags: Optional tags for categorization
            priority: 1-10 scale (10 highest)

        Returns:
            The created Task with generated ID
        """
        task = Task(
            title=title,
            description=description,
            depends_on=depends_on or [],
            tags=tags or [],
            priority=priority
        )
        return self.storage.save_task(task)

    def update_task_status(
        self,
        task_id: str,
        status: TaskStatus,
        auto_archive: bool = True
    ) -> Optional[Task]:
        """
        Update a task's status.

        Args:
            task_id: ID of task to update
            status: New status
            auto_archive: If True, archive tasks when marked done

        Returns:
            Updated task, or None if not found
        """
        task = self.storage.load_task(task_id)
        if not task:
            return None

        task.status = status
        task = self.storage.save_task(task)

        # Auto-archive completed tasks
        if auto_archive and status == TaskStatus.DONE:
            # Check if any other tasks depend on this one
            dependents = self.graph.get_dependents(task_id)
            if not dependents:
                self.storage.archive_task(task_id)

        return task

    def update_task(
        self,
        task_id: str,
        title: Optional[str] = None,
        description: Optional[str] = None,
        depends_on: Optional[List[str]] = None,
        tags: Optional[List[str]] = None,
        priority: Optional[int] = None,
        status: Optional[TaskStatus] = None
    ) -> Optional[Task]:
        """
        Update task fields.

        Args:
            task_id: ID of task to update
            **fields: Fields to update (None = no change)

        Returns:
            Updated task, or None if not found
        """
        task = self.storage.load_task(task_id)
        if not task:
            return None

        if title is not None:
            task.title = title
        if description is not None:
            task.description = description
        if depends_on is not None:
            task.depends_on = depends_on
        if tags is not None:
            task.tags = tags
        if priority is not None:
            task.priority = priority
        if status is not None:
            task.status = status

        return self.storage.save_task(task)

    def delete_task(self, task_id: str) -> bool:
        """Delete a task."""
        return self.storage.delete_task(task_id)

    def get_task(self, task_id: str) -> Optional[Task]:
        """Get a task by ID."""
        return self.storage.load_task(task_id)

    def list_tasks(
        self,
        status: Optional[TaskStatus] = None,
        tags: Optional[List[str]] = None
    ) -> List[Task]:
        """
        List all tasks with optional filters.

        Args:
            status: Filter by status
            tags: Filter by any matching tag

        Returns:
            List of matching tasks
        """
        tasks = self.storage.load_all_tasks()

        if status:
            tasks = [t for t in tasks if t.status == status]

        if tags:
            tag_set = set(tags)
            tasks = [t for t in tasks if tag_set & set(t.tags)]

        return tasks

    # -------------------------------------------------------------------------
    # DEPENDENCY OPERATIONS
    # -------------------------------------------------------------------------

    def list_ready_work(self) -> List[Task]:
        """
        Get all tasks ready to start (no blocking dependencies).

        This is the primary method for the agent to orient itself.
        """
        return self.graph.get_ready_tasks()

    def list_blocked(self) -> List[Tuple[Task, List[str]]]:
        """Get all blocked tasks with their blockers."""
        return self.graph.get_blocked_tasks()

    def check_consistency(self) -> Tuple[bool, List[str]]:
        """
        Verify task graph consistency.

        Returns:
            (is_valid, error_messages)
        """
        return self.graph.check_consistency()

    def get_task_chain(self, task_id: str) -> List[Task]:
        """Get full dependency chain for a task."""
        return self.graph.get_dependency_chain(task_id)

    def get_task_impact(self, task_id: str) -> List[Task]:
        """Get all tasks that depend on the given task."""
        return self.graph.get_dependents(task_id)

    # -------------------------------------------------------------------------
    # GIT OPERATIONS
    # -------------------------------------------------------------------------

    def commit(self, message: Optional[str] = None) -> bool:
        """
        Commit current task state to git.

        Args:
            message: Commit message. If None, generates one.

        Returns:
            True if committed successfully
        """
        if not message:
            tasks = self.storage.load_all_tasks()
            ready = len(self.list_ready_work())
            done = len([t for t in tasks if t.status == TaskStatus.DONE])
            message = f"Mission control: {len(tasks)} tasks ({ready} ready, {done} done)"

        return self.storage.commit_changes(message)

    def get_task_dir(self) -> str:
        """Return path to task directory."""
        return str(self.storage.get_task_dir())

    # -------------------------------------------------------------------------
    # SUMMARY
    # -------------------------------------------------------------------------

    def summary(self) -> Dict[str, Any]:
        """
        Get a summary of current mission status.

        Returns:
            Dict with counts and ready tasks
        """
        tasks = self.storage.load_all_tasks()
        is_consistent, errors = self.check_consistency()
        ready = self.list_ready_work()

        by_status = {}
        for status in TaskStatus:
            by_status[status.value] = len([t for t in tasks if t.status == status])

        return {
            "total_tasks": len(tasks),
            "by_status": by_status,
            "ready_count": len(ready),
            "ready_tasks": [{"id": t.id, "title": t.title, "priority": t.priority} for t in ready[:5]],
            "is_consistent": is_consistent,
            "consistency_errors": errors,
            "task_dir": str(self.storage.task_dir)
        }


# =============================================================================
# CONVENIENCE FUNCTIONS
# =============================================================================

def get_mission_control(project_path: Optional[str] = None) -> MissionControl:
    """Factory function to get a MissionControl instance."""
    return MissionControl(project_path)


# =============================================================================
# CLI INTERFACE (for testing)
# =============================================================================

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Mission Control CLI")
    parser.add_argument("command", choices=["list", "ready", "create", "status", "check"])
    parser.add_argument("--title", help="Task title (for create)")
    parser.add_argument("--depends", help="Comma-separated dependency IDs")
    parser.add_argument("--id", help="Task ID (for status)")
    parser.add_argument("--set-status", choices=["todo", "in_progress", "blocked", "done"])

    args = parser.parse_args()
    mc = MissionControl()

    if args.command == "list":
        tasks = mc.list_tasks()
        for t in tasks:
            print(f"[{t.status.value}] {t.id}: {t.title}")

    elif args.command == "ready":
        ready = mc.list_ready_work()
        if ready:
            print("Ready tasks:")
            for t in ready:
                print(f"  [{t.priority}] {t.id}: {t.title}")
        else:
            print("No tasks ready")

    elif args.command == "create":
        if not args.title:
            print("--title required")
        else:
            depends = args.depends.split(",") if args.depends else []
            task = mc.create_task(args.title, depends_on=depends)
            print(f"Created: {task.id}")

    elif args.command == "status":
        if args.id and args.set_status:
            status = TaskStatus(args.set_status)
            task = mc.update_task_status(args.id, status)
            if task:
                print(f"Updated {task.id} to {task.status.value}")
            else:
                print("Task not found")
        else:
            summary = mc.summary()
            print(json.dumps(summary, indent=2))

    elif args.command == "check":
        ok, errors = mc.check_consistency()
        if ok:
            print("Graph is consistent")
        else:
            print("Inconsistencies found:")
            for e in errors:
                print(f"  - {e}")
