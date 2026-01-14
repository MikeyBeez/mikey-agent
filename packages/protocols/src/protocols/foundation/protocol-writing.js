// Protocol Writing Protocol - Modular data file
module.exports = {
  id: 'protocol-writing',
  name: 'Protocol Writing Protocol',
  version: '1.0.0',
  tier: 1,
  purpose: 'Guide the creation of new protocols with consistent structure, quality, and integration',
  triggers: [
    'User requests a new protocol',
    'Identifying a repeating pattern that should be codified',
    'Creating documentation for a workflow that should be standardized',
    'After mikey_propose suggests a new protocol',
    'When a task approach proves successful and should be preserved',
    'When active-inference identifies a gap in protocol coverage'
  ],
  status: 'active',
  location: '/Users/bard/Code/mcp-protocols/src/protocols/foundation/protocol-writing.js',
  content: `# Protocol Writing Protocol v1.0.0

## Trigger Conditions (MUST ACTIVATE)
- **WHEN**: User requests a new protocol
- **WHEN**: Identifying a repeating pattern that should be codified
- **WHEN**: Creating documentation for a workflow that should be standardized
- **WHEN**: After mikey_propose suggests a new protocol
- **WHEN**: A task approach proves successful and should be preserved
- **WHEN**: active-inference identifies a gap in protocol coverage
- **IMMEDIATE**: No - requires thoughtful design
- **PRIORITY**: High (Tier 1)

## Core Principle
"Protocols are infrastructure, not documentation." A well-written protocol is actionable, testable, and integrates with the existing system.

## IMMUTABLE - Protocol Structure Requirements

Every protocol MUST have these components:

### 1. Metadata Block
\`\`\`javascript
{
  id: 'kebab-case-id',           // Unique, lowercase with hyphens
  name: 'Human Readable Name',    // Title case
  version: 'X.Y.Z',               // Semantic versioning
  tier: 0|1|2|3,                  // Priority tier
  purpose: 'One-line description',
  triggers: [...],                // Array of trigger conditions
  status: 'active'|'draft'|'deprecated',
  location: '/path/to/file'
}
\`\`\`

### 2. Tier Assignment
| Tier | Name | Purpose | Examples |
|------|------|---------|----------|
| 0 | Meta | Controls other protocols | protocol-selection |
| 1 | Core | System-critical operations | protocol-lifecycle, protocol-writing |
| 2 | Foundation | Daily operations | error-recovery, user-communication |
| 3 | Specialized | Domain-specific workflows | naming-linter |

### 3. Trigger Conditions
Triggers must be:
- **Specific**: "When a tool returns an error" not "When something goes wrong"
- **Observable**: Based on detectable events, not internal states
- **Non-overlapping**: Avoid triggers that fire for every task

### 4. Content Sections
\`\`\`markdown
# Protocol Name vX.Y.Z

## Trigger Conditions (MUST ACTIVATE)
- **WHEN**: Specific condition 1
- **WHEN**: Specific condition 2
- **IMMEDIATE**: Yes|No
- **PRIORITY**: Critical|High|Medium|Low

## Core Principle
"One memorable phrase that captures the essence"

## IMMUTABLE
[Rules that should never change]

## EDITABLE
[Guidance that can be refined based on experience]
\`\`\`

## EDITABLE - Writing Process

### Step 1: Identify the Need
Before writing, confirm:
- [ ] Is this a repeating pattern? (≥3 occurrences)
- [ ] Does it involve decision-making or process?
- [ ] Would codifying it prevent errors or save time?
- [ ] Is there an existing protocol that could be extended instead?

### Step 2: Draft the Protocol

**Start with the purpose:**
Write one sentence explaining what problem this solves.

**Define triggers:**
List 3-6 specific conditions that should activate this protocol.

**Identify the core principle:**
Distill the wisdom into one memorable phrase.

**Separate IMMUTABLE from EDITABLE:**
- IMMUTABLE: Fundamental rules that define correctness
- EDITABLE: Implementation details and best practices

**Add integration points:**
How does this protocol connect to others?

### Step 3: Implementation

**Create the JS file:**
\`\`\`
/Users/bard/Code/mcp-protocols/src/protocols/foundation/<protocol-id>.js
\`\`\`

**Run the naming linter:**
\`\`\`bash
cd /Users/bard/Code/mikey-naming-registry
node lint.js /Users/bard/Code/mcp-protocols/src/protocols/foundation/<protocol-id>.js
\`\`\`

**Register in registry.js:**
1. Add import statement
2. Add to PROTOCOLS object
3. Update MASTER_PROTOCOL_INDEX if needed

**Test the protocol:**
\`\`\`bash
# Verify it loads
mikey_protocol_read <protocol-id>

# Check it appears in listings
mikey_protocol_list

# Test trigger matching
mikey_protocol_triggers "<situation>"
\`\`\`

### Step 4: Documentation

Add to MASTER_PROTOCOL_INDEX:
- Quick access command
- Key triggers summary
- Integration notes

## Quality Checklist

Before finalizing, verify:

### Structure
- [ ] Has all required metadata fields
- [ ] Tier assignment is appropriate
- [ ] Triggers are specific and observable
- [ ] Has both IMMUTABLE and EDITABLE sections

### Content
- [ ] Core principle is memorable and actionable
- [ ] Steps are numbered and clear
- [ ] Examples are included where helpful
- [ ] Error handling is addressed

### Integration
- [ ] Doesn't duplicate existing protocol functionality
- [ ] Cross-references related protocols
- [ ] Passes naming linter
- [ ] Registered in registry.js
- [ ] Tested with mikey_protocol_read

### Naming
- [ ] ID is kebab-case
- [ ] Name is descriptive
- [ ] Version follows semver

## Anti-Patterns to Avoid

**Too Vague:**
❌ "When things go wrong, fix them"
✅ "When a tool returns error status, apply recovery steps"

**Too Broad:**
❌ Trigger: "Any user interaction"
✅ Trigger: "User expresses confusion or asks for clarification"

**No Exit Condition:**
❌ Protocol with infinite loops
✅ Clear completion criteria for each step

**Isolated Protocol:**
❌ No references to other protocols
✅ Explicit integration points

## Template

\`\`\`javascript
// <Protocol Name> - Modular data file
module.exports = {
  id: '<kebab-case-id>',
  name: '<Protocol Name>',
  version: '1.0.0',
  tier: <0-3>,
  purpose: '<One-line description>',
  triggers: [
    '<Trigger condition 1>',
    '<Trigger condition 2>',
    '<Trigger condition 3>'
  ],
  status: 'active',
  location: '/Users/bard/Code/mcp-protocols/src/protocols/foundation/<id>.js',
  content: \`# <Protocol Name> v1.0.0

## Trigger Conditions (MUST ACTIVATE)
- **WHEN**: <Condition 1>
- **WHEN**: <Condition 2>
- **IMMEDIATE**: <Yes|No>
- **PRIORITY**: <Level>

## Core Principle
"<Memorable phrase>"

## IMMUTABLE
<Fundamental rules>

## EDITABLE
<Implementation guidance>

## Integration
- **<Related Protocol>**: <How they connect>

---
**Status**: Active - v1.0.0\`
};
\`\`\`

## Integration with Other Protocols

- **Protocol Selection**: New protocols must have clear triggers for selection
- **Protocol Lifecycle**: Track usage to determine if protocol should graduate to tool
- **Active Inference**: Reflect on protocol effectiveness after use
- **Naming Linter**: Protocol IDs and tool names must follow conventions

---
**Status**: Active Core Protocol - v1.0.0`
};
