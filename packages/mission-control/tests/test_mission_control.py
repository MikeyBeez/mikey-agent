#!/usr/bin/env python3
"""Tests for Mission Control."""

import os
import sys
import tempfile
import pytest

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from mission_control import MissionControl, TaskStatus, Task


@pytest.fixture
def mc():
    """Create a MissionControl instance in a temp directory."""
    with tempfile.TemporaryDirectory() as tmpdir:
        os.makedirs(os.path.join(tmpdir, '.mikey_tasks'))
        yield MissionControl(tmpdir)


class TestTaskCreation:
    """Test task creation and basic operations."""

    def test_create_task(self, mc):
        """Test basic task creation."""
        task = mc.create_task("Test task")
        assert task.id.startswith("m-")
        assert task.title == "Test task"
        assert task.status == TaskStatus.TODO

    def test_create_task_with_dependencies(self, mc):
        """Test creating tasks with dependencies."""
        t1 = mc.create_task("First task")
        t2 = mc.create_task("Second task", depends_on=[t1.id])

        assert t1.id in t2.depends_on

    def test_create_task_with_priority(self, mc):
        """Test task priority."""
        low = mc.create_task("Low priority", priority=1)
        high = mc.create_task("High priority", priority=10)

        assert low.priority == 1
        assert high.priority == 10


class TestReadyQueue:
    """Test the ready task queue logic."""

    def test_task_with_no_deps_is_ready(self, mc):
        """Task with no dependencies should be ready."""
        task = mc.create_task("No deps")
        ready = mc.list_ready_work()

        assert len(ready) == 1
        assert ready[0].id == task.id

    def test_task_with_incomplete_deps_not_ready(self, mc):
        """Task with incomplete dependencies should not be ready."""
        t1 = mc.create_task("First")
        t2 = mc.create_task("Second", depends_on=[t1.id])

        ready = mc.list_ready_work()

        assert len(ready) == 1
        assert ready[0].id == t1.id  # Only t1 is ready

    def test_completing_dep_makes_task_ready(self, mc):
        """Completing a dependency should make dependent task ready."""
        t1 = mc.create_task("First")
        t2 = mc.create_task("Second", depends_on=[t1.id])

        mc.update_task_status(t1.id, TaskStatus.DONE)
        ready = mc.list_ready_work()

        assert len(ready) == 1
        assert ready[0].id == t2.id

    def test_ready_sorted_by_priority(self, mc):
        """Ready tasks should be sorted by priority (highest first)."""
        low = mc.create_task("Low", priority=1)
        high = mc.create_task("High", priority=10)
        med = mc.create_task("Med", priority=5)

        ready = mc.list_ready_work()

        assert [t.priority for t in ready] == [10, 5, 1]


class TestDependencyGraph:
    """Test dependency graph operations."""

    def test_no_cycles_in_simple_chain(self, mc):
        """A simple chain should have no cycles."""
        t1 = mc.create_task("First")
        t2 = mc.create_task("Second", depends_on=[t1.id])
        t3 = mc.create_task("Third", depends_on=[t2.id])

        ok, errors = mc.check_consistency()
        assert ok
        assert len(errors) == 0

    def test_detect_direct_cycle(self, mc):
        """Should detect a direct cycle (A -> B -> A)."""
        t1 = mc.create_task("A")
        t2 = mc.create_task("B", depends_on=[t1.id])
        mc.update_task(t1.id, depends_on=[t2.id])

        ok, errors = mc.check_consistency()
        assert not ok
        assert len(errors) > 0
        assert "Circular dependency" in errors[0]

    def test_detect_indirect_cycle(self, mc):
        """Should detect an indirect cycle (A -> B -> C -> A)."""
        t1 = mc.create_task("A")
        t2 = mc.create_task("B", depends_on=[t1.id])
        t3 = mc.create_task("C", depends_on=[t2.id])
        mc.update_task(t1.id, depends_on=[t3.id])

        ok, errors = mc.check_consistency()
        assert not ok

    def test_detect_missing_dependency(self, mc):
        """Should detect references to non-existent tasks."""
        mc.create_task("Orphan", depends_on=["nonexistent-id"])

        ok, errors = mc.check_consistency()
        assert not ok
        assert "non-existent" in errors[0]


class TestTaskStorage:
    """Test JSONL storage operations."""

    def test_tasks_persist(self, mc):
        """Tasks should persist across MissionControl instances."""
        t1 = mc.create_task("Persistent task")
        task_id = t1.id
        task_dir = mc.get_task_dir()

        # Create new instance
        mc2 = MissionControl(os.path.dirname(task_dir))
        t2 = mc2.get_task(task_id)

        assert t2 is not None
        assert t2.title == "Persistent task"

    def test_delete_task(self, mc):
        """Deleted tasks should be removed."""
        task = mc.create_task("To delete")
        task_id = task.id

        assert mc.delete_task(task_id)
        assert mc.get_task(task_id) is None

    def test_update_task(self, mc):
        """Task updates should persist."""
        task = mc.create_task("Original", priority=5)
        mc.update_task(task.id, title="Updated", priority=8)

        updated = mc.get_task(task.id)
        assert updated.title == "Updated"
        assert updated.priority == 8


class TestSummary:
    """Test summary generation."""

    def test_summary_counts(self, mc):
        """Summary should show correct counts."""
        mc.create_task("Todo 1")
        mc.create_task("Todo 2")
        t3 = mc.create_task("Will be done")
        # Create a task that depends on t3 so it doesn't get auto-archived
        mc.create_task("Depends on t3", depends_on=[t3.id])
        mc.update_task_status(t3.id, TaskStatus.DONE, auto_archive=False)

        summary = mc.summary()

        assert summary["total_tasks"] == 4
        assert summary["by_status"]["todo"] == 3
        assert summary["by_status"]["done"] == 1


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
