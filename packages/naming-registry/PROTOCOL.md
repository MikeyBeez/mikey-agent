# Mikey Naming Linter Protocol

## Trigger Conditions

Run the linter when:
- Creating a new MCP server
- Adding new tools to an existing server
- Renaming any tool or server
- Before committing changes to MCP tool code
- When reviewing someone else's MCP code
- Starting work on any file in `/Users/bard/Code/mcp-*` or `/Users/bard/Code/claude-*`

## Quick Reference

```bash
cd /Users/bard/Code/mikey-naming-registry

# Check a specific file or directory
node lint.js /path/to/file-or-directory

# Check all registered servers
npm run lint

# Generate compliance report
npm run report
```

## Protocol Steps

### When Creating a New Tool

1. **Choose the name** using `mikey_` prefix:
   ```
   mikey_<domain>_<action>
   ```
   Examples: `mikey_vault_search`, `mikey_project_create`

2. **Check for conflicts** before implementing:
   ```bash
   grep -r "your_proposed_name" /Users/bard/Code/mikey-naming-registry/registry.json
   ```

3. **Implement the tool** in your MCP server

4. **Run the linter** on your file:
   ```bash
   node /Users/bard/Code/mikey-naming-registry/lint.js /path/to/your/file.js
   ```

5. **Add to registry** if it passes:
   - Open `/Users/bard/Code/mikey-naming-registry/registry.json`
   - Add your tool name to the appropriate server's `tools` array

### When Creating a New MCP Server

1. **Name the server** with `mikey-` prefix:
   ```
   mikey-<purpose>
   ```
   Examples: `mikey-vault`, `mikey-analytics`

2. **Add server entry** to registry.json:
   ```json
   "mikey-newserver": {
     "path": "/Users/bard/Code/mcp-newserver/src/index.js",
     "description": "Brief description",
     "tools": []
   }
   ```

3. **Add to Claude Desktop config** (`claude_desktop_config.json`):
   ```json
   "mikey-newserver": {
     "command": "node",
     "args": ["/Users/bard/Code/mcp-newserver/src/index.js"]
   }
   ```

4. **Implement tools** following the naming convention

5. **Run full lint** before deployment:
   ```bash
   npm run lint
   ```

## Naming Rules

| Type | Prefix | Pattern | Example |
|------|--------|---------|---------|
| Tools | `mikey_` | `mikey_<noun>_<verb>` | `mikey_state_get` |
| Servers | `mikey-` | `mikey-<purpose>` | `mikey-brain` |
| Protocols | `mikey_protocol_` | `mikey_protocol_<action>` | `mikey_protocol_read` |

## Forbidden Patterns

Never use these prefixes (high collision risk):
- `brain_` - conflicts with AI internals
- `state_` - generic state management
- `manager_` - generic management
- `protocol_` - MCP internals
- `execute` - conflicts with Bash tools
- `help` - universal command
- `init` - generic initialization
- `search` - too generic
- `analyze` - too generic

## Error Resolution

### "Tool uses reserved prefix"
```
❌ Tool 'brain_foo' uses reserved prefix. Should be 'mikey_foo'
```
**Fix:** Rename the tool from `brain_foo` to `mikey_foo`

### "High collision risk"
```
❌ Tool 'state_set' has high collision risk
```
**Fix:** Add `mikey_` prefix: `mikey_state_set`

### "Not in canonical registry"
```
ℹ️ Tool 'mikey_new_tool' is not in the canonical registry
```
**Fix:** Add it to `registry.json` under the appropriate server

## Git Hook Integration (Optional)

Add to `.git/hooks/pre-commit`:
```bash
#!/bin/bash
echo "Running Mikey naming linter..."
node /Users/bard/Code/mikey-naming-registry/lint.js /Users/bard/Code/claude-brain
node /Users/bard/Code/mikey-naming-registry/lint.js /Users/bard/Code/mcp-brain-manager
node /Users/bard/Code/mikey-naming-registry/lint.js /Users/bard/Code/mcp-protocols

if [ $? -ne 0 ]; then
  echo "Lint failed. Fix naming issues before committing."
  exit 1
fi
```

## Maintenance

- **Registry location:** `/Users/bard/Code/mikey-naming-registry/registry.json`
- **Linter location:** `/Users/bard/Code/mikey-naming-registry/lint.js`
- **Update registry** whenever tools are added, renamed, or removed
- **Run `npm run report`** periodically to verify system state
