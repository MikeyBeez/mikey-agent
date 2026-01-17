#!/bin/bash
# Mark a protocol as loaded at the current prompt count
# Usage: mark-protocol-loaded.sh <protocol-id>

STATE_FILE="$HOME/.claude/state/protocol-state.json"

if [ -z "$1" ]; then
  echo "Usage: mark-protocol-loaded.sh <protocol-id>"
  exit 1
fi

PROTOCOL_ID="$1"

# Load current state
if [ -f "$STATE_FILE" ]; then
  STATE=$(cat "$STATE_FILE")
else
  STATE='{"promptCount": 0, "protocols": {}}'
fi

# Get current prompt count
PROMPT_COUNT=$(echo "$STATE" | jq -r '.promptCount // 0')

# Update the protocol's loaded-at prompt
NEW_STATE=$(echo "$STATE" | jq --arg id "$PROTOCOL_ID" --argjson count "$PROMPT_COUNT" \
  '.protocols[$id] = $count')

# Save
echo "$NEW_STATE" > "$STATE_FILE"

echo "Marked $PROTOCOL_ID as loaded at prompt $PROMPT_COUNT"
