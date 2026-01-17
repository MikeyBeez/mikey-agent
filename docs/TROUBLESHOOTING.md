# Troubleshooting Guide

Common issues and solutions for Mikey Agent.

## MCP Server Issues

### Server not connecting

**Symptoms:**
- Tools not available
- "Server disconnected" errors

**Solutions:**

1. Check server logs:
```bash
ls -la ~/Library/Logs/Claude/
tail -50 ~/Library/Logs/Claude/mcp-server-*.log | grep -i error
```

2. Verify server path in `~/.claude.json`

3. Check if server builds:
```bash
cd ~/Code/<server-name>
npm install
npm run build
```

4. Test server directly:
```bash
node ~/Code/<server-name>/dist/index.js
```

### "Cannot find module" error

**Cause:** Server was moved or dependencies missing.

**Solution:**
```bash
cd ~/Code/<server-name>
npm install
npm run build
```

### Server crashes on startup

**Check logs:**
```bash
tail -100 ~/Library/Logs/Claude/mcp-server-<name>.log
```

**Common causes:**
- Missing environment variables
- Database file locked
- Port already in use

## Hooks Issues

### Hook not running

**Verify configuration:**
```bash
cat ~/.claude/settings.json | jq .hooks
```

**Test manually:**
```bash
echo '{"prompt": "test error"}' | bash ~/.claude/hooks/prompt-submit.sh
```

**Check file permissions:**
```bash
ls -la ~/.claude/hooks/
chmod +x ~/.claude/hooks/*.sh
```

### Protocol loading loop

**Symptom:** Same protocol keeps being suggested.

**Cause:** `mark-protocol-loaded.sh` not being called.

**Solution:** After loading a protocol, run:
```bash
~/.claude/hooks/mark-protocol-loaded.sh <protocol-id>
```

### State file corrupted

**Reset state:**
```bash
rm ~/.claude/state/protocol-state.json
```

State will be recreated on next prompt.

## Memory Issues

### mikey_recall returns nothing

**Check database exists:**
```bash
ls -la ~/Code/Claude_Data/brain/brain.db
```

**Test query:**
```
mikey_recall query="test" limit=5
```

**Check stats:**
```
mikey_stats
```

### mikey_init fails

**Check database permissions:**
```bash
ls -la ~/Code/Claude_Data/brain/
```

**Reinitialize:**
```
mikey_init reload=true
```

## Task Issues

### Tasks not showing in ready queue

**Check task status:**
```
mikey_list_tasks
```

**Verify dependencies:**
```
mikey_get_task task_id="m-abc123" include_chain=true
```

**Check for circular dependencies:**
```
mikey_check_consistency
```

### Tasks file corrupted

**Check file:**
```bash
cat .mikey_tasks/tasks.jsonl | head -5
```

**Validate JSON:**
```bash
cat .mikey_tasks/tasks.jsonl | jq -c . > /dev/null
```

## Protocol Issues

### Protocol not found

**List available protocols:**
```
mikey_protocol_list
```

**Search by keyword:**
```
mikey_protocol_search query="error"
```

### Protocol content seems outdated

**Reload from source:**
```
mikey_protocol_read <id>
```

**Check protocol file:**
```bash
cat ~/Code/mcp-protocols/src/protocols/*/<id>.js
```

## Performance Issues

### Slow responses

**Reduce context:**
- Clear old state: `rm ~/.claude/state/*`
- Use focused recalls: `mikey_recall query="specific" limit=3`

**Check MCP server health:**
```
mikey_status detailed=true
```

### High memory usage

**Check brain database size:**
```bash
ls -lh ~/Code/Claude_Data/brain/brain.db
```

**Consolidate memories:**
```
mikey_consolidate mode="analyze"
```

## Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Hooks not working | Restart Claude Code |
| Protocol loop | `rm ~/.claude/state/protocol-state.json` |
| Server error | Check `~/Library/Logs/Claude/` |
| Tasks stuck | `mikey_check_consistency` |
| Memory issues | `mikey_init reload=true` |

## Getting Help

1. Check logs: `~/Library/Logs/Claude/`
2. Check brain status: `mikey_status detailed=true`
3. Check task status: `mikey_task_summary`
4. Read architecture: `~/Code/docs/MIKEY_AGENT_ARCHITECTURE.md`
