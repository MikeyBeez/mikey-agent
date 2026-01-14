// Protocol Selection Protocol - Meta protocol for auto-selection
module.exports = {
  id: 'protocol-selection',
  name: 'Protocol Selection Protocol',
  version: '1.0.0',
  tier: 0,  // Meta-protocol - runs before others
  purpose: 'Automatically identify and load relevant protocols at task start',
  triggers: [
    'At the start of any new task',
    'When beginning work on a user request',
    'Before executing any significant action',
    'When context changes significantly'
  ],
  status: 'active',
  location: '/Users/bard/Code/mcp-protocols',
  content: `# Protocol Selection Protocol v1.0.0

## Trigger Conditions (MUST ACTIVATE)
- **WHEN**: New task or request received
- **WHEN**: Beginning significant work
- **WHEN**: Context changes
- **IMMEDIATE**: Yes - before any task execution
- **PRIORITY**: Critical (Tier 0)

## Core Principle
"Select policies before acting" - The right protocols activated at the right time prevent errors and improve outcomes.

## IMMUTABLE - Core Selection Process

### Step 1: Task Classification
Before acting, classify the task:
- Is this creating something? (code, document, analysis)
- Is this fixing/debugging something?
- Is this researching/understanding something?
- Is this a conversation/clarification?

### Step 2: Protocol Trigger Check
Call mikey_protocol_triggers with a brief description of the task.
Example: mikey_protocol_triggers "debugging code error"

### Step 3: Load Relevant Protocols
For each protocol returned:
- Skim the trigger conditions
- If applicable, keep in mind during execution
- For critical protocols, call mikey_protocol_read for full content

## EDITABLE - Task-Protocol Mapping

Common task types and their protocols:

### Creating/Building
- task-approach: Understand what's really needed
- progress-communication: Keep user informed on long tasks
- active-inference: Reflect when complete

### Fixing/Debugging
- error-recovery: Systematic error handling
- task-approach: Understand root cause vs symptom
- active-inference: Learn from the fix

### Writing Code
- naming-linter: If creating MCP tools
- progress-communication: For multi-step implementations
- active-inference: Reflect on code quality

### After Errors
- error-recovery: Primary protocol
- active-inference: Diagnose and propose fixes

### After Task Completion
- active-inference: Score surprise, propose improvements

## Quick Reference Commands

At task start:
  mikey_protocol_triggers "<brief task description>"

When error occurs:
  mikey_protocol_read error-recovery

After task completes:
  mikey_reflect task="..." outcome="success/failure"

When protocol change needed:
  mikey_propose protocol_id="..." change_type="..."

## Integration Notes

This is a Tier 0 (meta) protocol. It runs BEFORE other protocols are selected.
It tells you WHICH protocols to use, not HOW to use them.

The protocol selection loop:
1. Task received
2. THIS protocol activates
3. Relevant protocols identified
4. Task executed with those protocols in mind
5. active-inference protocol runs after completion
6. Proposals generated if needed
7. Human reviews proposals

---
**Status**: Active Meta Protocol - v1.0.0`
};
