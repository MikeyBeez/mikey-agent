# Reflect Protocol

## Purpose
Self-improvement protocol for extracting learnings from conversations and updating protocols/skills. Ensures corrections are captured permanently - "correct once, never again."

## Status: **Active Foundation Protocol**
- **Tier**: 2 (Foundation)
- **Version**: 1.0.0
- **Priority**: Medium

## Trigger Conditions (MUST ACTIVATE)

Activate this protocol when:
- **WHEN**: User says "/reflect", "reflect on this session", "learn from this"
- **WHEN**: User says "remember this for next time" or "don't forget this"
- **WHEN**: Session ends and auto-reflect is enabled
- **WHEN**: User explicitly corrects Claude's behavior
- **WHEN**: A pattern is discovered through trial and error worth preserving
- **IMMEDIATE**: No - run at end of task or on request
- **PRIORITY**: Medium

## Core Principle

**"Every correction is a signal. Capture it or repeat it forever."**

LLMs don't learn between sessions. Without explicit protocol updates, the same mistakes recur. This protocol extracts learnings and persists them.

## Signal Types

### High Priority Signals

**Corrections** - User explicitly corrects behavior:
- "No, don't do X, do Y instead"
- "Always use X, never Y"  
- "That's wrong, it should be..."
- "I told you before..."

**Errors** - Mistakes that should be prevented:
- Bugs Claude introduced and fixed
- Wrong assumptions corrected
- Failed approaches to avoid

### Medium Priority Signals

**Preferences** - User expresses preferences:
- "I prefer X over Y"
- "Use this style/format/approach"
- "In this project, we always..."

**Patterns** - Successful approaches worth preserving:
- Multi-step solutions that worked
- User approved/praised output
- Approaches discovered through iteration

## Confidence Levels

**High Confidence** - Apply with minimal review:
- Explicit user statements ("always", "never", "don't")
- Direct corrections after errors
- Repeated preferences (same correction twice)

**Medium Confidence** - Review before applying:
- Implied preferences from approvals
- Patterns that worked once
- Context-dependent learnings

**Low Confidence** - Note for observation:
- Inferred preferences
- Situational successes
- Ambiguous signals

## Extraction Protocol

### Step 1: Scan Conversation

Look for these patterns in user messages:

```
CORRECTION_PATTERNS:
- "no, " / "not that" / "wrong"
- "actually" / "instead" / "rather"
- "always" / "never" / "don't"
- "I told you" / "I said" / "remember"

PREFERENCE_PATTERNS:
- "I prefer" / "I like" / "I want"
- "use X" / "try X" / "let's do X"
- "in this project" / "for this codebase"

APPROVAL_PATTERNS:
- "perfect" / "great" / "exactly"
- "yes" / "that's right" / "correct"
```

### Step 2: Extract and Classify

For each signal found, record:
- **Quote**: The exact user statement
- **Type**: correction | preference | pattern | error
- **Confidence**: high | medium | low
- **Learning**: What should be remembered
- **Target**: Which protocol/skill should be updated

### Step 3: Identify Target

Match learnings to protocols/skills:

| Learning About | Target Location |
|----------------|-----------------|
| Tool usage | `/Users/bard/Code/mcp-protocols/protocols/tool-selection.md` |
| Git/GitHub | `/Users/bard/Code/protocols/Git Repository Creation Protocol.md` |
| General workflow | `/Users/bard/Code/protocols/` (new or existing) |
| User preferences | `/Users/bard/Code/protocols/User Communication Protocol v1.2.0.md` |
| Project-specific | Project's `.claude/` directory |

### Step 4: Propose Changes

Present changes in this format:

```
## Signals Detected

### High Confidence
1. [CORRECTION] "always use brain_execute, not bash_tool"
   → Target: tool-selection.md
   → Add: Rule about MCP filesystem tools

### Medium Confidence  
2. [PREFERENCE] User approved table format
   → Target: User Communication Protocol
   → Add: "Prefer markdown tables for data presentation"

## Proposed Changes

### mcp-protocols/protocols/tool-selection.md
Add to "Tool Selection Decision Tree":
+ - MCP filesystem tools available? → Use mcp__filesystem-enhanced

## Commit Message
reflect: add MCP filesystem tool preference

Approve? [Y/modify/skip]
```

### Step 5: Apply Changes

On approval:
1. Read current protocol file
2. Find appropriate section (or create one)
3. Add the learning in concise form
4. Preserve existing content structure

### Step 6: Git Commit (Optional)

If in a git repo:
```bash
cd <protocol-directory>
git add -A
git commit -m "reflect: <description>"
git push
```

## Quality Filters

Reject signals that are:
- Too vague to be actionable
- Contradictory to existing learnings (flag for review)
- One-off context unlikely to recur
- Already captured in protocols

## Conciseness Rules

When writing learnings:
- One line per learning when possible
- Use imperative form: "Check X" not "You should check X"
- Include context only if non-obvious
- Prefer examples over explanations

## Example: This Session

**Signal detected**: User said "That's a skill you should know about, the fact that you can use the MCP file tool"

**Classification**:
- Type: correction
- Confidence: high (explicit correction)
- Learning: Always try MCP filesystem tools for user directory access
- Target: tool-selection.md

**Proposed addition to tool-selection.md**:
```markdown
### MCP Filesystem Tools (Preferred for User Files)

Before using bash or brain_execute for filesystem operations, check if MCP filesystem tools are available:

✅ **Use mcp__filesystem-enhanced for**:
- Reading/writing files in /Users/bard
- Directory listings
- File searches
- Any operation on user's actual files

The sandbox bash cannot access /Users/bard, but MCP filesystem tools can.
```

## Scripts Location

Helper scripts installed at `~/.claude/skills/reflect/scripts/`:
- `extract-signals.py` - Pattern-based signal detection
- `apply-learning.py` - Add learnings to protocol files
- `git-commit-learning.sh` - Commit with structured messages

---

**Remember**: Every error demands a protocol rewrite. Not "I'll remember." There is no next time without the protocol.

**Created**: 2025-01-13
**Status**: Active - Foundation Protocol
