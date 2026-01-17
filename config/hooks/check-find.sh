#!/bin/bash
# PreToolUse hook for Bash - warns against using find before locate
# Reads the command from stdin

read -r INPUT
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)

if echo "$COMMAND" | grep -qE '^\s*find\s+'; then
  cat << 'EOF'
{
  "decision": "block",
  "reason": "STOP: You're using 'find' directly. Per CLAUDE.md search hierarchy:\n1. Check architecture docs first\n2. Use 'locate' for fast indexed search\n3. Only use 'find' as last resort\n\nTry: locate <pattern> | grep <filter>"
}
EOF
  exit 0
fi

echo '{"decision": "allow"}'
exit 0
