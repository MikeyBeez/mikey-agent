// Protocol Read Handler - Modular MCP tool
const { getProtocol, getAllProtocols } = require('../registry');

function handleProtocolRead(args) {
  const { protocol_id } = args;
  const protocol = getProtocol(protocol_id);
  
  if (!protocol) {
    const availableIds = Object.keys(getAllProtocols());
    return {
      content: [{
        type: 'text',
        text: `❌ Protocol '${protocol_id}' not found.\n\n**Available protocols**:\n${availableIds.map(id => `- ${id}`).join('\n')}\n\nUse \`mikey_protocol_list\` to see all protocols with details.`
      }]
    };
  }

  return {
    content: [{
      type: 'text',
      text: `📖 **${protocol.name}** (v${protocol.version})\n\n` +
            `**Purpose**: ${protocol.purpose}\n` +
            `**Tier**: ${protocol.tier} | **Status**: ${protocol.status}\n` +
            `**Location**: ${protocol.location}\n\n` +
            `**Triggers**:\n${protocol.triggers.map(t => `- ${t}`).join('\n')}\n\n` +
            `**Content**:\n\n${protocol.content}`
    }]
  };
}

module.exports = { handleProtocolRead };