// Protocol Index Handler - Modular MCP tool
const { getMasterIndex } = require('../registry');

function handleProtocolIndex(args) {
  return {
    content: [{
      type: 'text',
      text: getMasterIndex()
    }]
  };
}

module.exports = { handleProtocolIndex };