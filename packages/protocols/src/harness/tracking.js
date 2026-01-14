// Protocol Tracking Harness - Automatic logging of protocol access
// "Every protocol access is a signal. Capture it or lose the pattern."

const fs = require('fs');
const path = require('path');

// Storage location for tracking data
const TRACKING_FILE = path.join(__dirname, '../../data/protocol-tracking.json');
const ARCHIVE_FILE = path.join(__dirname, '../../data/protocol-tracking-archive.json');
const DATA_DIR = path.join(__dirname, '../../data');

// Retention settings
const MAX_ACCESS_LOG_ENTRIES = 1000;  // Rolling window for recent accesses
const MAX_DAILY_STATS_DAYS = 30;      // Keep 30 days of daily stats

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Load existing tracking data
function loadTrackingData() {
  ensureDataDir();
  try {
    if (fs.existsSync(TRACKING_FILE)) {
      return JSON.parse(fs.readFileSync(TRACKING_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading tracking data:', error.message);
  }
  return {
    version: '1.0.0',
    created: new Date().toISOString(),
    accessLog: [],
    heatMap: {},
    dailyStats: {}
  };
}

// Save tracking data with rotation
function saveTrackingData(data) {
  ensureDataDir();
  data.lastUpdated = new Date().toISOString();

  // Rotate old daily stats to archive
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - MAX_DAILY_STATS_DAYS);
  const cutoffKey = cutoffDate.toISOString().split('T')[0];

  const oldDays = Object.keys(data.dailyStats).filter(day => day < cutoffKey);

  if (oldDays.length > 0) {
    // Load or create archive
    let archive = { archivedStats: {}, lastArchive: null };
    try {
      if (fs.existsSync(ARCHIVE_FILE)) {
        archive = JSON.parse(fs.readFileSync(ARCHIVE_FILE, 'utf8'));
      }
    } catch (e) { /* ignore */ }

    // Move old days to archive (aggregate into monthly buckets)
    for (const day of oldDays) {
      const monthKey = day.substring(0, 7); // YYYY-MM
      if (!archive.archivedStats[monthKey]) {
        archive.archivedStats[monthKey] = {
          totalAccesses: 0,
          byProtocol: {}
        };
      }
      archive.archivedStats[monthKey].totalAccesses += data.dailyStats[day].totalAccesses;
      for (const [proto, count] of Object.entries(data.dailyStats[day].byProtocol)) {
        archive.archivedStats[monthKey].byProtocol[proto] =
          (archive.archivedStats[monthKey].byProtocol[proto] || 0) + count;
      }
      delete data.dailyStats[day];
    }

    archive.lastArchive = new Date().toISOString();
    fs.writeFileSync(ARCHIVE_FILE, JSON.stringify(archive, null, 2));
  }

  fs.writeFileSync(TRACKING_FILE, JSON.stringify(data, null, 2));
}

// Track a protocol access - this is the harness wrapper
function trackProtocolAccess(protocolId, accessType = 'read', context = {}) {
  const data = loadTrackingData();
  const timestamp = new Date().toISOString();
  const dateKey = timestamp.split('T')[0]; // YYYY-MM-DD

  // Log the access
  const accessEntry = {
    protocolId,
    accessType, // 'read', 'search', 'triggers', 'chunk_start'
    timestamp,
    context: {
      // Sanitize context - only keep relevant, non-sensitive data
      source: context.source || 'unknown',
      sessionStart: context.sessionStart || null
    }
  };

  // Keep last 1000 accesses (rolling window)
  data.accessLog.push(accessEntry);
  if (data.accessLog.length > 1000) {
    data.accessLog = data.accessLog.slice(-1000);
  }

  // Update heat map
  if (!data.heatMap[protocolId]) {
    data.heatMap[protocolId] = {
      totalAccesses: 0,
      firstAccess: timestamp,
      lastAccess: timestamp,
      accessTypes: {}
    };
  }
  data.heatMap[protocolId].totalAccesses++;
  data.heatMap[protocolId].lastAccess = timestamp;
  data.heatMap[protocolId].accessTypes[accessType] =
    (data.heatMap[protocolId].accessTypes[accessType] || 0) + 1;

  // Update daily stats
  if (!data.dailyStats[dateKey]) {
    data.dailyStats[dateKey] = {
      totalAccesses: 0,
      uniqueProtocols: [],
      byProtocol: {}
    };
  }
  data.dailyStats[dateKey].totalAccesses++;
  if (!data.dailyStats[dateKey].uniqueProtocols.includes(protocolId)) {
    data.dailyStats[dateKey].uniqueProtocols.push(protocolId);
  }
  data.dailyStats[dateKey].byProtocol[protocolId] =
    (data.dailyStats[dateKey].byProtocol[protocolId] || 0) + 1;

  saveTrackingData(data);

  return accessEntry;
}

// Get heat map data
function getHeatMap() {
  const data = loadTrackingData();

  // Sort by total accesses
  const sorted = Object.entries(data.heatMap)
    .sort((a, b) => b[1].totalAccesses - a[1].totalAccesses)
    .map(([id, stats]) => ({
      protocolId: id,
      ...stats,
      // Calculate "heat" score (recency + frequency)
      heatScore: calculateHeatScore(stats)
    }));

  return sorted;
}

// Calculate heat score based on recency and frequency
function calculateHeatScore(stats) {
  const now = Date.now();
  const lastAccess = new Date(stats.lastAccess).getTime();
  const daysSinceLastAccess = (now - lastAccess) / (1000 * 60 * 60 * 24);

  // Decay factor: halves every 7 days
  const recencyFactor = Math.pow(0.5, daysSinceLastAccess / 7);

  // Combined score
  return Math.round(stats.totalAccesses * recencyFactor * 100) / 100;
}

// Get tracking stats summary
function getTrackingStats() {
  const data = loadTrackingData();
  const heatMap = getHeatMap();

  return {
    totalTrackedAccesses: data.accessLog.length,
    uniqueProtocolsAccessed: Object.keys(data.heatMap).length,
    topProtocols: heatMap.slice(0, 5).map(p => ({
      id: p.protocolId,
      accesses: p.totalAccesses,
      heat: p.heatScore
    })),
    recentActivity: data.accessLog.slice(-10).reverse().map(a => ({
      protocol: a.protocolId,
      type: a.accessType,
      when: a.timestamp
    })),
    dataFile: TRACKING_FILE,
    version: data.version
  };
}

// Get graduation candidates (protocols used frequently enough to potentially become tools)
function getGraduationCandidates(threshold = 10) {
  const heatMap = getHeatMap();

  return heatMap
    .filter(p => p.totalAccesses >= threshold)
    .map(p => ({
      protocolId: p.protocolId,
      totalAccesses: p.totalAccesses,
      heatScore: p.heatScore,
      recommendation: p.totalAccesses >= 50 ? 'Strong candidate for tool graduation' :
                      p.totalAccesses >= 20 ? 'Monitor for tool graduation' :
                      'Keep as protocol'
    }));
}

// Wrapper function to create a harnessed handler
function withTracking(handler, accessType) {
  return function(args) {
    // Track the access
    const protocolId = args.protocol_id || args.query || 'index';
    trackProtocolAccess(protocolId, accessType, {
      source: 'mcp-protocols-server'
    });

    // Call original handler
    return handler(args);
  };
}

module.exports = {
  trackProtocolAccess,
  getHeatMap,
  getTrackingStats,
  getGraduationCandidates,
  withTracking
};
