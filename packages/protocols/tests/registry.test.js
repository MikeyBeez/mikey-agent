// Basic tests for MCP Protocols Server
const { getAllProtocols, getProtocol, searchProtocols, getProtocolsForSituation } = require('../src/registry');

describe('MCP Protocols Server', () => {
  describe('Registry Functions', () => {
    test('should load all foundation protocols', () => {
      const protocols = getAllProtocols();
      expect(Object.keys(protocols)).toHaveLength(5);
      expect(protocols['error-recovery']).toBeDefined();
      expect(protocols['user-communication']).toBeDefined();
      expect(protocols['task-approach']).toBeDefined();
      expect(protocols['information-integration']).toBeDefined();
      expect(protocols['progress-communication']).toBeDefined();
    });

    test('should retrieve specific protocol by ID', () => {
      const protocol = getProtocol('error-recovery');
      expect(protocol).toBeDefined();
      expect(protocol.name).toBe('Error Recovery Protocol');
      expect(protocol.version).toBe('1.1.0');
      expect(protocol.tier).toBe(2);
    });

    test('should return undefined for non-existent protocol', () => {
      const protocol = getProtocol('non-existent');
      expect(protocol).toBeUndefined();
    });

    test('should search protocols by keyword', () => {
      const results = searchProtocols('error');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].id).toBe('error-recovery');
    });

    test('should find protocols for situation', () => {
      const results = getProtocolsForSituation('error occurred');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].id).toBe('error-recovery');
    });

    test('all protocols should have required fields', () => {
      const protocols = Object.values(getAllProtocols());
      protocols.forEach(protocol => {
        expect(protocol.id).toBeDefined();
        expect(protocol.name).toBeDefined();
        expect(protocol.version).toBeDefined();
        expect(protocol.tier).toBeDefined();
        expect(protocol.purpose).toBeDefined();
        expect(protocol.triggers).toBeDefined();
        expect(Array.isArray(protocol.triggers)).toBe(true);
        expect(protocol.status).toBeDefined();
        expect(protocol.content).toBeDefined();
      });
    });

    test('all protocols should have trigger conditions', () => {
      const protocols = Object.values(getAllProtocols());
      protocols.forEach(protocol => {
        expect(protocol.triggers.length).toBeGreaterThan(0);
      });
    });
  });
});
