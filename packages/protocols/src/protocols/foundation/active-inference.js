// Active Inference Protocol - Modular data file
module.exports = {
  id: 'active-inference',
  name: 'Active Inference Protocol',
  version: '1.0.0',
  tier: 1,
  purpose: 'Close the feedback loop: evaluate outcomes, diagnose failures, propose protocol improvements',
  triggers: [
    'After completing any non-trivial task',
    'When a task fails or produces unexpected results',
    'When errors occur during execution',
    'When asked to reflect on what happened',
    'At the end of a work session'
  ],
  status: 'active',
  location: '/Users/bard/Code/claude-brain/index.js',
  content: `# Active Inference Protocol v1.0.0

## Trigger Conditions (MUST ACTIVATE)
- **WHEN**: Task completes (success or failure)
- **WHEN**: Errors encountered during execution
- **WHEN**: Results don't match expectations
- **WHEN**: User asks "what went wrong?" or "how could this be better?"
- **WHEN**: End of work session
- **IMMEDIATE**: Yes for failures, optional for successes
- **PRIORITY**: High

## Core Principle
"Every outcome is information" - Success confirms protocols work. Failure reveals what needs to change. Both are valuable.

## The Feedback Loop

### 1. Observation
What happened? Capture:
- Task attempted
- Outcome (success/partial/failure)
- Tools used
- Error messages if any

### 2. Surprise Scoring
Rate how unexpected the outcome was (1-10):
- 1-3: Expected, everything worked
- 4-6: Minor deviations, log but don't act
- 7-10: Significant deviation, needs diagnosis

### 3. Failure Classification
If surprise >= 5, classify the failure:

**EXECUTION** - World didn't cooperate
- Command failed, timeout, connection issue
- File not found, permission denied
- Service unavailable
- Action: Retry, check prerequisites, rebuild environment

**SPECIFICATION** - Protocol unclear or incomplete
- Instructions ambiguous
- Missing steps in procedure
- Wrong result despite following protocol
- Action: Revise protocol, add missing step, clarify

**CAPABILITY** - Task exceeds current approach
- Too complex for single-pass execution
- Context lost during multi-step task
- Requires state management
- Action: Graduate protocol (text -> chunked -> tool)

### 4. Proposal
If high surprise, propose changes:
- What protocol needs modification?
- What type of change? (add_step, clarify_step, new_protocol, graduate_to_tool)
- What specifically should change?
- Why? (reference the failure)

### 5. Human Review
All proposals require human approval:
- Proposals are stored in memory
- Human reviews with mikey_review_proposals
- Human applies with mikey_apply_proposal
- Agent cannot modify protocols directly

## Tools Available

### After Task Completion
mikey_reflect - Evaluate outcome, score surprise, classify failure
Required params: task, outcome
Optional: details, error_messages, tools_used

### When Improvement Needed
mikey_propose - Suggest protocol change
Required: protocol_id, change_type, description, reason
Optional: proposed_content

### For Human Review
mikey_review_proposals - List pending proposals
mikey_apply_proposal - Approve or reject proposal

### Pattern Analysis
mikey_reflections - View past reflections and identify patterns

## Example Workflow

Task: "Install nginx on the server"
Outcome: Failed - "sudo command not found"

1. Call mikey_reflect:
   - task: "Install nginx on server"
   - outcome: "failure"
   - error_messages: "sudo: command not found"
   - tools_used: ["mikey_execute"]

2. Analysis returns:
   - Surprise: 7/10
   - Class: EXECUTION (environment issue)
   - Recommendation: Check environment prerequisites

3. If pattern repeats, call mikey_propose:
   - protocol_id: "server-setup"
   - change_type: "add_step"
   - description: "Verify sudo is available before running privileged commands"
   - reason: "Multiple failures due to missing sudo"

4. Human reviews and applies if appropriate

## Integration with Other Protocols
- **Error Recovery Protocol**: Use reflection after error recovery
- **Progress Communication Protocol**: Reflect at checkpoints for long tasks
- **Task Approach Protocol**: Reflection informs future task planning

## Anti-Patterns to Avoid
- Skipping reflection - Every failure is a learning opportunity
- Over-diagnosing success - Score 1 for expected outcomes
- Self-modifying protocols - Always propose, never apply directly
- Ignoring patterns - Use mikey_reflections to spot recurring issues

## Success Metrics
- Decreasing surprise scores over time
- Fewer SPECIFICATION failures (protocols improving)
- CAPABILITY failures leading to tool graduation
- Proposals that get approved (useful suggestions)

---
**Status**: Active System Protocol - v1.0.0`
};
