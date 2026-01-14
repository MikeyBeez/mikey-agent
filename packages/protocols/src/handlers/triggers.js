// Protocol Triggers Handler - Modular MCP tool
const { getProtocolsForSituation } = require('../registry');

function handleProtocolTriggers(args) {
  const { situation } = args;
  
  const relevantProtocols = getProtocolsForSituation(situation);

  if (relevantProtocols.length === 0) {
    return {
      content: [{
        type: 'text',
        text: `🎯 **No specific protocols found for**: "${situation}"\n\n` +
              `💡 **Consider these foundation protocols**:\n` +
              `- **Task Approach Protocol**: For understanding what's needed\n` +
              `- **User Communication Protocol**: For effective interaction\n` +
              `- **Error Recovery Protocol**: For any issues that arise\n\n` +
              `**Quick access**:\n` +
              `- \`mikey_protocol_read task-approach\`\n` +
              `- \`mikey_protocol_read user-communication\`\n` +
              `- \`mikey_protocol_read error-recovery\``
      }]
    };
  }

  return {
    content: [{
      type: 'text',
      text: `🎯 **Recommended Protocols for**: "${situation}"\n\n` +
            relevantProtocols.map((p, index) => 
              `**${index + 1}. ${p.name}** (Tier ${p.tier})\n` +
              `- **Purpose**: ${p.purpose}\n` +
              `- **Matching Triggers**: ${p.triggers.filter(t => {
                const situationTerm = situation.toLowerCase();
                const trigger = t.toLowerCase();
                return situationTerm.includes(trigger) || trigger.includes(situationTerm);
              }).join(', ')}\n` +
              `- **Read**: \`mikey_protocol_read ${p.id}\`\n`
            ).join('\n') +
            `\n💡 **Quick Actions**:\n` +
            `- Use \`mikey_protocol_read ${relevantProtocols[0].id}\` for detailed guidance\n` +
            `- Multiple protocols may need to work together\n` +
            `- Use \`mikey_protocol_search\` to find additional relevant protocols`
    }]
  };
}

module.exports = { handleProtocolTriggers };