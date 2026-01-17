#!/bin/bash
# PreToolUse hook for Glob/Grep - warn on broad searches
# Only triggers for searches that look like they're exploring broadly

read -r INPUT
PATTERN=$(echo "$INPUT" | jq -r '.tool_input.pattern // empty' 2>/dev/null)
PATH_ARG=$(echo "$INPUT" | jq -r '.tool_input.path // empty' 2>/dev/null)

# Only warn on broad searches (wildcards at root, or searching common names)
if echo "$PATTERN" | grep -qE '^\*\*/' && [ -z "$PATH_ARG" -o "$PATH_ARG" = "/" -o "$PATH_ARG" = "/Users/bard" ]; then
  cat << 'EOF'
<search-warning>
Broad search detected. Check /Users/bard/Code/docs/MIKEY_AGENT_ARCHITECTURE.md first - it has known project locations.
</search-warning>
EOF
fi

echo '{"decision": "allow"}'
exit 0
