#!/usr/bin/env node
// MCP Protocols Server - Modular, reliable protocol access
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

// Import modular handlers
const { handleProtocolList } = require('./handlers/list');
const { handleProtocolRead } = require('./handlers/read');
const { handleProtocolSearch } = require('./handlers/search');
const { handleProtocolTriggers } = require('./handlers/triggers');
const { handleProtocolIndex } = require('./handlers/index');
const { handleProtocolBackup } = require('./handlers/backup');
const { handleProtocolHelp } = require('./handlers/help');
const { handleCheckImmutable } = require('./handlers/immutable');
const { handleChunkedStart, handleChunkedNext, handleChunkedStatus, handleChunkedAbort } = require('./handlers/chunked');

// Import tracking harness - automatic protocol access logging
const { withTracking, getTrackingStats, getHeatMap, getGraduationCandidates } = require('./harness/tracking');

// Create MCP server
const server = new Server(
  {
    name: 'mcp-protocols',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'mikey_protocol_list',
        description: '📋 List all available protocols with metadata and triggers',
        inputSchema: {
          type: 'object',
          properties: {
            tier: {
              type: 'number',
              description: 'Filter by protocol tier (0=meta, 1=system, 2=foundation, 3=workflow)',
            },
            status: {
              type: 'string',
              description: 'Filter by status (active, inactive, deprecated)',
              enum: ['active', 'inactive', 'deprecated']
            }
          },
        },
      },
      {
        name: 'mikey_protocol_read',
        description: '📖 Read full content of a specific protocol with all trigger conditions',
        inputSchema: {
          type: 'object',
          properties: {
            protocol_id: {
              type: 'string',
              description: 'Protocol ID (error-recovery, user-communication, task-approach, information-integration, progress-communication)',
            },
          },
          required: ['protocol_id'],
        },
      },
      {
        name: 'mikey_protocol_search',
        description: '🔍 Search protocols by purpose, triggers, keywords, or situation',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query (purpose, triggers, keywords)',
            },
            trigger_situation: {
              type: 'string',
              description: 'Describe current situation to find relevant protocols',
            }
          },
          required: ['query'],
        },
      },
      {
        name: 'mikey_protocol_index',
        description: '📚 Get the complete Master Protocol Index with all system status',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'mikey_protocol_backup',
        description: '💾 Create backup of all protocol data (JSON or Markdown)',
        inputSchema: {
          type: 'object',
          properties: {
            format: {
              type: 'string',
              description: 'Backup format (json, markdown)',
              enum: ['json', 'markdown']
            }
          },
        },
      },
      {
        name: 'mikey_protocol_triggers',
        description: '🎯 Get recommended protocols for a specific situation with trigger analysis',
        inputSchema: {
          type: 'object',
          properties: {
            situation: {
              type: 'string',
              description: 'Current situation or context (e.g., "error occurred", "user confused", "multiple sources", "long task")',
            },
          },
          required: ['situation'],
        },
      },
      {
        name: 'mikey_protocol_help',
        description: '📚 Get comprehensive documentation for all protocol functions',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'mikey_protocol_check_immutable',
        description: '🔒 Check if a proposed change violates immutable sections of a protocol',
        inputSchema: {
          type: 'object',
          properties: {
            protocol_id: {
              type: 'string',
              description: 'Protocol ID to check'
            },
            proposed_change: {
              type: 'string',
              description: 'Description of the proposed change'
            },
            target_section: {
              type: 'string',
              description: 'Which section would be modified'
            }
          },
          required: ['protocol_id', 'proposed_change']
        }
      },
      {
        name: 'mikey_protocol_chunk_start',
        description: '🚀 Start executing a protocol in chunks with state handoff between steps',
        inputSchema: {
          type: 'object',
          properties: {
            protocol_id: {
              type: 'string',
              description: 'Protocol ID to execute in chunks'
            },
            context: {
              type: 'object',
              description: 'Initial context/state to pass through execution'
            }
          },
          required: ['protocol_id']
        }
      },
      {
        name: 'mikey_protocol_chunk_next',
        description: '⏭️ Advance to the next chunk with state handoff',
        inputSchema: {
          type: 'object',
          properties: {
            execution_id: {
              type: 'string',
              description: 'Execution ID from chunk_start'
            },
            state_updates: {
              type: 'object',
              description: 'State updates from completed chunk to pass forward'
            },
            chunk_outcome: {
              type: 'string',
              description: 'Outcome of the completed chunk',
              enum: ['completed', 'partial', 'skipped', 'failed']
            }
          },
          required: ['execution_id']
        }
      },
      {
        name: 'mikey_protocol_chunk_status',
        description: '📊 Get status of active chunked executions',
        inputSchema: {
          type: 'object',
          properties: {
            execution_id: {
              type: 'string',
              description: 'Specific execution ID (omit to list all active)'
            }
          }
        }
      },
      {
        name: 'mikey_protocol_chunk_abort',
        description: '🛑 Abort an active chunked execution',
        inputSchema: {
          type: 'object',
          properties: {
            execution_id: {
              type: 'string',
              description: 'Execution ID to abort'
            },
            reason: {
              type: 'string',
              description: 'Reason for aborting'
            }
          },
          required: ['execution_id']
        }
      },
      // Harness tracking tools - automatic protocol access monitoring
      {
        name: 'mikey_protocol_harness_stats',
        description: '📊 Get protocol access tracking statistics from the harness',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'mikey_protocol_harness_heatmap',
        description: '🔥 Get protocol usage heat map (frequency + recency)',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Max protocols to return (default 10)'
            }
          }
        }
      },
      {
        name: 'mikey_protocol_harness_graduation',
        description: '🎓 Get protocols that are candidates for graduation to tools',
        inputSchema: {
          type: 'object',
          properties: {
            threshold: {
              type: 'number',
              description: 'Minimum accesses to qualify (default 10)'
            }
          }
        }
      }
    ],
  };
});

// Tool call handlers - Modular routing with harness wrapping
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'mikey_protocol_list':
        return withTracking(handleProtocolList, 'list')(args);

      case 'mikey_protocol_read':
        return withTracking(handleProtocolRead, 'read')(args);

      case 'mikey_protocol_search':
        return withTracking(handleProtocolSearch, 'search')(args);

      case 'mikey_protocol_triggers':
        return withTracking(handleProtocolTriggers, 'triggers')(args);

      case 'mikey_protocol_index':
        return withTracking(handleProtocolIndex, 'index')(args);

      case 'mikey_protocol_backup':
        return handleProtocolBackup(args);

      case 'mikey_protocol_help':
        return handleProtocolHelp(args);

      case 'mikey_protocol_check_immutable':
        return withTracking(handleCheckImmutable, 'immutable_check')(args);

      case 'mikey_protocol_chunk_start':
        return withTracking(handleChunkedStart, 'chunk_start')(args);

      case 'mikey_protocol_chunk_next':
        return handleChunkedNext(args);

      case 'mikey_protocol_chunk_status':
        return handleChunkedStatus(args);

      case 'mikey_protocol_chunk_abort':
        return handleChunkedAbort(args);

      // Harness tracking endpoints
      case 'mikey_protocol_harness_stats':
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(getTrackingStats(), null, 2)
          }]
        };

      case 'mikey_protocol_harness_heatmap':
        const limit = args.limit || 10;
        return {
          content: [{
            type: 'text',
            text: `🔥 **Protocol Heat Map** (Top ${limit})\n\n` +
                  JSON.stringify(getHeatMap().slice(0, limit), null, 2)
          }]
        };

      case 'mikey_protocol_harness_graduation':
        const threshold = args.threshold || 10;
        const candidates = getGraduationCandidates(threshold);
        return {
          content: [{
            type: 'text',
            text: candidates.length > 0
              ? `🎓 **Graduation Candidates** (≥${threshold} accesses)\n\n` +
                JSON.stringify(candidates, null, 2)
              : `No protocols have reached ${threshold} accesses yet. Keep using protocols to build heat map data.`
          }]
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `❌ Error in ${name}: ${error.message}\n\nThis error has been logged for system improvement.`
      }]
    };
  }
});

// Start the server
const transport = new StdioServerTransport();
server.connect(transport);

// Server ready message
console.error('🔧 mcp-protocols server running - reliable protocol access enabled!');
console.error('📋 Available tools: mikey_protocol_list, mikey_protocol_read, mikey_protocol_search, mikey_protocol_triggers, mikey_protocol_index, mikey_protocol_backup, mikey_protocol_help');
console.error('🎯 Quick start: mikey_protocol_triggers "error occurred" or mikey_protocol_list');
