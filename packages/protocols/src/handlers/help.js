const { protocolRegistry } = require('../registry');

/**
 * Get comprehensive documentation for all protocol functions
 */
async function handleProtocolHelp() {
  const helpText = `
# 📚 MCP Protocols Server Help

## Purpose
Provides reliable, hardcoded access to protocol system with backup management.
Essential for Claude's protocol-driven architecture and systematic guidance.

## Available Tools

### 📋 mikey_protocol_list
List all available protocols with metadata and triggers:
- **tier**: Filter by protocol tier (0=meta, 1=system, 2=foundation, 3=workflow)
- **status**: Filter by status (active, inactive, deprecated)

### 📖 mikey_protocol_read
Read full content of a specific protocol with all trigger conditions:
- **protocol_id**: Protocol ID (error-recovery, user-communication, task-approach, etc.)

### 🔍 mikey_protocol_search
Search protocols by purpose, triggers, keywords, or situation:
- **query**: Search query (purpose, triggers, keywords)
- **trigger_situation**: Describe current situation to find relevant protocols

### 📚 mikey_protocol_index
Get the complete Master Protocol Index with all system status

### 💾 mikey_protocol_backup
Create backup of all protocol data:
- **format**: Backup format (json, markdown)

### 🎯 mikey_protocol_triggers
Get recommended protocols for a specific situation with trigger analysis:
- **situation**: Current situation or context

## Protocol Tiers
- **Tier 0 (Meta)**: Self-referential protocols that manage other protocols
- **Tier 1 (System)**: Core system operation protocols
- **Tier 2 (Foundation)**: Essential behavioral and communication protocols
- **Tier 3 (Workflow)**: Task and workflow management protocols

## Protocol Registry
Currently managing ${protocolRegistry.protocols.size} active protocols across ${protocolRegistry.getTierStats().tiers} tiers.

## Integration Points
- **Brain System**: Protocols stored in memory for quick access
- **Protocol Engine**: Executes protocols with step tracking
- **Protocol Tracker**: Monitors compliance and adherence

## Best Practices
1. **Start with mikey_protocol_index** for system overview
2. **Use mikey_protocol_search** when unsure which protocol applies
3. **Read full protocols** with mikey_protocol_read before execution
4. **Check triggers** with mikey_protocol_triggers for situation matching
5. **Backup regularly** using mikey_protocol_backup

## Architecture Role
The protocol system provides:
- **Systematic guidance** for complex tasks
- **Consistent behavior** across different situations  
- **Error recovery** mechanisms
- **Quality assurance** through structured approaches
- **Knowledge preservation** in executable form

## Status & Health
- **Registry Status**: ${protocolRegistry.isHealthy() ? 'Healthy' : 'Warning'}
- **Protocol Count**: ${protocolRegistry.protocols.size}
- **Last Updated**: Dynamic (protocols loaded from filesystem)
- **Backup Support**: Full JSON and Markdown export

For specific protocol information, use mikey_protocol_read with the protocol ID.
For situational guidance, use mikey_protocol_triggers with your current context.
`;

  return {
    content: [
      {
        type: 'text',
        text: helpText
      }
    ]
  };
}

module.exports = {
  handleProtocolHelp
};