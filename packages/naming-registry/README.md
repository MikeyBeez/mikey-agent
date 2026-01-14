# Mikey Naming Registry

Canonical naming registry and linter for Mikey's MCP tools. Prevents namespace collisions with Anthropic's built-in tools.

## Why This Exists

Anthropic's Claude has built-in tools that can collide with custom MCP tool names. For example:
- `brain_execute` could conflict with Anthropic's sandbox execution
- `state_set` is a generic name that could be used by multiple systems
- `help` is universal

This registry enforces the `mikey_` prefix convention and provides linting to catch violations.

## Quick Start

```bash
# Run full lint on all registered servers
npm run lint

# Generate compliance report
npm run report

# Lint a specific directory
node lint.js /path/to/mcp-server
```

## Naming Conventions

| Type | Prefix | Example |
|------|--------|---------|
| Tools | `mikey_` | `mikey_remember`, `mikey_state_set` |
| Servers | `mikey-` | `mikey-brain`, `mikey-manager` |
| Protocols | `mikey_protocol_` | `mikey_protocol_read` |

## Reserved Prefixes (Don't Use)

These prefixes are reserved and will cause collisions:
- `brain_` - Could conflict with AI internals
- `state_` - Generic state management
- `manager_` - Generic management
- `protocol_` - MCP protocol internals

## Registry Structure

The `registry.json` file contains:
- **servers**: All registered MCP servers with their tools
- **namingConventions**: Canonical prefixes and rules
- **collisionRisks**: Known risky patterns
- **linterRules**: Automated validation rules

## Adding New Tools

1. Add the tool to your MCP server with `mikey_` prefix
2. Register it in `registry.json` under the appropriate server
3. Run `npm run lint` to verify

## Linter Rules

| Rule | Severity | Description |
|------|----------|-------------|
| requireMikeyPrefix | error | Custom tools must use `mikey_` |
| noReservedPrefixes | error | Can't use `brain_`, `state_`, etc. |
| noGenericNames | warning | `help`, `init`, etc. need prefix |
| notRegistered | info | Tool not in canonical registry |

## Integration with Git Hooks

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
node /Users/bard/Code/mikey-naming-registry/lint.js --scan-all
```

## Files

- `registry.json` - Canonical names and configuration
- `lint.js` - Linter script
- `package.json` - npm scripts for easy running
