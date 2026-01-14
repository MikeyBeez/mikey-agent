// Chunked Protocol Execution Handler
// Enables executing protocols in chunks with state handoff between steps

const { getProtocol } = require('../registry');

// In-memory state store for active chunked executions
// In production, this would be persisted to a database
const activeExecutions = new Map();

/**
 * Parse a protocol into executable chunks
 * Looks for numbered steps, phases, or clear section breaks
 */
function parseIntoChunks(protocol) {
  const content = protocol.content;
  const chunks = [];

  // Split by numbered steps (1., 2., 3., etc.) or phases
  const stepPattern = /(?:^|\n)(?:#{1,3}\s*)?(?:(?:Step|Phase|Stage)\s*)?(\d+)[.:]\s*([^\n]+)/gi;
  const matches = [...content.matchAll(stepPattern)];

  if (matches.length >= 2) {
    for (let i = 0; i < matches.length; i++) {
      const startIdx = matches[i].index;
      const endIdx = i + 1 < matches.length ? matches[i + 1].index : content.length;

      chunks.push({
        id: `chunk_${i + 1}`,
        step_number: parseInt(matches[i][1]),
        title: matches[i][2].trim(),
        content: content.slice(startIdx, endIdx).trim(),
        dependencies: i > 0 ? [`chunk_${i}`] : []
      });
    }
  } else {
    // Fallback: split by major sections (## headers)
    const sections = content.split(/(?=\n##\s+[^#])/);
    sections.forEach((section, i) => {
      const titleMatch = section.match(/^(?:\n)?##\s+([^\n]+)/);
      chunks.push({
        id: `chunk_${i + 1}`,
        step_number: i + 1,
        title: titleMatch ? titleMatch[1].trim() : `Section ${i + 1}`,
        content: section.trim(),
        dependencies: i > 0 ? [`chunk_${i}`] : []
      });
    });
  }

  return chunks;
}

/**
 * Start a new chunked execution
 */
function handleChunkedStart({ protocol_id, context = {} }) {
  const protocol = getProtocol(protocol_id);

  if (!protocol) {
    return {
      content: [{
        type: 'text',
        text: `❌ Protocol not found: ${protocol_id}`
      }]
    };
  }

  const chunks = parseIntoChunks(protocol);

  if (chunks.length < 2) {
    return {
      content: [{
        type: 'text',
        text: `⚠️ Protocol "${protocol_id}" has too few steps to chunk (${chunks.length}). Use mikey_protocol_read instead.`
      }]
    };
  }

  const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const execution = {
    id: executionId,
    protocol_id,
    protocol_name: protocol.name,
    started_at: new Date().toISOString(),
    chunks,
    current_chunk_idx: 0,
    state: {
      ...context,
      _execution_id: executionId,
      _protocol_id: protocol_id,
      _started_at: new Date().toISOString()
    },
    completed_chunks: [],
    status: 'active'
  };

  activeExecutions.set(executionId, execution);

  let output = `🚀 Chunked Execution Started\n`;
  output += `════════════════════════════\n\n`;
  output += `📋 Protocol: ${protocol.name}\n`;
  output += `🆔 Execution ID: ${executionId}\n`;
  output += `📊 Total chunks: ${chunks.length}\n\n`;
  output += `📑 Chunks to execute:\n`;

  chunks.forEach((chunk, i) => {
    output += `   ${i + 1}. ${chunk.title}\n`;
  });

  output += `\n═══════════════════════════════════════\n`;
  output += `🎯 CHUNK 1/${chunks.length}: ${chunks[0].title}\n`;
  output += `═══════════════════════════════════════\n\n`;
  output += chunks[0].content;
  output += `\n\n💡 When done with this chunk, call:\n`;
  output += `   mikey_protocol_chunk_next execution_id="${executionId}" state_updates=<any new state>`;

  return {
    content: [{
      type: 'text',
      text: output
    }]
  };
}

/**
 * Advance to the next chunk with state handoff
 */
function handleChunkedNext({ execution_id, state_updates = {}, chunk_outcome = 'completed' }) {
  const execution = activeExecutions.get(execution_id);

  if (!execution) {
    return {
      content: [{
        type: 'text',
        text: `❌ Execution not found: ${execution_id}\n\nActive executions: ${activeExecutions.size === 0 ? 'None' : Array.from(activeExecutions.keys()).join(', ')}`
      }]
    };
  }

  if (execution.status !== 'active') {
    return {
      content: [{
        type: 'text',
        text: `⚠️ Execution ${execution_id} is not active (status: ${execution.status})`
      }]
    };
  }

  // Record completion of current chunk
  const currentChunk = execution.chunks[execution.current_chunk_idx];
  execution.completed_chunks.push({
    chunk_id: currentChunk.id,
    title: currentChunk.title,
    outcome: chunk_outcome,
    completed_at: new Date().toISOString()
  });

  // Merge state updates
  execution.state = {
    ...execution.state,
    ...state_updates,
    _last_chunk: currentChunk.id,
    _last_updated: new Date().toISOString()
  };

  // Advance to next chunk
  execution.current_chunk_idx++;

  // Check if we're done
  if (execution.current_chunk_idx >= execution.chunks.length) {
    execution.status = 'completed';
    execution.completed_at = new Date().toISOString();

    let output = `✅ Chunked Execution Complete!\n`;
    output += `════════════════════════════\n\n`;
    output += `📋 Protocol: ${execution.protocol_name}\n`;
    output += `🆔 Execution ID: ${execution_id}\n`;
    output += `⏱️ Duration: ${calculateDuration(execution.started_at, execution.completed_at)}\n\n`;
    output += `📊 Chunks Completed:\n`;

    execution.completed_chunks.forEach((c, i) => {
      output += `   ${i + 1}. ${c.title} - ${c.outcome}\n`;
    });

    output += `\n📦 Final State:\n`;
    output += JSON.stringify(execution.state, null, 2);

    // Keep in memory for a bit for reference, then clean up
    setTimeout(() => activeExecutions.delete(execution_id), 5 * 60 * 1000);

    return {
      content: [{
        type: 'text',
        text: output
      }]
    };
  }

  // Return next chunk
  const nextChunk = execution.chunks[execution.current_chunk_idx];
  const progress = execution.current_chunk_idx + 1;
  const total = execution.chunks.length;

  let output = `⏭️ Moving to Next Chunk\n`;
  output += `═══════════════════════\n\n`;
  output += `📊 Progress: ${progress}/${total} (${Math.round(progress/total*100)}%)\n`;
  output += `✅ Completed: ${currentChunk.title}\n\n`;
  output += `📦 Current State:\n`;
  output += JSON.stringify(execution.state, null, 2);
  output += `\n\n═══════════════════════════════════════\n`;
  output += `🎯 CHUNK ${progress}/${total}: ${nextChunk.title}\n`;
  output += `═══════════════════════════════════════\n\n`;
  output += nextChunk.content;
  output += `\n\n💡 When done with this chunk, call:\n`;
  output += `   mikey_protocol_chunk_next execution_id="${execution_id}" state_updates=<any new state>`;

  return {
    content: [{
      type: 'text',
      text: output
    }]
  };
}

/**
 * Get status of an active execution
 */
function handleChunkedStatus({ execution_id }) {
  if (!execution_id) {
    // List all active executions
    if (activeExecutions.size === 0) {
      return {
        content: [{
          type: 'text',
          text: `📋 No active chunked executions.\n\nStart one with: mikey_protocol_chunk_start protocol_id="<protocol>"`
        }]
      };
    }

    let output = `📋 Active Chunked Executions\n`;
    output += `════════════════════════════\n\n`;

    for (const [id, exec] of activeExecutions) {
      const progress = exec.current_chunk_idx + 1;
      const total = exec.chunks.length;
      output += `🆔 ${id}\n`;
      output += `   Protocol: ${exec.protocol_name}\n`;
      output += `   Progress: ${progress}/${total} (${Math.round(progress/total*100)}%)\n`;
      output += `   Status: ${exec.status}\n`;
      output += `   Started: ${exec.started_at}\n\n`;
    }

    return {
      content: [{
        type: 'text',
        text: output
      }]
    };
  }

  const execution = activeExecutions.get(execution_id);

  if (!execution) {
    return {
      content: [{
        type: 'text',
        text: `❌ Execution not found: ${execution_id}`
      }]
    };
  }

  const progress = execution.current_chunk_idx + 1;
  const total = execution.chunks.length;

  let output = `📊 Execution Status\n`;
  output += `═══════════════════\n\n`;
  output += `🆔 ID: ${execution_id}\n`;
  output += `📋 Protocol: ${execution.protocol_name}\n`;
  output += `📈 Progress: ${progress}/${total} (${Math.round(progress/total*100)}%)\n`;
  output += `🔄 Status: ${execution.status}\n`;
  output += `⏱️ Started: ${execution.started_at}\n\n`;

  output += `✅ Completed Chunks:\n`;
  execution.completed_chunks.forEach((c, i) => {
    output += `   ${i + 1}. ${c.title} - ${c.outcome}\n`;
  });

  if (execution.status === 'active') {
    const currentChunk = execution.chunks[execution.current_chunk_idx];
    output += `\n🎯 Current Chunk: ${currentChunk.title}\n`;
  }

  output += `\n📦 State:\n`;
  output += JSON.stringify(execution.state, null, 2);

  return {
    content: [{
      type: 'text',
      text: output
    }]
  };
}

/**
 * Abort an active execution
 */
function handleChunkedAbort({ execution_id, reason = 'User requested abort' }) {
  const execution = activeExecutions.get(execution_id);

  if (!execution) {
    return {
      content: [{
        type: 'text',
        text: `❌ Execution not found: ${execution_id}`
      }]
    };
  }

  execution.status = 'aborted';
  execution.aborted_at = new Date().toISOString();
  execution.abort_reason = reason;

  let output = `🛑 Execution Aborted\n`;
  output += `════════════════════\n\n`;
  output += `🆔 ID: ${execution_id}\n`;
  output += `📋 Protocol: ${execution.protocol_name}\n`;
  output += `📊 Progress: ${execution.current_chunk_idx + 1}/${execution.chunks.length}\n`;
  output += `❌ Reason: ${reason}\n\n`;
  output += `📦 Final State:\n`;
  output += JSON.stringify(execution.state, null, 2);

  // Keep for reference briefly
  setTimeout(() => activeExecutions.delete(execution_id), 5 * 60 * 1000);

  return {
    content: [{
      type: 'text',
      text: output
    }]
  };
}

function calculateDuration(start, end) {
  const ms = new Date(end) - new Date(start);
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

module.exports = {
  handleChunkedStart,
  handleChunkedNext,
  handleChunkedStatus,
  handleChunkedAbort
};
