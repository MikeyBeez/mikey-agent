#!/usr/bin/env node
// Standalone prompt processor for UserPromptSubmit hook
// Tracks protocol loading with prompt-count-based expiry

const fs = require('fs');
const path = require('path');

// Config
const RELOAD_AFTER_PROMPTS = 10;  // Reload protocol if loaded more than N prompts ago

// Keyword -> Protocol mappings
const TRIGGER_KEYWORDS = {
  'error': ['error-recovery'],
  'failed': ['error-recovery'],
  'broken': ['error-recovery'],
  'not working': ['error-recovery'],
  'bug': ['error-recovery'],
  'fix': ['error-recovery'],
  'issue': ['error-recovery'],
  'create project': ['create-project'],
  'new project': ['create-project'],
  'set up repo': ['create-project'],
  'scaffold': ['create-project'],
  'initialize': ['create-project'],
  'write article': ['medium-article', 'document-writing'],
  'medium': ['medium-article'],
  'blog post': ['medium-article'],
  'article': ['document-writing'],
  'document': ['document-writing'],
  'paper': ['document-writing'],
  'draft': ['document-writing'],
  'mcp': ['naming-linter', 'mcp-permissions'],
  'tool': ['naming-linter', 'protocol-graduation'],
  'permission': ['mcp-permissions'],
  'protocol': ['protocol-writing', 'protocol-lifecycle', 'protocol-error-correction'],
  'new protocol': ['protocol-writing'],
  'update protocol': ['protocol-error-correction'],
  'protocol failed': ['protocol-error-correction'],
  'architecture': ['architecture-update'],
  'moved': ['architecture-update'],
  'relocated': ['architecture-update'],
  'audit': ['system-audit'],
  'system audit': ['system-audit'],
};

// Quick response patterns - skip processing
const QUICK_RESPONSE_PATTERNS = [
  /^(yes|no|ok|okay|sure|thanks|thank you|got it|perfect|great|stop|done)\.?$/i,
  /^(open|show|reveal|display)\s+/i,
  /^what('s| is) (the )?(time|date)/i,
  /^\d+$/,
];

// Continuation patterns
const CONTINUATION_PATTERNS = [
  /^(please\s+)?continue(\s+on\s+\w+)?\.?$/i,
  /^(please\s+)?keep going\.?$/i,
  /^(please\s+)?go ahead\.?$/i,
  /^(please\s+)?proceed\.?$/i,
  /^back to\s+/i,
  /^resume\s+/i,
  /^let's continue/i,
  /^where were we/i,
];

// State file
const STATE_DIR = path.join(process.env.HOME, '.claude', 'state');
const STATE_FILE = path.join(STATE_DIR, 'protocol-state.json');

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch (e) {}
  return { promptCount: 0, protocols: {} };
}

function saveState(state) {
  try {
    fs.mkdirSync(STATE_DIR, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    // Silently fail - don't break the hook
  }
}

function processPrompt(prompt) {
  const promptLower = prompt.toLowerCase().trim();

  // Load and increment prompt count
  const state = loadState();
  state.promptCount++;
  const currentPrompt = state.promptCount;

  // Quick response?
  for (const pattern of QUICK_RESPONSE_PATTERNS) {
    if (pattern.test(promptLower)) {
      saveState(state);  // Still increment counter
      return { skip: true, reason: 'quick-response', promptCount: currentPrompt };
    }
  }

  // Continuation?
  for (const pattern of CONTINUATION_PATTERNS) {
    if (pattern.test(promptLower)) {
      saveState(state);
      return { skip: true, reason: 'continuation', promptCount: currentPrompt };
    }
  }

  // Find triggered protocols
  const triggered = new Set();
  const matchedKeywords = [];

  for (const [keyword, protocolIds] of Object.entries(TRIGGER_KEYWORDS)) {
    if (promptLower.includes(keyword)) {
      matchedKeywords.push(keyword);
      protocolIds.forEach(id => triggered.add(id));
    }
  }

  // Check each protocol: load if never loaded OR loaded > RELOAD_AFTER_PROMPTS ago
  const toLoad = [];
  const skipped = [];
  const expired = [];

  for (const protocolId of triggered) {
    const loadedAt = state.protocols[protocolId];

    if (loadedAt === undefined) {
      // Never loaded
      toLoad.push(protocolId);
    } else {
      const age = currentPrompt - loadedAt;
      if (age > RELOAD_AFTER_PROMPTS) {
        // Expired, needs reload
        toLoad.push(protocolId);
        expired.push({ id: protocolId, age });
      } else {
        // Recently loaded, skip
        skipped.push({ id: protocolId, age, remainingFresh: RELOAD_AFTER_PROMPTS - age });
      }
    }
  }

  saveState(state);

  return {
    skip: false,
    promptCount: currentPrompt,
    triggered: Array.from(triggered),
    toLoad,
    skipped,
    expired,
    matchedKeywords
  };
}

// Main - read prompt from stdin
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const prompt = data.prompt || '';
    const result = processPrompt(prompt);
    console.log(JSON.stringify(result));
  } catch (e) {
    console.log(JSON.stringify({ error: e.message, skip: true }));
  }
});
