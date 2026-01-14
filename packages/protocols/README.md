# MCP Protocols Server

🔧 **Reliable, hardcoded access to protocol system with backup management**

## Problem Solved

**Critical Issue**: Protocol system was unreliable due to inconsistent file access to Obsidian documents, creating single point of failure.

**Solution**: MCP server with hardcoded protocol data that cannot be lost or become inaccessible.

## Features

- 📋 **Reliable Protocol Access** - Hardcoded data, never lost
- 🎯 **Situation-Based Recommendations** - Get protocols for specific contexts
- 🔍 **Powerful Search** - Find protocols by keywords, purpose, or triggers  
- 💾 **Backup & Restore** - Complete system backup in JSON/Markdown
- 🏗️ **Modular Architecture** - Easy to maintain and extend
- ✅ **All Foundation Protocols** - Complete with formal trigger conditions

## Quick Start

### Installation

```bash
cd /Users/bard/Code/mcp-protocols
npm install
npm start
```

### Essential Commands

```bash
# List all protocols
protocol_list

# Read specific protocol
protocol_read error-recovery
protocol_read user-communication  
protocol_read task-approach
protocol_read information-integration
protocol_read progress-communication

# Find protocols for situations
protocol_triggers "error occurred"
protocol_triggers "user confused" 
protocol_triggers "multiple sources"
protocol_triggers "long task"

# Search protocols
protocol_search "decision tree"
protocol_search "communication"

# Get complete system overview
protocol_index

# Create backup
protocol_backup json
protocol_backup markdown
```

## Protocol Coverage

### ✅ **Tier 2: Foundation Protocols** (COMPLETE)
All foundation protocols with formal trigger conditions:

1. **Error Recovery Protocol** v1.1.0
   - Systematic error/uncertainty handling
   - Decision trees and communication templates
   - **Access**: `protocol_read error-recovery`

2. **User Communication Protocol** v1.1.0  
   - Context-adaptive user interaction
   - Communication style selection
   - **Access**: `protocol_read user-communication`

3. **Task Approach Protocol** v1.1.0
   - Intent analysis vs literal interpretation
   - Response strategy matrix
   - **Access**: `protocol_read task-approach`

4. **Information Integration Protocol** v1.1.0
   - Multi-source synthesis and conflict resolution
   - Source ranking and quality assurance
   - **Access**: `protocol_read information-integration`

5. **Progress Communication Protocol** v1.1.0
   - User engagement during complex tasks
   - Progress templates and timing guidelines
   - **Access**: `protocol_read progress-communication`

## Architecture

### Modular Design
```
src/
├── index.js              # Main MCP server
├── registry.js           # Central protocol registry
├── protocols/            # Protocol data (modular)
│   └── foundation/       # Foundation protocols
│       ├── error-recovery.js
│       ├── user-communication.js
│       ├── task-approach.js
│       ├── information-integration.js
│       └── progress-communication.js
└── handlers/             # MCP tool handlers (modular)
    ├── list.js           # protocol_list
    ├── read.js           # protocol_read  
    ├── search.js         # protocol_search
    ├── triggers.js       # protocol_triggers
    ├── index.js          # protocol_index
    └── backup.js         # protocol_backup
```

### Design Principles
- **Modular Files** - Each protocol in separate file
- **Separation of Concerns** - Handlers, data, utilities separated
- **Reliable Access** - Hardcoded data cannot be lost
- **Extensible** - Easy to add protocols without touching existing code
- **Testable** - Each module independently testable

## Usage Examples

### Error Handling
```bash
# When an error occurs
protocol_triggers "error occurred"
# Returns: Error Recovery Protocol with systematic approach

# Get full error handling guide
protocol_read error-recovery
# Returns: Complete protocol with decision trees
```

### User Communication
```bash
# When user seems confused
protocol_triggers "user confused"
# Returns: User Communication Protocol

# Get communication strategies
protocol_read user-communication  
# Returns: Communication framework and templates
```

### Complex Tasks
```bash
# For long, multi-step tasks
protocol_triggers "long task"
# Returns: Progress Communication Protocol

# Get progress reporting guide
protocol_read progress-communication
# Returns: Progress templates and timing guidelines
```

## System Status

### ✅ **Reliability Achieved**
- Protocol access cannot fail
- Data is hardcoded in multiple modular files
- Backup and restore capabilities built-in
- No dependency on external file systems

### ✅ **Foundation Complete**
- All 5 foundation protocols implemented
- Formal trigger conditions for all protocols
- Systematic activation mechanisms
- Quality assurance framework

### 🔄 **Next Phase Ready**
- Add Tier 1 system protocols
- Map protocol dependencies
- Enhance integration features
- Add effectiveness metrics

## Integration

### With Claude Sessions
The MCP server provides reliable protocol access for any Claude session:

```bash
# Never lose protocols again
protocol_index  # Always available

# Situation-based help  
protocol_triggers "need help with X"

# Complete protocol content
protocol_read <any-protocol-id>
```

### With Existing Systems
- **Brain Memory**: Complementary persistent storage
- **Protocol Tracker**: Compliance monitoring integration
- **Obsidian**: Secondary documentation storage
- **Todo Manager**: Protocol development tracking

## Development

### Adding New Protocols
1. Create protocol file in `src/protocols/[tier]/`
2. Add to registry in `src/registry.js`
3. Test with existing handlers
4. No changes needed to server code

### Testing
```bash
npm test
npm run lint
```

### Building
```bash
npm run build
```

## Success Metrics

- ✅ **100% Protocol Accessibility** - Never "protocol not found" 
- ✅ **Modular Architecture** - Easy maintenance and extension
- ✅ **Comprehensive Coverage** - All foundation protocols included
- ✅ **Backup Capability** - Complete system backup available
- ✅ **Search & Discovery** - Find protocols by situation or keywords

---

**🚀 Achievement**: First reliable, self-backed AI protocol system with hardcoded access guarantees. Protocols are now infrastructure, not documentation.

**💡 Impact**: Transforms protocols from fragile documentation into reliable, always-accessible operational systems.