# Hooks System Guide

The hooks system provides automatic behaviors triggered by Claude Code events.

## Configuration

Hooks are configured in `~/.claude/settings.json`:

```json
{
  "model": "opus",
  "hooks": {
    "UserPromptSubmit": [
      {
        "type": "command",
        "command": "bash ~/.claude/hooks/prompt-submit.sh"
      }
    ],
    "PreToolUse": [
      {
        "type": "command",
        "command": "bash ~/.claude/hooks/check-find.sh",
        "matcher": {"tool_name": "Bash"}
      },
      {
        "type": "command",
        "command": "bash ~/.claude/hooks/check-search.sh",
        "matcher": {"tool_name": "Grep"}
      }
    ],
    "Stop": [
      {
        "type": "command",
        "command": "bash ~/.claude/hooks/session-stop.sh"
      }
    ]
  }
}
```

## Hook Types

### UserPromptSubmit

Runs on every user message. Used for protocol detection and state tracking.

**Files:**
- `prompt-submit.sh` — Main hook script
- `prompt-processor.js` — Node.js processor for keyword matching

**Output format:**
```
<prompt-hook prompt="42">
Load protocols: error-recovery, create-project
Use: mikey_protocol_read <id>
After loading: ~/.claude/hooks/mark-protocol-loaded.sh <id>
Reloading (expired):
  - error-recovery (expired after 15 prompts)
Recently loaded (skipping):
  - naming-linter (loaded 3 prompts ago, fresh for 7 more)
</prompt-hook>
```

### PreToolUse

Runs before specific tools execute. Used for safety checks.

**check-find.sh** — Blocks the `find` command:
```bash
# Prefer locate for performance
locate "*.ts" | head -20
# Instead of
find . -name "*.ts"
```

**check-search.sh** — Warns on broad searches (no path specified).

### Stop

Runs when session ends. Provides reminders.

## Protocol State Tracking

State is stored in `~/.claude/state/protocol-state.json`:

```json
{
  "promptCount": 42,
  "protocols": {
    "error-recovery": 35,
    "create-project": 28
  }
}
```

### How It Works

1. **Prompt counter** — Increments on every user prompt
2. **Load tracking** — Records prompt number when each protocol was loaded
3. **Expiry check** — Protocol expires after 10 prompts
4. **Reload suggestion** — Expired protocols are suggested for reload

### Marking Protocols Loaded

After loading a protocol, mark it:

```bash
~/.claude/hooks/mark-protocol-loaded.sh error-recovery
# Output: Marked error-recovery as loaded at prompt 42
```

## Trigger Keywords

The prompt processor matches these keywords to protocols:

| Keywords | Protocols |
|----------|-----------|
| error, failed, broken, bug, fix | error-recovery |
| create project, new project, scaffold | create-project |
| medium, blog post, write article | medium-article, document-writing |
| protocol | protocol-writing, protocol-lifecycle |
| architecture, moved, relocated | architecture-update |
| mcp, tool | naming-linter, mcp-permissions |
| audit, system audit | system-audit |

## Customizing Hooks

### Adding New Trigger Keywords

Edit `~/.claude/hooks/prompt-processor.js`:

```javascript
const TRIGGER_KEYWORDS = {
  // Add your keyword
  'my-keyword': ['my-protocol'],
  // ...existing keywords
};
```

### Changing Expiry Time

Edit `prompt-processor.js`:

```javascript
const RELOAD_AFTER_PROMPTS = 10;  // Change this value
```

### Adding New Hooks

1. Create the script in `~/.claude/hooks/`
2. Make it executable: `chmod +x ~/.claude/hooks/my-hook.sh`
3. Add to `~/.claude/settings.json`

## Troubleshooting

### Hook not running

1. Check settings.json syntax: `cat ~/.claude/settings.json | jq .`
2. Restart Claude Code
3. Test manually: `echo '{"prompt": "test"}' | bash ~/.claude/hooks/prompt-submit.sh`

### Protocol keeps reloading

Check the state file:
```bash
cat ~/.claude/state/protocol-state.json
```

The protocol should be marked with a recent prompt number.

### Hook errors

Check stderr in the hook output. Common issues:
- `jq` not installed
- Node.js not in PATH
- File permissions

## Quick Reference

| Action | Command |
|--------|---------|
| Test prompt hook | `echo '{"prompt": "error"}' \| bash ~/.claude/hooks/prompt-submit.sh` |
| Mark protocol loaded | `~/.claude/hooks/mark-protocol-loaded.sh <id>` |
| Check state | `cat ~/.claude/state/protocol-state.json` |
| Reset state | `rm ~/.claude/state/protocol-state.json` |
