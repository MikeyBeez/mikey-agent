// Protocol Backup Handler - Modular MCP tool
const { getAllProtocols, getMasterIndex } = require('../registry');

function handleProtocolBackup(args) {
  const { format = 'json' } = args;
  
  if (format === 'json') {
    return {
      content: [{
        type: 'text',
        text: `📦 **Protocol System Backup** (JSON)\n\n\`\`\`json\n${JSON.stringify(getAllProtocols(), null, 2)}\n\`\`\``
      }]
    };
  } else {
    // Markdown format
    const protocols = Object.values(getAllProtocols());
    const markdownBackup = protocols.map(p => 
      `# ${p.name}\n\n` +
      `**ID**: ${p.id}\n` +
      `**Version**: ${p.version}\n` +
      `**Tier**: ${p.tier}\n` +
      `**Purpose**: ${p.purpose}\n` +
      `**Status**: ${p.status}\n` +
      `**Location**: ${p.location}\n\n` +
      `**Triggers**:\n${p.triggers.map(t => `- ${t}`).join('\n')}\n\n` +
      `**Content**:\n\n${p.content}\n\n---\n\n`
    ).join('');

    return {
      content: [{
        type: 'text',
        text: `📦 **Protocol System Backup** (Markdown)\n\n## Master Protocol Index\n\n${getMasterIndex()}\n\n---\n\n## Individual Protocols\n\n${markdownBackup}`
      }]
    };
  }
}

module.exports = { handleProtocolBackup };