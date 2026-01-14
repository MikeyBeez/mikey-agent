// Naming Linter Protocol - Modular data file
module.exports = {
  id: 'naming-linter',
  name: 'Naming Linter Protocol',
  version: '1.0.0',
  tier: 2,
  purpose: 'Ensure consistent mikey_ naming across all MCP tools to prevent collisions',
  triggers: [
    'Creating a new MCP server',
    'Adding new tools to an existing server',
    'Renaming any tool or server',
    'Before committing changes to MCP tool code',
    'Reviewing MCP code',
    'Starting work on any file in mcp-* or claude-* directories'
  ],
  status: 'active',
  location: '/Users/bard/Code/mikey-naming-registry/PROTOCOL.md',
  content: `# Naming Linter Protocol v1.0.0

## Trigger Conditions (MUST ACTIVATE)
- **WHEN**: Creating a new MCP server
- **WHEN**: Adding new tools to an existing server
- **WHEN**: Renaming any tool or server
- **WHEN**: Before committing changes to MCP tool code
- **WHEN**: Reviewing MCP code
- **WHEN**: Starting work on any file in mcp-* or claude-* directories
- **IMMEDIATE**: Yes - naming violations cause runtime collisions
- **PRIORITY**: High

## Core Principle
"Namespace everything" - All custom tools must use the mikey_ prefix to avoid collision with Anthropic's built-in tools.

## Quick Commands

\`\`\`bash
cd /Users/bard/Code/mikey-naming-registry

# Check a specific file or directory
node lint.js /path/to/file-or-directory

# Check all registered servers
npm run lint

# Generate compliance report
npm run report
\`\`\`

## Naming Rules

| Type | Prefix | Pattern | Example |
|------|--------|---------|---------|
| Tools | mikey_ | mikey_<noun>_<verb> | mikey_state_get |
| Servers | mikey- | mikey-<purpose> | mikey-brain |
| Protocols | mikey_protocol_ | mikey_protocol_<action> | mikey_protocol_read |

## Forbidden Patterns (High Collision Risk)

Never use these prefixes without mikey_:
- brain_ - conflicts with AI internals
- state_ - generic state management
- manager_ - generic management
- protocol_ - MCP internals
- execute - conflicts with Bash tools
- help - universal command
- init - generic initialization
- search - too generic
- analyze - too generic

## Protocol Steps

### When Creating a New Tool

1. **Choose the name** using mikey_ prefix
2. **Check for conflicts**: grep registry.json for proposed name
3. **Implement the tool** in your MCP server
4. **Run the linter**: node lint.js /path/to/your/file.js
5. **Add to registry** if it passes

### When Creating a New MCP Server

1. **Name the server** with mikey- prefix
2. **Add server entry** to registry.json
3. **Add to Claude Desktop config**
4. **Implement tools** following naming convention
5. **Run full lint** before deployment

## Error Resolution

### "Tool uses reserved prefix"
**Fix:** Rename from brain_foo to mikey_foo

### "High collision risk"
**Fix:** Add mikey_ prefix

### "Not in canonical registry"
**Fix:** Add tool to registry.json

## Registry Location
/Users/bard/Code/mikey-naming-registry/registry.json

## Integration with Other Protocols
- **Error Recovery Protocol**: When lint fails, follow error resolution steps
- **Progress Communication Protocol**: Report lint status during code reviews
- **Common Sense Protocol**: Simple naming prevents complex debugging

---
**Status**: Active Foundation Protocol - v1.0.0`
};
