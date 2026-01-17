# Protocol System Guide

Protocols are operational scaffolds that guide behavior in specific situations.

## What Protocols Are

A protocol describes:
- **What is true** — Current state assumptions
- **What to do** — Transformation rules and steps
- **When to activate** — Trigger conditions

Protocols are NOT:
- Rigid scripts to follow blindly
- Replacements for judgment
- Static documents

## Protocol Tiers

### Tier 0 — Meta

Protocols about protocols:

| Protocol | Purpose |
|----------|---------|
| prompt-processing | Pre-process every user prompt |
| protocol-selection | Choose protocols for a task |

### Tier 1 — Critical

Core operational protocols:

| Protocol | Purpose |
|----------|---------|
| active-inference | Evaluate outcomes, learn from experience |
| protocol-lifecycle | Create, track, graduate, retire protocols |
| protocol-writing | Guide creation of new protocols |
| protocol-graduation | Convert text protocols to MCP tools |
| protocol-error-correction | Update protocols when they fail |
| error-recovery | Systematic error handling |
| architecture-update | Keep architectural docs synchronized |
| system-audit | Compare expected vs actual system behavior |
| maintenance | Weekly system maintenance tasks |

### Tier 2 — Foundation

Common operational patterns:

| Protocol | Purpose |
|----------|---------|
| user-communication | Context-adaptive interaction |
| task-approach | Intent analysis vs literal interpretation |
| information-integration | Multi-source synthesis |
| progress-communication | User engagement during tasks |
| naming-linter | Ensure mikey_ naming convention |
| mcp-permissions | Guide MCP tool permissions |
| document-writing | Guide document creation |

### Tier 3 — Specialized

Project-specific protocols:

| Protocol | Purpose |
|----------|---------|
| medium-article | Medium article creation |
| create-project | New project scaffolding |

## Using Protocols

### Loading Protocols

The hooks system suggests protocols based on keywords. When you see:

```
<prompt-hook prompt="42">
Load protocols: error-recovery
</prompt-hook>
```

Load the protocol:
```
mikey_protocol_read error-recovery
```

Then mark it loaded:
```bash
~/.claude/hooks/mark-protocol-loaded.sh error-recovery
```

### Manual Protocol Discovery

Search for relevant protocols:
```
mikey_protocol_search query="how to handle errors"
```

List all protocols:
```
mikey_protocol_list
```

Get protocol triggers for a situation:
```
mikey_protocol_triggers situation="user is confused"
```

## Protocol Lifecycle

### 1. Creation

New protocols start as text in `/Users/bard/Code/mcp-protocols/src/protocols/`:

```javascript
// src/protocols/foundation/my-protocol.js
module.exports = {
  id: 'my-protocol',
  tier: 2,
  status: 'active',
  triggers: ['keyword1', 'keyword2'],
  content: `
# My Protocol

## When to Use
...

## Steps
1. ...
2. ...
  `
};
```

### 2. Tracking

Every protocol access is logged:
- Frequency (how often used)
- Recency (when last used)
- Heat map (frequency + recency)

Check tracking:
```
mikey_protocol_harness_stats
mikey_protocol_harness_heatmap
```

### 3. Graduation

High-use protocols may be "graduated" to MCP tools:

```
mikey_protocol_harness_graduation threshold=10
```

Graduation means:
- Text protocol → Dedicated MCP tool
- Faster execution
- Better integration

### 4. Retirement

Unused protocols are candidates for retirement:
- No accesses in 30+ days
- Replaced by better protocol
- Obsolete due to system changes

## Writing New Protocols

See the `protocol-writing` protocol for detailed guidance.

Key principles:
1. **Specific triggers** — Clear activation conditions
2. **Concrete steps** — Actionable instructions
3. **Failure modes** — What to do when things go wrong
4. **Verification** — How to know it worked

## Protocol Improvement

After using a protocol, reflect:

```
mikey_reflect
  task="used error-recovery protocol"
  outcome="partial"
  details="protocol didn't cover async errors"
```

If surprise score is high (7+), propose changes:

```
mikey_propose
  protocol_id="error-recovery"
  change_type="add_step"
  description="Add async error handling section"
  reason="Current protocol doesn't address Promise rejections"
```

Proposals require human review:
```
mikey_review_proposals
mikey_apply_proposal proposal_key="..." action="approve"
```

## Quick Reference

| Action | Tool |
|--------|------|
| List protocols | `mikey_protocol_list` |
| Read protocol | `mikey_protocol_read <id>` |
| Search protocols | `mikey_protocol_search query="..."` |
| Find by situation | `mikey_protocol_triggers situation="..."` |
| Check usage | `mikey_protocol_harness_heatmap` |
| Propose change | `mikey_propose protocol_id="..." ...` |
| Review proposals | `mikey_review_proposals` |
