#!/bin/bash
# User Prompt Submit Hook - protocol detection with prompt-count-based expiry
# Calls prompt-processor.js to detect needed protocols

HOOKS_DIR="$HOME/.claude/hooks"
STATE_DIR="$HOME/.claude/state"

# Ensure state dir exists
mkdir -p "$STATE_DIR"

# Read input (contains prompt)
read -r INPUT

# Run processor
RESULT=$(echo "$INPUT" | node "$HOOKS_DIR/prompt-processor.js" 2>/dev/null)

if [ -z "$RESULT" ]; then
  exit 0
fi

# Parse result
SKIP=$(echo "$RESULT" | jq -r '.skip // false')
PROMPT_COUNT=$(echo "$RESULT" | jq -r '.promptCount // 0')
TO_LOAD=$(echo "$RESULT" | jq -r '.toLoad // []')
TO_LOAD_STR=$(echo "$TO_LOAD" | jq -r 'if length > 0 then join(", ") else "" end')
SKIPPED=$(echo "$RESULT" | jq -r '.skipped // []')
EXPIRED=$(echo "$RESULT" | jq -r '.expired // []')

if [ "$SKIP" = "true" ]; then
  exit 0
fi

# Only output if there's something to load or skip
HAS_TO_LOAD=$(echo "$TO_LOAD" | jq 'length > 0')
HAS_SKIPPED=$(echo "$SKIPPED" | jq 'length > 0')

if [ "$HAS_TO_LOAD" = "false" ] && [ "$HAS_SKIPPED" = "false" ]; then
  exit 0
fi

# Output protocol loading instructions
echo "<prompt-hook prompt=\"$PROMPT_COUNT\">"

if [ "$HAS_TO_LOAD" = "true" ]; then
  echo "Load protocols: $TO_LOAD_STR"
  echo "Use: mikey_protocol_read <id>"
  echo "After loading: ~/.claude/hooks/mark-protocol-loaded.sh <id>"

  # Show which ones are reloads due to expiry
  EXPIRED_COUNT=$(echo "$EXPIRED" | jq 'length')
  if [ "$EXPIRED_COUNT" != "0" ]; then
    EXPIRED_INFO=$(echo "$EXPIRED" | jq -r '.[] | "  - \(.id) (expired after \(.age) prompts)"')
    echo "Reloading (expired):"
    echo "$EXPIRED_INFO"
  fi
fi

if [ "$HAS_SKIPPED" = "true" ]; then
  SKIPPED_INFO=$(echo "$SKIPPED" | jq -r '.[] | "\(.id) (loaded \(.age) prompts ago, fresh for \(.remainingFresh) more)"')
  echo "Recently loaded (skipping):"
  echo "$SKIPPED_INFO" | while read -r line; do echo "  - $line"; done
fi

echo "</prompt-hook>"
exit 0
