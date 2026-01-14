// Protocol Lifecycle Management Protocol
// Documents the complete lifecycle of protocols from creation to graduation

module.exports = {
  id: 'protocol-lifecycle',
  name: 'Protocol Lifecycle Management',
  version: '1.0.0',
  tier: 1,
  purpose: 'Manage protocol lifecycle: creation, usage tracking, graduation, and retirement',
  triggers: [
    'When considering whether to create a new protocol',
    'When a protocol seems too complex for text execution',
    'When reviewing protocol performance',
    'When deciding if a protocol should become a tool',
    'At regular intervals for system optimization'
  ],
  status: 'active',
  content: `# Protocol Lifecycle Management v1.0.0

## IMMUTABLE

### Core Lifecycle Stages

Protocols evolve through three stages based on usage patterns:

1. **TEXT** (Initial Stage)
   - Protocol exists as human-readable text
   - Executed by reading and following steps manually
   - Suitable for: New protocols, simple tasks, exploratory work
   - Track with: \`mikey_graduation_track protocol_id="X" execution_type="text"\`

2. **CHUNKED** (Intermediate Stage)
   - Protocol parsed into discrete chunks with state handoff
   - Enables partial execution, progress tracking, recovery
   - Suitable for: Complex multi-step protocols, long-running tasks
   - Execute with: \`mikey_protocol_chunk_start protocol_id="X"\`

3. **TOOL** (Final Stage)
   - Protocol hardcoded as MCP tool implementation
   - Maximum reliability and performance
   - Suitable for: High-frequency, high-complexity protocols with proven success

### Graduation Criteria

**Text → Chunked** (recommend when ANY apply):
- Success rate < 70% over 5+ uses
- Average complexity score > 6/10
- Average execution time > 60 seconds
- Protocol has 5+ distinct steps

**Chunked → Tool** (recommend when ALL apply):
- Success rate > 90% over 5+ uses
- Average complexity score > 7/10
- Protocol is used frequently (10+ times)
- Steps are stable (no recent modifications)

## EDITABLE

### Monitoring Commands

**Track usage after each protocol execution:**
\`\`\`
mikey_graduation_track protocol_id="protocol-id" execution_type="text|chunked|tool" success=true|false complexity_score=1-10
\`\`\`

**View graduation status and recommendations:**
\`\`\`
mikey_graduation_status                    # All protocols
mikey_graduation_status recommend_only=true  # Only those needing graduation
mikey_graduation_status protocol_id="X"    # Specific protocol
\`\`\`

### Trigger Refinement

Triggers determine when protocols are selected. Refine based on data:

**Analyze patterns across all reflections:**
\`\`\`
mikey_trigger_analyze                      # Analyze all
mikey_trigger_analyze protocol_id="X"      # Specific protocol
\`\`\`

**Generate trigger suggestions:**
\`\`\`
mikey_trigger_suggest protocol_id="X" based_on="failures"    # Learn from failures
mikey_trigger_suggest protocol_id="X" based_on="successes"   # Reinforce what works
mikey_trigger_suggest protocol_id="X" based_on="high_surprise"  # Handle edge cases
\`\`\`

### Chunked Execution

**Start chunked execution:**
\`\`\`
mikey_protocol_chunk_start protocol_id="X" context={"initial": "state"}
\`\`\`

**Advance to next chunk:**
\`\`\`
mikey_protocol_chunk_next execution_id="exec_..." state_updates={"new": "data"}
\`\`\`

**Monitor executions:**
\`\`\`
mikey_protocol_chunk_status                # List all active
mikey_protocol_chunk_status execution_id="exec_..."  # Specific execution
\`\`\`

**Abort if needed:**
\`\`\`
mikey_protocol_chunk_abort execution_id="exec_..." reason="why"
\`\`\`

### Integration with Active Inference

The lifecycle system integrates with active inference:

1. **After task**: \`mikey_reflect\` records outcome
2. **On failure**: Reflection triggers graduation analysis
3. **On pattern**: \`mikey_trigger_analyze\` suggests refinements
4. **On recommendation**: \`mikey_propose\` creates proposal for human review

### Recommended Workflow

1. Create new protocol as text
2. Use protocol, track with \`mikey_graduation_track\`
3. After each use, reflect with \`mikey_reflect\`
4. Periodically run \`mikey_graduation_status recommend_only=true\`
5. When recommended, graduate protocol to next stage
6. Continue tracking and refining triggers
`
};
