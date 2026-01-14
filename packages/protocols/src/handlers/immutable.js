// Handler for checking immutable protocol sections
const { getProtocol } = require('../registry');

/**
 * Check if a proposed change would violate immutable sections
 *
 * Immutable sections are marked with:
 * - ## IMMUTABLE
 * - ## IMMUTABLE - <description>
 * - Text between IMMUTABLE markers cannot be modified by agent proposals
 */
function handleCheckImmutable({ protocol_id, proposed_change, target_section }) {
  const protocol = getProtocol(protocol_id);

  if (!protocol) {
    return {
      content: [{
        type: 'text',
        text: `❌ Protocol not found: ${protocol_id}`
      }]
    };
  }

  // Parse content for immutable sections
  const content = protocol.content || '';
  const immutableSections = [];
  const editableSections = [];

  const lines = content.split('\n');
  let inImmutable = false;
  let currentSection = null;
  let sectionContent = [];

  for (const line of lines) {
    // Check for IMMUTABLE marker
    if (line.includes('## IMMUTABLE') || line.includes('IMMUTABLE -')) {
      if (currentSection) {
        immutableSections.push({
          name: currentSection,
          content: sectionContent.join('\n')
        });
      }
      inImmutable = true;
      currentSection = line.replace(/^#+\s*/, '').replace('IMMUTABLE', '').replace('-', '').trim() || 'Immutable Section';
      sectionContent = [];
      continue;
    }

    // Check for EDITABLE marker (ends immutable section)
    if (line.includes('## EDITABLE') || line.includes('EDITABLE -')) {
      if (inImmutable && currentSection) {
        immutableSections.push({
          name: currentSection,
          content: sectionContent.join('\n')
        });
      }
      inImmutable = false;
      currentSection = line.replace(/^#+\s*/, '').replace('EDITABLE', '').replace('-', '').trim() || 'Editable Section';
      editableSections.push(currentSection);
      sectionContent = [];
      continue;
    }

    // Check for new section (##)
    if (line.startsWith('## ') && !line.includes('IMMUTABLE') && !line.includes('EDITABLE')) {
      if (inImmutable && currentSection) {
        immutableSections.push({
          name: currentSection,
          content: sectionContent.join('\n')
        });
      }
      inImmutable = false;
      currentSection = line.replace(/^#+\s*/, '');
      sectionContent = [];
      continue;
    }

    if (currentSection) {
      sectionContent.push(line);
    }
  }

  // Check if proposed change targets an immutable section
  let violatesImmutable = false;
  let violatedSection = null;

  if (target_section) {
    for (const section of immutableSections) {
      if (section.name.toLowerCase().includes(target_section.toLowerCase()) ||
          target_section.toLowerCase().includes(section.name.toLowerCase())) {
        violatesImmutable = true;
        violatedSection = section.name;
        break;
      }
    }
  }

  // Also check if proposed change mentions modifying known immutable content
  const proposedLower = proposed_change.toLowerCase();
  for (const section of immutableSections) {
    // Check for keywords that suggest modifying safety-related content
    const safetyKeywords = ['safety', 'forbidden', 'never', 'must not', 'dangerous', 'immutable'];
    for (const keyword of safetyKeywords) {
      if (section.content.toLowerCase().includes(keyword) &&
          proposedLower.includes(keyword)) {
        violatesImmutable = true;
        violatedSection = section.name;
        break;
      }
    }
  }

  let output = `🔒 Immutable Section Check\n`;
  output += `═══════════════════════\n\n`;
  output += `📋 Protocol: ${protocol.name}\n`;
  output += `📝 Proposed Change: ${proposed_change}\n\n`;

  if (immutableSections.length === 0) {
    output += `ℹ️ This protocol has no marked immutable sections.\n`;
    output += `   All sections can be modified through the proposal process.\n`;
  } else {
    output += `🔒 Immutable Sections (${immutableSections.length}):\n`;
    for (const section of immutableSections) {
      output += `   • ${section.name}\n`;
    }
    output += `\n`;

    if (editableSections.length > 0) {
      output += `✏️ Editable Sections:\n`;
      for (const section of editableSections) {
        output += `   • ${section}\n`;
      }
      output += `\n`;
    }
  }

  if (violatesImmutable) {
    output += `\n❌ VIOLATION DETECTED\n`;
    output += `   The proposed change would modify immutable section: ${violatedSection}\n`;
    output += `   This change CANNOT be applied.\n`;
    output += `\n⚠️ Immutable sections are protected by design.\n`;
    output += `   Only human manual editing can modify these sections.`;

    return {
      content: [{
        type: 'text',
        text: output
      }],
      isViolation: true
    };
  } else {
    output += `\n✅ NO VIOLATION\n`;
    output += `   The proposed change does not affect immutable sections.\n`;
    output += `   This change can proceed through the normal proposal process.`;

    return {
      content: [{
        type: 'text',
        text: output
      }],
      isViolation: false
    };
  }
}

module.exports = { handleCheckImmutable };
