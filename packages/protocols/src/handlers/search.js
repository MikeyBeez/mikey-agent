// Protocol Search Handler - Modular MCP tool
const { searchProtocols, getProtocolsForSituation } = require('../registry');

function handleProtocolSearch(args) {
  const { query, trigger_situation } = args;
  
  let matchingProtocols = searchProtocols(query);

  if (trigger_situation) {
    // Add situation-based matching
    const situationMatches = getProtocolsForSituation(trigger_situation);
    matchingProtocols.push(...situationMatches);
  }

  // Remove duplicates
  const uniqueProtocols = matchingProtocols.filter((p, index, arr) => 
    arr.findIndex(protocol => protocol.id === p.id) === index
  );

  if (uniqueProtocols.length === 0) {
    return {
      content: [{
        type: 'text',
        text: `🔍 No protocols found matching "${query}"\n\n💡 **Try these search terms**:\n- "error" - Find error handling protocols\n- "user" - Find communication protocols\n- "multiple" - Find integration protocols\n- "task" - Find task analysis protocols\n- "progress" - Find progress communication protocols`
      }]
    };
  }

  return {
    content: [{
      type: 'text',
      text: `🔍 **Search Results** (${uniqueProtocols.length} protocols matching "${query}")\n\n` +
            uniqueProtocols.map(p => 
              `**${p.name}** (\`${p.id}\`)\n` +
              `- **Purpose**: ${p.purpose}\n` +
              `- **Key Triggers**: ${p.triggers.slice(0,2).join(', ')}${p.triggers.length > 2 ? '...' : ''}\n` +
              `- **Read**: \`mikey_protocol_read ${p.id}\`\n`
            ).join('\n')
    }]
  };
}

module.exports = { handleProtocolSearch };