# Tool Auto-Repair Protocol v1.0.0

## Metadata
- **ID**: tool-auto-repair
- **Version**: 1.0.0
- **Tier**: 2 (Foundation Operational)
- **Status**: active
- **Purpose**: Autonomous diagnosis and repair of MCP tool failures
- **Created**: 2025-08-05

## Trigger Conditions (MUST ACTIVATE)
- **WHEN**: Any tool returns an error during execution
- **WHEN**: Session initialization detects unconfigured/broken tools
- **WHEN**: User reports tool malfunction
- **WHEN**: Registry status conflicts with actual tool availability
- **WHEN**: Periodic health check reveals issues (start of each session)
- **IMMEDIATE**: Yes for errors during user tasks
- **PRIORITY**: High

## Core Principles
1. **"Prevention over repair"** - Fix issues before they impact users
2. **"Safe failures"** - Never break working tools while fixing broken ones
3. **"Learn from patterns"** - Record and prevent recurring issues
4. **"Obsolescence awareness"** - Recognize when tools are replaced by better solutions

## Safety Rules (NEVER VIOLATE)
- ❌ NEVER modify tools without creating backups first
- ❌ NEVER proceed if network connectivity is unstable
- ❌ NEVER delete user data or configurations
- ❌ NEVER run untested commands in production directories
- ✅ ALWAYS test fixes in isolation first
- ✅ ALWAYS log repair attempts for rollback capability
- ✅ ALWAYS preserve working state before changes

## Diagnostic Framework

### Level 1: Quick Health Check
```
1. Can the tool be invoked?
2. Does it appear in available functions?
3. Does registry status match actual status?
```

### Level 2: Build Analysis
```
1. Check if /build directory exists
2. Verify package.json present and valid
3. Check for tsconfig.json (TypeScript projects)
4. Look for recent build artifacts
5. Search for compilation error logs
```

### Level 3: Dependency Audit
```
1. Verify node_modules directory exists
2. Check package-lock.json present
3. Compare installed vs required dependencies
4. Look for version conflicts
5. Check for deprecated packages
```

### Level 4: Configuration Validation
```
1. Verify tool appears in Claude config
2. Check required environment variables
3. Validate file/directory permissions
4. Confirm API keys/credentials if needed
5. Test network connectivity to required services
```

## Repair Action Matrix

| Issue Detected | Diagnosis Command | Repair Action | Rollback Strategy |
|---------------|------------------|--------------|-------------------|
| Missing dependencies | `ls node_modules` empty | `npm install` | Delete node_modules |
| Build artifacts missing | No /build directory | `npm run build` | Delete build directory |
| TypeScript errors | tsc errors in log | Fix tsconfig.json | Restore .bak file |
| Permission denied | stat shows wrong perms | Report to user | N/A |
| Not in config | Missing from Claude | Generate snippet | N/A |
| Obsolete tool | Better alternative exists | Archive & document | Move back from /archived |

## Execution Sequence

### 1. Initial Assessment
```javascript
// Check tool status
const toolStatus = await registry_info(toolName);
const actuallyWorks = await testToolFunction(toolName);

if (actuallyWorks && toolStatus.status === 'unconfigured') {
  // Registry desync - update registry
  await updateRegistry(toolName, 'active');
}
```

### 2. Diagnostic Run
```bash
# Run diagnostic checks
cd /Users/bard/Code/{tool-name}

# Check basics
ls -la
cat package.json | grep version
ls build/
ls node_modules/ | wc -l

# Check for errors
npm run build --dry-run
```

### 3. Repair Attempt
```bash
# Create backup
cp package.json package.json.bak
cp tsconfig.json tsconfig.json.bak 2>/dev/null

# Attempt repair based on diagnosis
npm install  # if dependencies missing
npm run build  # if build needed

# Test the repair
npm test 2>/dev/null || echo "No tests defined"
```

### 4. Verification
```javascript
// Test if tool now works
const repairSuccess = await testToolFunction(toolName);

if (repairSuccess) {
  await logRepair(toolName, diagnosis, action, 'success');
} else {
  await rollback(toolName);
  await logRepair(toolName, diagnosis, action, 'failed');
}
```

## Obsolescence Detection

When a tool consistently fails or is unused, evaluate:

1. **Is there a better alternative?**
   - Example: mcp-tarot-tool → use mcp-random instead
   - Example: deprecated API tools → newer versions

2. **Is the functionality now native?**
   - Built-in capabilities that replaced the tool
   - Merged into another tool

3. **Archive if obsolete:**
   ```bash
   mv /Users/bard/Code/{tool} /Users/bard/Code/archived/
   ```

## Learning & Pattern Recognition

### Track Patterns
```json
{
  "tool": "tool-name",
  "failure_type": "missing_dependencies",
  "frequency": 3,
  "last_occurrence": "2025-08-05",
  "permanent_fix": "Add to session_init checks"
}
```

### Preventive Actions
- Tools that frequently lose dependencies → add to session health check
- Tools with permission issues → document required permissions
- Tools with API issues → implement credential validation

## Integration with Other Protocols

- **Error Recovery Protocol**: This IS error recovery for tools specifically
- **Progress Communication**: Inform user during lengthy repairs
- **Brain Integration**: Store repair patterns and solutions
- **System Monitoring**: Track tool health metrics over time

## Success Metrics
- Tool availability: >95% uptime
- Repair success rate: >80% automatic fixes
- Mean time to repair: <30 seconds
- Pattern prevention: Reduce repeat failures by 50%

## Anti-Patterns to Avoid
❌ Running `rm -rf` on anything
❌ Modifying system files outside /Users/bard/Code
❌ Installing global npm packages without permission
❌ Ignoring network instability warnings
❌ Fixing tools that aren't actually broken

## Communication Templates

### Detecting Issue:
"I've detected an issue with {tool}. Running diagnostic..."

### During Repair:
"Attempting to repair {tool} by {action}. This should take about {time}..."

### Success:
"✅ Successfully repaired {tool}. It's now working properly."

### Failure:
"I couldn't automatically repair {tool}. The issue appears to be {diagnosis}. Would you like me to {alternative}?"

### Obsolescence:
"{tool} appears to be obsolete. We can achieve the same functionality using {alternative}. Shall I archive it?"

---
**Status**: Active - Part of autonomous intelligence upgrade
**Note**: This protocol enables self-healing capabilities for the MCP tool ecosystem