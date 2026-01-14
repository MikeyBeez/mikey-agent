#!/usr/bin/env node

/**
 * Mikey Naming Registry Linter
 * 
 * Validates MCP tool names against the canonical naming registry.
 * Run against source files to ensure consistency and avoid collisions.
 * 
 * Usage:
 *   node lint.js <file-or-directory>
 *   node lint.js --scan-all     # Scan all known MCP servers
 *   node lint.js --report       # Generate full compliance report
 */

const fs = require('fs');
const path = require('path');

// Load registry
const REGISTRY_PATH = path.join(__dirname, 'registry.json');
let registry;

try {
  registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
} catch (e) {
  console.error('❌ Failed to load registry.json:', e.message);
  process.exit(1);
}

// Patterns to find tool definitions in code
const TOOL_PATTERNS = [
  // MCP SDK patterns
  /server\.tool\s*\(\s*["']([^"']+)["']/g,
  /name:\s*["']([^"']+)["']/g,
  // FastMCP patterns
  /@mcp\.tool\s*\(\s*["']([^"']+)["']/g,
  // Generic tool registration
  /registerTool\s*\(\s*["']([^"']+)["']/g,
  /tools\s*\[\s*["']([^"']+)["']\s*\]/g,
];

// Linter results
const results = {
  errors: [],
  warnings: [],
  info: [],
  passed: [],
  scannedFiles: 0,
  totalTools: 0
};

/**
 * Extract tool names from a source file
 */
function extractToolNames(content, filePath) {
  const tools = new Set();
  
  for (const pattern of TOOL_PATTERNS) {
    // Reset regex state
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const toolName = match[1];
      // Filter out common false positives
      if (toolName && 
          toolName.length > 2 && 
          !toolName.includes('/') &&
          !toolName.includes('.') &&
          !toolName.startsWith('http')) {
        tools.add(toolName);
      }
    }
  }
  
  return Array.from(tools);
}

/**
 * Check if a tool name is registered in the canonical registry
 */
function isRegistered(toolName) {
  for (const server of Object.values(registry.servers)) {
    if (server.tools && server.tools.includes(toolName)) {
      return true;
    }
  }
  return false;
}

/**
 * Validate a single tool name against linter rules
 */
function validateToolName(toolName, filePath) {
  const issues = [];
  const rules = registry.linterRules;
  
  // Check mikey_ prefix requirement
  if (rules.requireMikeyPrefix.enabled) {
    // Skip third-party tools or tools that are clearly not ours
    const isLikelyCustom = !toolName.includes('_') || 
                           toolName.startsWith('brain_') ||
                           toolName.startsWith('state_') ||
                           toolName.startsWith('manager_') ||
                           toolName.startsWith('protocol_');
    
    if (isLikelyCustom && !toolName.startsWith('mikey_')) {
      // Check if it uses a reserved prefix
      const usesReserved = registry.namingConventions.reservedPrefixes.some(
        prefix => toolName.startsWith(prefix)
      );
      
      if (usesReserved) {
        issues.push({
          severity: 'error',
          rule: 'noReservedPrefixes',
          message: `Tool '${toolName}' uses reserved prefix. Should be 'mikey_${toolName.replace(/^(brain_|state_|manager_|protocol_)/, '')}'`,
          file: filePath
        });
      }
    }
  }
  
  // Check for generic names without prefix
  if (rules.noGenericNames.enabled) {
    const isGeneric = rules.noGenericNames.patterns.some(
      pattern => new RegExp(pattern).test(toolName)
    );
    if (isGeneric) {
      issues.push({
        severity: 'warning',
        rule: 'noGenericNames',
        message: `Tool '${toolName}' is a generic name. Consider using 'mikey_${toolName}'`,
        file: filePath
      });
    }
  }
  
  // Check collision risks
  for (const risk of registry.collisionRisks.high) {
    if (new RegExp(risk.pattern).test(toolName) && !toolName.startsWith('mikey_')) {
      issues.push({
        severity: 'error',
        rule: 'collisionRisk',
        message: `Tool '${toolName}' has high collision risk: ${risk.reason}`,
        file: filePath
      });
    }
  }
  
  // Check if registered
  if (toolName.startsWith('mikey_') && !isRegistered(toolName)) {
    issues.push({
      severity: 'info',
      rule: 'notRegistered',
      message: `Tool '${toolName}' is not in the canonical registry - consider adding it`,
      file: filePath
    });
  }
  
  return issues;
}

/**
 * Lint a single file
 */
function lintFile(filePath) {
  if (!fs.existsSync(filePath)) {
    results.errors.push({
      severity: 'error',
      message: `File not found: ${filePath}`,
      file: filePath
    });
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const tools = extractToolNames(content, filePath);
  
  results.scannedFiles++;
  results.totalTools += tools.length;
  
  for (const tool of tools) {
    const issues = validateToolName(tool, filePath);
    
    if (issues.length === 0 && tool.startsWith('mikey_')) {
      results.passed.push({ tool, file: filePath });
    }
    
    for (const issue of issues) {
      if (issue.severity === 'error') {
        results.errors.push(issue);
      } else if (issue.severity === 'warning') {
        results.warnings.push(issue);
      } else {
        results.info.push(issue);
      }
    }
  }
}

/**
 * Check if a filename should be ignored based on registry patterns
 */
function shouldIgnoreFile(filename) {
  if (!registry.ignorePatterns || !registry.ignorePatterns.files) return false;

  for (const pattern of registry.ignorePatterns.files) {
    // Convert glob pattern to regex
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*');
    if (new RegExp(regexPattern).test(filename)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if a directory should be ignored
 */
function shouldIgnoreDir(dirname) {
  if (!registry.ignorePatterns || !registry.ignorePatterns.directories) return false;
  return registry.ignorePatterns.directories.includes(dirname);
}

/**
 * Lint a directory recursively
 */
function lintDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    // Skip hidden directories and ignored directories
    if (entry.name.startsWith('.') || shouldIgnoreDir(entry.name)) {
      continue;
    }

    if (entry.isDirectory()) {
      lintDirectory(fullPath);
    } else if (entry.isFile() && /\.(js|ts|mjs)$/.test(entry.name)) {
      // Skip ignored file patterns
      if (shouldIgnoreFile(entry.name)) {
        continue;
      }
      lintFile(fullPath);
    }
  }
}

/**
 * Scan all known MCP servers from the registry
 */
function scanAllServers() {
  console.log('🔍 Scanning all registered MCP servers...\n');
  
  for (const [name, server] of Object.entries(registry.servers)) {
    const serverPath = server.path;
    const serverDir = path.dirname(serverPath);
    
    if (fs.existsSync(serverDir)) {
      console.log(`📦 Scanning ${name}...`);
      lintDirectory(serverDir);
    } else {
      console.log(`⚠️  Server directory not found: ${serverDir}`);
    }
  }
}

/**
 * Print results
 */
function printResults() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIKEY NAMING REGISTRY LINT REPORT');
  console.log('='.repeat(60) + '\n');
  
  console.log(`Files scanned: ${results.scannedFiles}`);
  console.log(`Tools found: ${results.totalTools}`);
  console.log(`Passed: ${results.passed.length}`);
  console.log(`Errors: ${results.errors.length}`);
  console.log(`Warnings: ${results.warnings.length}`);
  console.log(`Info: ${results.info.length}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS:\n');
    for (const err of results.errors) {
      console.log(`  [${err.rule}] ${err.message}`);
      console.log(`    File: ${err.file}\n`);
    }
  }
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:\n');
    for (const warn of results.warnings) {
      console.log(`  [${warn.rule}] ${warn.message}`);
      console.log(`    File: ${warn.file}\n`);
    }
  }
  
  if (results.info.length > 0) {
    console.log('\nℹ️  INFO:\n');
    for (const info of results.info) {
      console.log(`  [${info.rule}] ${info.message}`);
      console.log(`    File: ${info.file}\n`);
    }
  }
  
  if (results.passed.length > 0 && process.argv.includes('--verbose')) {
    console.log('\n✅ PASSED:\n');
    for (const pass of results.passed) {
      console.log(`  ${pass.tool} (${path.basename(pass.file)})`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  
  // Exit code based on errors
  if (results.errors.length > 0) {
    console.log('❌ Lint failed with errors');
    process.exit(1);
  } else if (results.warnings.length > 0) {
    console.log('⚠️  Lint passed with warnings');
    process.exit(0);
  } else {
    console.log('✅ Lint passed');
    process.exit(0);
  }
}

/**
 * Generate full compliance report
 */
function generateReport() {
  console.log('📋 MIKEY NAMING REGISTRY - FULL COMPLIANCE REPORT\n');
  console.log(`Generated: ${new Date().toISOString()}`);
  console.log(`Registry Version: ${registry.version}\n`);
  
  console.log('REGISTERED SERVERS AND TOOLS:\n');
  
  for (const [name, server] of Object.entries(registry.servers)) {
    console.log(`📦 ${name}`);
    console.log(`   Path: ${server.path}`);
    console.log(`   Description: ${server.description}`);
    console.log(`   Tools (${server.tools.length}):`);
    for (const tool of server.tools) {
      console.log(`     - ${tool}`);
    }
    console.log('');
  }
  
  console.log('\nNAMING CONVENTIONS:');
  console.log(`  Tool Prefix: ${registry.namingConventions.toolPrefix}`);
  console.log(`  Server Prefix: ${registry.namingConventions.serverPrefix}`);
  console.log(`  Protocol Prefix: ${registry.namingConventions.protocolPrefix}`);
  console.log(`  Reserved Prefixes: ${registry.namingConventions.reservedPrefixes.join(', ')}`);
  
  console.log('\nCOLLISION RISKS:');
  console.log('  High Risk Patterns:');
  for (const risk of registry.collisionRisks.high) {
    console.log(`    ${risk.pattern} - ${risk.reason}`);
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Mikey Naming Registry Linter\n');
  console.log('Usage:');
  console.log('  node lint.js <file-or-directory>  - Lint specific path');
  console.log('  node lint.js --scan-all           - Scan all registered servers');
  console.log('  node lint.js --report             - Generate compliance report');
  console.log('  node lint.js --verbose            - Show passed tools too');
  process.exit(0);
}

if (args.includes('--report')) {
  generateReport();
} else if (args.includes('--scan-all')) {
  scanAllServers();
  printResults();
} else {
  // Lint specified paths
  for (const arg of args) {
    if (arg.startsWith('--')) continue;
    
    const targetPath = path.resolve(arg);
    const stat = fs.statSync(targetPath);
    
    if (stat.isDirectory()) {
      console.log(`📁 Linting directory: ${targetPath}\n`);
      lintDirectory(targetPath);
    } else {
      console.log(`📄 Linting file: ${targetPath}\n`);
      lintFile(targetPath);
    }
  }
  printResults();
}
