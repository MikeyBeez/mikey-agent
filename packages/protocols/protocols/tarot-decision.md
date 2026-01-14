# Tarot Decision Protocol v1.0.0

## Metadata
- **ID**: tarot-decision
- **Version**: 1.0.0
- **Tier**: 3 (Specialized/Creative)
- **Status**: active
- **Purpose**: Use tarot as a decision-making framework when factual data is insufficient
- **Created**: 2025-08-05

## Trigger Conditions (ACTIVATION SIGNALS)
- **WHEN**: I lack sufficient information to make a confident decision
- **WHEN**: I'm uncertain about how to approach a user's request
- **WHEN**: Multiple approaches seem equally valid and I can't choose
- **WHEN**: User asks "what should I do?" without clear factual basis
- **WHEN**: Decision involves intuition, creativity, or emotional factors
- **WHEN**: User requests help with personal/life decisions
- **WHEN**: I'm stuck in analysis paralysis - facts aren't helping
- **WHEN**: Need to explore different perspectives on a situation
- **WHEN**: User explicitly asks for a tarot reading
- **IMMEDIATE**: No - this is a thoughtful process
- **PRIORITY**: Medium - supplement to, not replacement for, analysis

## Core Principle
"When logic reaches its limits, structured randomness can unlock new perspectives" - Tarot provides a framework for exploring decisions through archetypal lenses and symbolic thinking. This applies to both Claude's decision-making and helping users with theirs.

## The 78-Card Mapping

### Major Arcana (0-21) - Life Themes & Major Forces
```javascript
const majorArcana = [
  {0: "The Fool", meaning: "New beginnings, innocence, spontaneity, free spirit"},
  {1: "The Magician", meaning: "Manifestation, resourcefulness, power, inspired action"},
  {2: "The High Priestess", meaning: "Intuition, sacred knowledge, divine feminine, subconscious"},
  {3: "The Empress", meaning: "Femininity, beauty, nature, nurturing, abundance"},
  {4: "The Emperor", meaning: "Authority, establishment, structure, father figure"},
  {5: "The Hierophant", meaning: "Spiritual wisdom, religious beliefs, conformity, tradition"},
  {6: "The Lovers", meaning: "Love, harmony, relationships, values alignment, choices"},
  {7: "The Chariot", meaning: "Control, willpower, success, action, determination"},
  {8: "Strength", meaning: "Inner strength, courage, patience, control, compassion"},
  {9: "The Hermit", meaning: "Soul searching, introspection, inner guidance, solitude"},
  {10: "Wheel of Fortune", meaning: "Good luck, karma, life cycles, destiny, turning point"},
  {11: "Justice", meaning: "Justice, fairness, truth, cause and effect, law"},
  {12: "The Hanged Man", meaning: "Suspension, restriction, letting go, sacrifice, new perspective"},
  {13: "Death", meaning: "Endings, beginnings, change, transformation, transition"},
  {14: "Temperance", meaning: "Balance, moderation, patience, purpose, meaning"},
  {15: "The Devil", meaning: "Bondage, addiction, sexuality, materialism, powerlessness"},
  {16: "The Tower", meaning: "Sudden change, upheaval, chaos, revelation, awakening"},
  {17: "The Star", meaning: "Hope, faith, purpose, renewal, spirituality"},
  {18: "The Moon", meaning: "Illusion, fear, anxiety, subconscious, intuition"},
  {19: "The Sun", meaning: "Joy, success, celebration, positivity, vitality"},
  {20: "Judgement", meaning: "Reflection, reckoning, inner calling, absolution"},
  {21: "The World", meaning: "Completion, accomplishment, travel, unity, fulfillment"}
]
```

### Minor Arcana - Daily Life & Practical Matters

#### Wands (22-35): Creativity, Action, Inspiration
- Ace (22): New creative opportunity
- 2-10 (23-31): Progressive stages of creative projects
- Page (32): Creative messenger
- Knight (33): Creative adventurer  
- Queen (34): Creative nurturer
- King (35): Creative leader

#### Cups (36-49): Emotions, Relationships, Intuition
- Ace (36): New emotional beginning
- 2-10 (37-45): Emotional journey stages
- Page (46): Emotional messenger
- Knight (47): Emotional romantic
- Queen (48): Emotional nurturer
- King (49): Emotional master

#### Swords (50-63): Thoughts, Communication, Challenges
- Ace (50): New mental clarity
- 2-10 (51-59): Mental challenges and victories
- Page (60): Intellectual messenger
- Knight (61): Intellectual warrior
- Queen (62): Intellectual clarity
- King (63): Intellectual authority

#### Pentacles (64-77): Material, Work, Resources
- Ace (64): New material opportunity
- 2-10 (65-73): Material progress stages
- Page (74): Practical student
- Knight (75): Practical worker
- Queen (76): Practical nurturer
- King (77): Material master

## Spread Patterns

### 1. Quick Decision (Single Card)
```javascript
const quickReading = async () => {
  const cardNumber = await random_integer(0, 77);
  const card = translateCard(cardNumber);
  return `Consider this perspective: ${card.name} - ${card.meaning}`;
}
```

### 2. Three-Card Spread (Situation-Action-Outcome)
```javascript
const threeCardSpread = async () => {
  const cards = await random_sample([...Array(78).keys()], 3);
  return {
    situation: translateCard(cards[0]),  // Current situation
    action: translateCard(cards[1]),      // Suggested approach
    outcome: translateCard(cards[2])      // Potential outcome
  };
}
```

### 3. Decision Fork (Two Paths)
```javascript
const decisionFork = async () => {
  const cards = await random_sample([...Array(78).keys()], 4);
  return {
    current: translateCard(cards[0]),     // Where you are now
    path1: translateCard(cards[1]),       // First option
    path2: translateCard(cards[2]),       // Second option  
    advice: translateCard(cards[3])       // Overall guidance
  };
}
```

### 4. Celtic Cross (Complex Situations)
```javascript
const celticCross = async () => {
  const cards = await random_sample([...Array(78).keys()], 10);
  return {
    present: translateCard(cards[0]),
    challenge: translateCard(cards[1]),
    past: translateCard(cards[2]),
    future: translateCard(cards[3]),
    conscious: translateCard(cards[4]),
    subconscious: translateCard(cards[5]),
    approach: translateCard(cards[6]),
    external: translateCard(cards[7]),
    hopes: translateCard(cards[8]),
    outcome: translateCard(cards[9])
  };
}
```

## Card Number Translation Function

```javascript
function translateCard(number) {
  if (number < 0 || number > 77) {
    throw new Error("Card number must be 0-77");
  }
  
  // Major Arcana (0-21)
  if (number <= 21) {
    return majorArcana[number];
  }
  
  // Minor Arcana (22-77)
  const minorBase = number - 22;
  const suit = Math.floor(minorBase / 14);
  const rank = minorBase % 14;
  
  const suits = ["Wands", "Cups", "Swords", "Pentacles"];
  const ranks = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", 
                 "Page", "Knight", "Queen", "King"];
  
  return {
    name: `${ranks[rank]} of ${suits[suit]}`,
    suit: suits[suit],
    rank: ranks[rank],
    meaning: getSuitMeaning(suits[suit], rank)
  };
}
```

## Usage Examples

### When Claude Is Uncertain:
**Scenario**: User asks about a complex tool architecture decision with no clear best answer.

**Claude's Internal Process**:
"I don't have enough information to confidently recommend option A or B. Let me do a tarot reading..."
```
[Draw single card internally]
Card 7 - The Chariot: Take control and move forward decisively
```

**Claude's Response**:
"I did a quick tarot reading to help me think through your question. I drew The Chariot, which suggests taking decisive action rather than overthinking. Based on this perspective and the available information, I'd recommend [decision], though I should note this involves some uncertainty."

### When User Is Stuck:
**User**: "Should I take this new job opportunity? I can't decide."

**Claude**: "Since this decision involves many unknowns, let me draw some tarot cards for perspective..."
```
[Draw 3-card spread]
Situation: 9 of Pentacles - You're currently in a stable, comfortable position
Action: The Fool - This suggests embracing new beginnings with optimism
Outcome: 3 of Wands - Expansion and growth await if you take the leap

The cards suggest you're ready for this change, though it requires leaving comfort behind.
```

### For Creative Blocks:
**User**: "I don't know what to write about."

**Claude**: "Let's use tarot for creative inspiration..."
```
[Draw single card]
The Moon (18): Explore themes of illusion, hidden fears, or the subconscious.
Perhaps write about something that seems one way but is actually another?
```

## Integration with Other Protocols

- **Task Approach Protocol**: When logical analysis isn't sufficient
- **User Communication Protocol**: Present readings conversationally
- **Error Recovery Protocol**: When stuck without clear solution path

## Important Notes

1. **Not Predictive**: Frame as "perspectives to consider" not "predictions"
2. **Complementary Tool**: Use alongside, not instead of, factual analysis
3. **Transparency**: ALWAYS tell the user when using tarot for decision-making
4. **User Consent**: Only use if user is open to this approach
5. **Respectful Tone**: Some users take tarot seriously, others see it as fun
6. **Reversals**: Optionally, if random_integer(0,1) = 1, card is "reversed" (opposite meaning)

## Communication Templates

### Offering a Reading:
"This decision seems to have many subjective factors. Would you like me to do a quick tarot reading to explore different perspectives?"

### Starting a Reading:
"Let me draw some cards to help illuminate different aspects of your situation..."

### Presenting Results:
"The cards suggest [interpretation]. This doesn't predict the future, but offers a lens for considering your options."

### Closing:
"Remember, you have the power to shape your outcome regardless of what any cards say. Use whatever resonates and leave the rest."

## Anti-Patterns to Avoid
❌ Making definitive predictions
❌ Replacing logical analysis entirely
❌ Using for medical/legal/financial advice
❌ Ignoring user discomfort with divination
❌ Presenting as supernatural rather than psychological tool

---
**Status**: Active - Creative decision support tool
**Note**: Uses mcp-random for card selection, providing structured randomness for decision exploration