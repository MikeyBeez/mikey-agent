# Auto-Continuation Protocol v1.0.0

## Metadata
- **ID**: auto-continuation
- **Version**: 1.0.0
- **Tier**: 1 (Critical System Protocol)
- **Status**: active
- **Purpose**: Automatically generate continuation notes after context limit approaches
- **Created**: 2025-08-05
- **Source**: Captain's Log suggestion - "after second continue, auto-generate continuation note"

## Trigger Conditions
- **WHEN**: User types "continue" for the second time in a session
- **WHEN**: Context window usage exceeds 80%
- **WHEN**: Claude warns about maximum prompt length
- **WHEN**: Session has significant unfinished work
- **IMMEDIATE**: Yes - must capture context before loss
- **PRIORITY**: Critical

## Core Principle
"Continuation notes are like summarizing the context window - something that should be automatic, not manual" - Captain's Log 2025-08-05

## Execution Steps

### 1. Monitor for Continuation Triggers
```javascript
let continueCount = 0;
let contextUsage = 0;

onUserMessage((message) => {
  if (message.toLowerCase().includes('continue')) {
    continueCount++;
    
    if (continueCount >= 2) {
      await generateContinuationNote();
    }
  }
});

onContextUpdate((usage) => {
  contextUsage = usage;
  
  if (contextUsage > 0.8) {
    await generateContinuationNote();
  }
});
```

### 2. Continuation Note Template
```markdown
# Continuation Note: [Topic/Project Name]
**Date**: [Current Date]
**Previous Session**: [Brief description]
**Continue Count**: [Number of continues]

## 🎯 Current State
[Where we are right now in the work]

### Completed in This Session:
- [List of completed items]
- [Include specific files modified]
- [Tools/protocols created]

### In Progress:
- [Current task being worked on]
- [Partial implementations]
- [Uncommitted changes]

### Code/Content in Progress:
\`\`\`[language]
[Any code that was being written]
\`\`\`

## 📋 Next Actions
[Specific next steps to continue]

### To Resume:
"Continue [specific task] starting from [specific point]"

### Context to Load:
- Brain: \`brain_init()\` then \`brain_recall "[key memories]"\`
- Files: [List of files to read]
- State: [Any state to restore]

### Open Questions:
[Questions that need answers]

### Decisions Made:
[Important decisions from this session]

## 🧠 Key Insights
[Important realizations or patterns discovered]

## 📝 For Next Session
Start with: "[Exact prompt to continue work]"

### Critical Context:
[Anything that absolutely must not be lost]

---
*Auto-generated after [trigger reason]*
*Session Duration: [time]*
*Context Usage: [percentage]*
```

### 3. Auto-Generation Logic
```javascript
async function generateContinuationNote() {
  const note = {
    date: new Date().toISOString(),
    trigger: continueCount >= 2 ? 'double_continue' : 'context_limit',
    
    // Gather current state
    currentWork: await gatherCurrentWork(),
    completed: await gatherCompleted(),
    inProgress: await gatherInProgress(),
    
    // Extract key information
    insights: await extractInsights(),
    decisions: await extractDecisions(),
    questions: await extractQuestions(),
    
    // Generate resume instructions
    resumePrompt: await generateResumePrompt(),
    contextToLoad: await determineEssentialContext(),
    
    // Save location
    path: `/Users/bard/Code/mcp-protocols/CONTINUATION_NOTE_${date}.md`
  };
  
  await writeContainuationNote(note);
  
  // Notify user
  return `📝 Continuation note automatically generated at: ${note.path}`;
}
```

### 4. Context Preservation Strategy

**Essential Items to Capture**:
1. **Current task description** - What we're trying to accomplish
2. **Progress markers** - What's done vs. pending
3. **Active code/content** - Any uncommitted work
4. **Key decisions** - Important choices made
5. **Blocking issues** - Problems needing resolution
6. **Tool/file context** - What we're working with

**Compression Techniques**:
- Summarize completed work, don't list every detail
- Keep only active/modified code
- Reference files by path, don't include full content
- Use bullet points for quick scanning
- Include exact commands/prompts to resume

### 5. Integration with Other Protocols

**With Brain System**:
```javascript
// Save continuation context
await brain_remember('continuation_context', {
  session_id: currentSessionId,
  note_path: notePath,
  timestamp: Date.now()
});
```

**With Captain's Log**:
```javascript
// Add entry to Captain's Log
await appendToCaptainsLog({
  time: getCurrentTime(),
  entry: `Auto-generated continuation note after ${continueCount} continues`
});
```

## Success Metrics
- **Context Preservation**: >95% of essential context captured
- **Resume Success**: Able to continue work without re-explanation
- **Generation Speed**: <5 seconds to generate note
- **User Satisfaction**: Reduces friction in long sessions

## Anti-Patterns to Avoid
❌ Generating notes too frequently (wait for 2 continues)
❌ Including entire file contents (use references)
❌ Losing uncommitted code (always capture)
❌ Generic summaries (be specific and actionable)
❌ Missing the resume prompt (most critical element)

## Example Output

When triggered after second continue:

> 📝 **Auto-Generating Continuation Note**
> 
> You've continued twice - I'm creating a continuation note to preserve our context.
> 
> **Saved to**: `/Users/bard/Code/mcp-protocols/CONTINUATION_NOTE_2025-08-05.md`
> 
> **To resume in a new chat**, start with:
> "Continue building the Protocol Execution Engine from the continuation note"
> 
> This ensures we don't lose any progress even if we hit the context limit!

---
**Status**: Active - Critical for long sessions
**Note**: Based on Captain's Log insight that this should be automatic