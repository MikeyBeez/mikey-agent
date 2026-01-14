# Tool Selection Protocol

## Purpose
Systematic guidance for selecting the correct tool for command execution and avoiding containerized tool limitations.

## Status: **Active Foundation Protocol**
- **Tier**: 2 (Foundation)
- **Version**: 1.0.0
- **Priority**: Critical

## Trigger Conditions (MUST ACTIVATE)

Activate this protocol when:
- **WHEN**: Need to execute any bash/shell command
- **WHEN**: Need to run CLI tools (gh, npm, uv, git with auth, etc.)
- **WHEN**: Need to access user's actual filesystem
- **WHEN**: bash_tool returns "command not found" or "cannot access"
- **WHEN**: Need to run Python scripts that use user's packages/environment
- **IMMEDIATE**: Yes - must select correct tool before execution
- **PRIORITY**: Critical

## Core Principle

**"Use brain_execute for user environment access, NOT bash_tool"**

The bash_tool runs in a **containerized environment** that:
- ❌ Cannot access user's actual filesystem paths
- ❌ Does not have CLI tools installed (gh, npm, uv, etc.)
- ❌ Cannot authenticate with git/GitHub
- ❌ Has limited and different PATH
- ❌ Cannot access user's Python packages/environments

## Tool Selection Decision Tree

```
Need to execute command?
│
├─ Is it a bash/shell command?
│  ├─ Does it need user's filesystem? → brain_execute
│  ├─ Does it need CLI tools (gh, npm, uv)? → brain_execute  
│  ├─ Does it need git authentication? → brain_execute
│  └─ Simple container command only? → bash_tool (rare)
│
├─ Is it a Python script?
│  ├─ Needs user's packages/environment? → brain_execute
│  └─ Pure Python, no dependencies? → bash_tool or brain_execute
│
└─ Is it file operations?
   ├─ Needs actual filesystem access? → brain_execute or filesystem tools
   └─ Just reading/writing? → filesystem tools preferred
```

## Required Tool: brain_execute

### Syntax
```python
brain:brain_execute(
    code="your command here",
    description="what this does",
    language="shell"  # or "python"
)
```

### When to Use brain_execute (Shell)
✅ **Always use for**:
- Git operations requiring authentication
- CLI tools: `gh`, `npm`, `uv`, `yarn`, etc.
- File operations on user's filesystem
- Running scripts that need user's environment
- Any command that bash_tool says "not found"

### Examples

**✅ Correct - Use brain_execute**:
```python
# GitHub CLI
brain:brain_execute(
    code="gh repo create my-repo --public",
    language="shell"
)

# Git with authentication  
brain:brain_execute(
    code="cd /Users/bard/Code/project && git push origin main",
    language="shell"
)

# NPM commands
brain:brain_execute(
    code="cd /Users/bard/Code/project && npm install",
    language="shell"
)

# UV package manager
brain:brain_execute(
    code="uv pip install torch numpy",
    language="shell"
)
```

**❌ Wrong - Don't use bash_tool**:
```python
# This will fail - containerized environment
bash_tool(command="gh repo create my-repo")  # gh not found

# This will fail - can't access filesystem
bash_tool(command="cd /Users/bard/Code/project && git push")  # auth fails
```

## When bash_tool IS Appropriate (Rare)

Use bash_tool **ONLY** for:
- Simple commands that don't need user environment
- Testing command syntax
- Container-only operations

**Rule**: If you're unsure, use brain_execute. It always works for what bash_tool does, plus much more.

## Error Recovery

### If bash_tool fails with "command not found"
Immediately retry with brain_execute:
```python
# ❌ bash_tool failed
bash_tool(command="gh --version")
# Error: /bin/sh: 1: gh: not found

# ✅ Immediately retry with brain_execute
brain:brain_execute(code="gh --version", language="shell")
```

### If bash_tool fails with "cannot access"
Switch to brain_execute:
```python
# ❌ bash_tool failed
bash_tool(command="cd /Users/bard/Code && ls")
# Error: cannot cd to /Users/bard/Code

# ✅ Use brain_execute
brain:brain_execute(code="cd /Users/bard/Code && ls", language="shell")
```

## Tool Capabilities Reference

### brain_execute (Shell)
- ✅ User's actual filesystem
- ✅ All installed CLI tools
- ✅ Git authentication
- ✅ Python user environment
- ✅ Network access
- ✅ Full system access

### bash_tool
- ⚠️ Container filesystem only
- ❌ No CLI tools (gh, npm, uv)
- ❌ No git authentication
- ⚠️ Limited Python (no user packages)
- ✅ Basic shell commands
- ⚠️ Isolated environment

## Common Scenarios

### Creating GitHub Repository
```python
brain:brain_execute(
    code="gh repo create my-project --public --description 'Description'",
    description="Create GitHub repository",
    language="shell"
)
```

### Git Push with Authentication
```python
brain:brain_execute(
    code="cd /Users/bard/Code/project && git push -u origin main",
    description="Push to GitHub",
    language="shell"
)
```

### Install Python Packages
```python
brain:brain_execute(
    code="uv pip install torch numpy pandas",
    description="Install packages with uv",
    language="shell"
)
```

### Run Project Scripts
```python
brain:brain_execute(
    code="cd /Users/bard/Code/project && python run_experiment.py",
    description="Run experiment script",
    language="shell"
)
```

## Quality Checks

Before executing commands, verify:
- ✅ Using brain_execute for user environment access
- ✅ Not using bash_tool for CLI tools or user filesystem
- ✅ Have fallback plan if operation fails
- ✅ Understand which environment the command needs

## Anti-Patterns to Avoid

🚫 **The Container Trap** - Using bash_tool for user environment commands
🚫 **The Tool Switcher** - Switching between tools randomly
🚫 **The Auth Forgetter** - Using bash_tool for git operations needing auth
🚫 **The Path Assumer** - Assuming container paths match user paths

---

**Remember**: When in doubt, use brain_execute. It's the universal solution for actual system access.

**Created**: 2025-11-02
**Status**: Active - Critical Foundation Protocol
