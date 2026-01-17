# Mikey Agent Setup Guide

How to build the Mikey Agent system from scratch.

## Overview

Mikey Agent is a self-improving AI agent system composed of several MCP servers. This guide walks you through cloning the repos and configuring Claude Code.

## Prerequisites

- macOS (tested on Darwin 25.x)
- Node.js 18+
- Python 3.9+
- Claude Code CLI
- Git

## Step 1: Create Directory Structure

```bash
mkdir -p ~/Code/Claude_Data/brain
cd ~/Code
```

## Step 2: Clone Component Repos

```bash
# Core brain system (memory, state, reflection)
git clone https://github.com/mikeybeez/claude-brain.git

# Protocol system (operational protocols, chunked execution)
git clone https://github.com/mikeybeez/mcp-protocols.git

# Manager (projects, reminders, workflows)
git clone https://github.com/mikeybeez/mikey-manager.git

# This repo (mission-control for task dependencies)
git clone https://github.com/mikeybeez/mikey-agent.git
```

## Step 3: Install Dependencies

### claude-brain
```bash
cd ~/Code/claude-brain
npm install
```

### mcp-protocols
```bash
cd ~/Code/mcp-protocols
npm install
```

### mikey-manager
```bash
cd ~/Code/mikey-manager
npm install
```

### mission-control
```bash
cd ~/Code/mikey-agent/packages/mission-control
python3 -m venv .venv
source .venv/bin/activate
pip install pydantic mcp
```

## Step 4: Configure Claude Code

Add the following to `~/.claude.json` in the `mcpServers` section:

```json
{
  "mcpServers": {
    "mikey-brain": {
      "command": "node",
      "args": ["/Users/YOUR_USERNAME/Code/claude-brain/index.js"]
    },
    "mikey-protocols": {
      "command": "node",
      "args": ["/Users/YOUR_USERNAME/Code/mcp-protocols/src/index.js"]
    },
    "mikey-manager": {
      "command": "node",
      "args": ["/Users/YOUR_USERNAME/Code/mikey-manager/src/index.js"]
    },
    "mission-control": {
      "command": "/Users/YOUR_USERNAME/Code/mikey-agent/packages/mission-control/.venv/bin/python3",
      "args": ["/Users/YOUR_USERNAME/Code/mikey-agent/packages/mission-control/src/server.py"]
    }
  }
}
```

Replace `YOUR_USERNAME` with your actual username.

## Step 5: Configure Hooks

### Create hooks directory
```bash
mkdir -p ~/.claude/hooks ~/.claude/state
```

### Copy hook scripts
```bash
cp ~/Code/mikey-agent/config/hooks/* ~/.claude/hooks/
chmod +x ~/.claude/hooks/*.sh
```

### Configure settings.json
```bash
cp ~/Code/mikey-agent/config/settings.json.template ~/.claude/settings.json
```

The hooks provide:
- **UserPromptSubmit**: Protocol detection with prompt-count expiry
- **PreToolUse**: Block `find` (use `locate`), warn on broad searches
- **Stop**: End-of-session reminders

## Step 6: Create CLAUDE.md

Copy the template from this repo:

```bash
cp ~/Code/mikey-agent/config/CLAUDE.md.template ~/.claude/CLAUDE.md
```

Edit to customize for your setup.

## Step 7: Restart Claude Code

```bash
# Exit any running Claude Code session
claude
```

## Step 8: Verify Installation

In Claude Code, run:

```
mikey_init
mikey_status detailed=true
mikey_task_summary
```

You should see:
- Brain initialized with memory count
- Protocol system active
- Mission control operational

## Component Overview

| Component | Purpose | Repo |
|-----------|---------|------|
| **claude-brain** | Memory, state, reflection, proposals | mikeybeez/claude-brain |
| **mcp-protocols** | Protocol library, chunked execution, tracking | mikeybeez/mcp-protocols |
| **mikey-manager** | Projects, reminders, workflows, dashboards | mikeybeez/mikey-manager |
| **mission-control** | Task dependencies, ready queues | mikeybeez/mikey-agent |

## Data Locations

| Data | Location |
|------|----------|
| Brain database | `~/Code/Claude_Data/brain/brain.db` |
| Task files | `.mikey_tasks/` in project root |
| Session status | `~/Code/docs/session-status.md` |
| MCP logs | `~/Library/Logs/Claude/` |
| Hook state | `~/.claude/state/protocol-state.json` |
| Hook scripts | `~/.claude/hooks/` |
| Hooks config | `~/.claude/settings.json` |

## Troubleshooting

### MCP server not loading
Check logs at `~/Library/Logs/Claude/mcp-server-*.log`

### Brain database empty
Verify path in `~/Code/claude-brain/config.js` points to `~/Code/Claude_Data/brain/brain.db`

### Tools not found
Restart Claude Code after config changes

## Optional: Additional MCP Servers

The full system includes additional utility servers. See `config/claude.json.full` for the complete configuration with:
- filesystem-enhanced
- tracked-search
- playwright
- git
- database
- And more...

## License

MIT
