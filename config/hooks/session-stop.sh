#!/bin/bash
# Stop hook - commit tasks, remind about reflection and session status

cat << 'EOF'
<stop-hook>
Session ending. Required actions:
1. mikey_commit_tasks - persist task state
2. mikey_reflect - if significant work done
3. Update /Users/bard/Code/docs/session-status.md
</stop-hook>
EOF

# Stop hooks are notification-only, no decision needed
exit 0
