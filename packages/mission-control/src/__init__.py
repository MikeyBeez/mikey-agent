"""
Mikey Mission Control - Task Dependency System

Exports:
    - MissionControl: Main API class
    - Task: Task model
    - TaskStatus: Status enum
    - get_mission_control: Factory function
"""

from .mission_control import (
    MissionControl,
    Task,
    TaskStatus,
    GitMetadata,
    TaskStorage,
    DependencyGraph,
    get_mission_control,
)

__all__ = [
    "MissionControl",
    "Task",
    "TaskStatus",
    "GitMetadata",
    "TaskStorage",
    "DependencyGraph",
    "get_mission_control",
]

__version__ = "0.1.0"
