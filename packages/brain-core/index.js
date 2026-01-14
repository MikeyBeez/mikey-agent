#!/usr/bin/env node

/**
 * Brain Core Tools Server
 * 
 * Provides essential Brain tools WITHOUT the broken brain_init_v5
 * Only includes: brain_remember, brain_recall, brain_execute, brain_status, etc.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import Database from 'better-sqlite3';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

// Safe JSON helper to handle emojis and special characters
function safeJsonStringify(obj, space) {
  try {
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'string') {
        // Replace problematic Unicode characters
        return value.replace(/[😀-🙏]|[🌀-🗿]|[🚀-🛿]|[🇠-🇿]|[☀-⛿]|[✀-➿]|[🤀-🧿]/gu, (match) => {
          const codePoint = match.codePointAt(0);
          return `\\u{${codePoint.toString(16)}}`;
        });
      }
      return value;
    }, space);
  } catch (error) {
    console.error('JSON stringify error:', error);
    return JSON.stringify({ error: 'Serialization failed', message: error.message });
  }
}



const execAsync = promisify(exec);

// Configuration
const BRAIN_DB_PATH = process.env.BRAIN_DB_PATH || '/Users/bard/mcp/brain-data/brain.db';

// Ensure database directory exists
const dbDir = path.dirname(BRAIN_DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database
function initializeDatabase() {
  const db = new Database(BRAIN_DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS memories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      type TEXT DEFAULT 'general',
      metadata TEXT DEFAULT '{}',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_memories_key ON memories(key);
    CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(type);
  `);
  db.close();
}

initializeDatabase();

const server = new Server(
  {
    name: 'brain-core',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
const tools = [
  {
    name: 'brain_remember',
    description: 'Store information in Brain memory',
    inputSchema: {
      type: 'object',
      properties: {
        key: { type: 'string', description: 'Memory key' },
        value: { description: 'Value to remember' },
        type: { type: 'string', description: 'Memory type', default: 'general' }
      },
      required: ['key', 'value']
    }
  },
  {
    name: 'brain_recall',
    description: 'Search through Brain memories',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        limit: { type: 'number', description: 'Max results', default: 10 }
      },
      required: ['query']
    }
  },
  {
    name: 'brain_status',
    description: 'Check Brain system status',
    inputSchema: {
      type: 'object',
      properties: {
        detailed: { type: 'boolean', default: false }
      }
    }
  },
  {
    name: 'brain_execute',
    description: 'Execute Python or Shell code',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Code to execute' },
        language: { type: 'string', enum: ['python', 'shell', 'auto'], default: 'auto' },
        description: { type: 'string', description: 'What this code does' }
      },
      required: ['code']
    }
  },
  {
    name: 'brain_forget',
    description: 'Delete a memory from Brain storage by key',
    inputSchema: {
      type: 'object',
      properties: {
        key: { type: 'string', description: 'Memory key to delete' },
        type: { type: 'string', description: 'Memory type filter (optional)' }
      },
      required: ['key']
    }
  },
  {
    name: 'brain_list_memories',
    description: 'List all memories with their keys and types',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Maximum memories to return', default: 20 },
        type: { type: 'string', description: 'Filter by memory type (optional)' }
      }
    }
  }
];

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Tool handlers
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'brain_remember': {
        const { key, value, type = 'general' } = args;
        const db = new Database(BRAIN_DB_PATH);
        
        const stmt = db.prepare(`
          INSERT OR REPLACE INTO memories (key, value, type, metadata, updated_at)
          VALUES (?, ?, ?, '{}', CURRENT_TIMESTAMP)
        `);
        
        stmt.run(key, safeJsonStringify(value), type);
        db.close();
        
        return {
          content: [
            {
              type: 'text',
              text: `(ok) Stored memory: ${key}`
            }
          ]
        };
      }

      case 'brain_recall': {
        const { query, limit = 10 } = args;
        const db = new Database(BRAIN_DB_PATH);
        
        const memories = db.prepare(`
          SELECT key, value, type, created_at 
          FROM memories 
          WHERE key LIKE ? OR value LIKE ?
          ORDER BY updated_at DESC
          LIMIT ?
        `).all(`%${query}%`, `%${query}%`, limit);
        
        db.close();
        
        return {
          content: [
            {
              type: 'text',
              text: `(brain) Found ${memories.length} memories:\\n\\n${memories.map(m => 
                `**${m.key}** (${m.type}):\\n${safeJsonParse(m.value, m.value)}\\n`
              ).join('\\n')}`
            }
          ]
        };
      }

      case 'brain_status': {
        const { detailed = false } = args;
        const db = new Database(BRAIN_DB_PATH);
        
        const count = db.prepare('SELECT COUNT(*) as count FROM memories').get();
        const types = db.prepare('SELECT type, COUNT(*) as count FROM memories GROUP BY type').all();
        
        db.close();
        
        let status = `(brain) Brain Status:\\n`;
        status += `Total memories: ${count.count}\\n`;
        status += `Memory types: ${types.map(t => `${t.type} (${t.count})`).join(', ')}\\n`;
        status += `Database: ${BRAIN_DB_PATH}\\n`;
        
        return {
          content: [
            {
              type: 'text', 
              text: status
            }
          ]
        };
      }

      case 'brain_execute': {
        const { code, language = 'auto', description } = args;
        
        let command;
        if (language === 'python' || (language === 'auto' && code.includes('import '))) {
          command = `python3 -c "${code.replace(/"/g, '\\\\"')}"`;
        } else {
          command = code;
        }
        
        const { stdout, stderr } = await execAsync(command);
        
        return {
          content: [
            {
              type: 'text',
              text: `(ok) Execution completed:\\n\\n**Output:**\\n${stdout}\\n\\n${stderr ? `**Errors:**\\n${stderr}` : ''}`
            }
          ]
        };
      }

      case 'brain_forget': {
        const { key, type } = args;
        const db = new Database(BRAIN_DB_PATH);
        
        let stmt;
        if (type) {
          stmt = db.prepare('DELETE FROM memories WHERE key = ? AND type = ?');
          stmt.run(key, type);
        } else {
          stmt = db.prepare('DELETE FROM memories WHERE key = ?');
          stmt.run(key);
        }
        
        const changes = stmt.changes;
        db.close();
        
        return {
          content: [
            {
              type: 'text',
              text: changes > 0 ? `(ok) Deleted memory: ${key}` : `(error) Memory not found: ${key}`
            }
          ]
        };
      }

      case 'brain_list_memories': {
        const { limit = 20, type } = args;
        const db = new Database(BRAIN_DB_PATH);
        
        let memories;
        if (type) {
          memories = db.prepare(`
            SELECT key, type, created_at, updated_at
            FROM memories 
            WHERE type = ?
            ORDER BY updated_at DESC 
            LIMIT ?
          `).all(type, limit);
        } else {
          memories = db.prepare(`
            SELECT key, type, created_at, updated_at
            FROM memories 
            ORDER BY updated_at DESC 
            LIMIT ?
          `).all(limit);
        }
        
        db.close();
        
        return {
          content: [
            {
              type: 'text',
              text: `(brain) Brain Memories (${memories.length}):\\n\\n${memories.map(m => 
                `**${m.key}** (${m.type}) - ${m.updated_at}`
              ).join('\\n')}`
            }
          ]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Brain Core Tools server running');
}

main().catch(console.error);
