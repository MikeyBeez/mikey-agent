// Protocol List Handler - Modular MCP tool
const { getProtocolsByTier, getProtocolsByStatus, getAllProtocols } = require('../registry');

function handleProtocolList(args) {
  const { tier, status } = args;
  let protocols = getAllProtocols();
  
  if (tier !== undefined) {
    protocols = getProtocolsByTier(tier);
  } else if (status) {
    protocols = getProtocolsByStatus(status);
  } else {
    protocols = Object.values(protocols);
  }

  const protocolList = protocols.map(p => ({
    id: p.id,
    name: p.name,
    version: p.version,
    tier: p.tier,
    purpose: p.purpose,
    status: p.status,
    triggers: p.triggers
  }));

  return {
    content: [{
      type: 'text',
      text: `📋 **Protocol List** (${protocolList.length} protocols)\n\n` +
            protocolList.map(p => 
              `**${p.name}** (v${p.version}) - Tier ${p.tier}\n` +
              `- **ID**: ${p.id}\n` +
              `- **Status**: ${p.status}\n` +
              `- **Purpose**: ${p.purpose}\n` +
              `- **Key Triggers**: ${p.triggers.slice(0,2).join(', ')}${p.triggers.length > 2 ? '...' : ''}\n`
            ).join('\n')
    }]
  };
}

module.exports = { handleProtocolList };