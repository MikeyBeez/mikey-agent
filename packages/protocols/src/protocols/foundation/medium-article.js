// Medium Article Writing Protocol - Modular data file
module.exports = {
  id: 'medium-article',
  name: 'Medium Article Writing Protocol',
  version: '1.2.0',
  tier: 3,
  purpose: 'Guide the creation of high-quality Medium articles using only Medium-supported formatting',
  triggers: [
    'User wants to write a Medium article',
    'User mentions publishing to Medium',
    'User asks for help with a blog post for publication',
    'Drafting technical content for external audience',
    'User says "write an article" or "blog post"'
  ],
  status: 'active',
  location: '/Users/bard/Code/mcp-protocols/src/protocols/foundation/medium-article.js',
  content: `# Medium Article Writing Protocol v1.2.0

## Trigger Conditions (MUST ACTIVATE)
- **WHEN**: User wants to write a Medium article
- **WHEN**: User mentions publishing to Medium
- **WHEN**: User asks for help with a blog post for publication
- **WHEN**: Drafting technical content for external audience
- **IMMEDIATE**: No - requires planning and iteration
- **PRIORITY**: Medium (Tier 3)

## Core Principle
"Write for the reader who will skim first, then decide to read." Every section must earn the reader's continued attention.

## IMMUTABLE - Medium Editor Capabilities

### What Medium SUPPORTS
Medium has a WYSIWYG editor with these features:

**Text Formatting:**
- Bold (Cmd/Ctrl+B)
- Italic (Cmd/Ctrl+I)
- Links/hyperlinks
- Strikethrough

**Structure:**
- Title (large T) - first line becomes article title
- Subtitle - second line becomes subtitle
- Section headers (large T)
- Subheaders (small T)

**Lists:**
- Bulleted lists (type * then space)
- Numbered lists (type 1. then space)

**Quotes:**
- Block quotes (click quote icon once)
- Pull quotes (click quote icon twice) - for highlighting key insights

**Code:**
- Inline code
- Code blocks with syntax highlighting

**Media:**
- Images (JPG, JPEG, GIF, PNG up to 25MB)
- Embedded content via Embedly (YouTube, Vimeo, GitHub Gists, tweets, etc.)
- Drop caps for first letter of paragraphs

**Other:**
- Horizontal dividers (type --- then enter)
- @mentions of other Medium users
- Superscript for numbers only (type 6^7 for 6⁷)
- Emojis via :emoji_name: syntax

### What Medium does NOT Support
DO NOT use these in drafts - they will not render:
- Markdown syntax (no ## headers, no **bold**, no [links](url))
- Tables (use images, GitHub Gists, or Datawrapper embeds instead)
- LaTeX or mathematical notation
- Custom HTML
- Footnotes
- Nested lists beyond one level
- Iframe embeds (except through Embedly-supported services)

## IMMUTABLE - Article Structure Requirements

### Essential Components
Every Medium article MUST have:
- Compelling headline (6-12 words, creates curiosity or promises value)
- Hook paragraph (first 2-3 sentences must grab attention)
- Clear structure (subheadings every 300-500 words)
- Actionable takeaways (reader leaves with something useful)
- Strong closing (call to action, question, or memorable statement)

### Length Guidelines
- Quick tip: 500-800 words (2-3 min read)
- Tutorial: 1000-1500 words (5-7 min read)
- Deep dive: 1500-2500 words (8-12 min read)
- Comprehensive guide: 2500-4000 words (12-18 min read)

## EDITABLE - Writing Process

### Step 1: Define the Article

Before writing, clarify:
- Target audience: Who is this for? What do they already know?
- Core message: What's the ONE thing readers should remember?
- Article type: Tutorial, opinion, case study, listicle, or guide?
- Unique angle: What perspective do you bring that others don't?

### Step 2: Create the Outline

Structure the article with plain text:

Title (will become the headline)

Subtitle (optional, adds context)

Hook paragraph

Context section

Main Content
  - Point 1
  - Point 2
  - Point 3

Practical Application

Conclusion with call to action

### Step 3: Write the Draft

**The Hook (first paragraph):**
Options for opening:
- Start with a problem the reader has
- Ask a provocative question
- Share a surprising statistic or fact
- Tell a brief story
- Make a bold claim

**The Body:**
- One idea per paragraph
- Keep paragraphs short (1-4 sentences - Medium readers skim)
- Use transitions between sections
- Include examples for abstract concepts
- Add code samples for technical content (use code blocks)
- Break up text with subheaders

**The Closing:**
- Summarize key points (optional)
- Provide next steps
- Ask a question to encourage comments
- Include relevant links

### Step 4: Refine the Headline

Headlines that work on Medium:
- How-to: "How I Built X in Y Days"
- Listicle: "7 Lessons From..."
- Question: "Why Does X Still Matter?"
- Contrarian: "Stop Doing X"
- Story: "What I Learned When..."

Test your headline:
- Would YOU click on this?
- Does it promise specific value?
- Is it under 60 characters (for SEO)?
- Does it avoid clickbait?

### Step 5: Edit and Polish

**First pass - Structure:**
- Does each section flow to the next?
- Are there any redundant paragraphs?
- Is the length appropriate for the content?

**Second pass - Clarity:**
- Remove jargon or explain it
- Simplify complex sentences
- Replace passive voice with active

**Third pass - Engagement:**
- Add a personal anecdote if missing
- Ensure subheadings are descriptive
- Check that the hook is compelling

**Final pass - Technical:**
- Run through a grammar checker
- Verify all code samples work
- Check all links are valid

### Step 6: Prepare for Publication

**Metadata:**
- Write a subtitle (appears below headline)
- Select up to 5 tags
- Create or select a feature image

**Pre-publish checklist:**
- Read aloud for flow
- Check on mobile preview
- Verify code formatting
- Add alt text to images
- Set canonical URL if cross-posting

## Handling Tables

Since Medium doesn't support tables natively, use one of these workarounds:

1. **Screenshot/Image**: Create table elsewhere, screenshot it, upload as image
   - Pro: Simple, maintains formatting
   - Con: Not searchable, not accessible

2. **GitHub Gist**: Create a text-based table in a Gist, paste the Gist URL
   - Pro: Searchable, can be updated
   - Con: Requires GitHub account

3. **Datawrapper**: Create table at datawrapper.de, embed via URL
   - Pro: Interactive, professional looking
   - Con: External dependency

4. **Bulleted list**: Convert table to structured list
   - Pro: Native Medium formatting
   - Con: Less visual impact for complex data

## Diagrams and Charts with Mermaid

Medium doesn't support Mermaid natively, but you can convert Mermaid diagrams to PNG images.

**Workflow:**

1. Create a Mermaid file with your diagram:

   Save as diagram.mmd:
   flowchart LR
       A[Write Article] --> B[Create Diagrams]
       B --> C[Export to PNG]
       C --> D[Upload to Medium]

2. Convert to PNG using mermaid-cli:
   mmdc -i diagram.mmd -o diagram.png

3. Upload the PNG image to Medium

**Mermaid CLI options:**
- mmdc -i input.mmd -o output.png (basic conversion)
- mmdc -i input.mmd -o output.png -t dark (dark theme)
- mmdc -i input.mmd -o output.png -b transparent (transparent background)
- mmdc -i input.mmd -o output.png --width 800 (set width)

**Mermaid diagram types useful for articles:**
- flowchart: Process flows, decision trees
- sequenceDiagram: API calls, user interactions
- classDiagram: System architecture
- gantt: Project timelines
- pie: Simple data visualization
- mindmap: Concept organization

**In article drafts, use placeholders:**
When drafting, mark where diagrams should go:

[DIAGRAM: flowchart showing user authentication flow]
[MERMAID FILE: auth-flow.mmd]

Then create the .mmd file, export to PNG, and insert.

**Installation (if needed):**
npm install -g @mermaid-js/mermaid-cli

## Quality Checklist

**Content:**
- Hook grabs attention in first 2-3 sentences
- Clear value proposition for reader
- One main idea, well developed
- Examples support abstract points
- Actionable takeaways included

**Structure:**
- Subheadings every 300-500 words
- Paragraphs are 1-4 sentences
- Logical flow from section to section
- Strong opening and closing

**Readability:**
- Written for target audience level
- Jargon explained or avoided
- Sentences are concise
- Active voice preferred

**Medium-Specific:**
- Headline is compelling (6-12 words)
- Subtitle adds context
- 5 relevant tags selected
- Feature image included
- Reading time is appropriate
- No markdown syntax in final draft
- No tables (use workarounds)
- No LaTeX

## Anti-Patterns to Avoid

**Using Markdown syntax:**
- Medium is WYSIWYG, not markdown
- Don't write ## for headers or **bold**
- Format in the editor or describe formatting for the user to apply

**Burying the lede:**
- Don't wait until paragraph 5 to get to the point
- Front-load value

**Wall of text:**
- Break up long paragraphs
- Use formatting liberally (headers, quotes, lists)

**Clickbait without delivery:**
- If headline promises "10 secrets," deliver 10 actual secrets
- Match content to headline

**No clear takeaway:**
- Reader should know what to DO after reading
- End with action, not just information

**Over-technical without context:**
- Explain WHY before HOW
- Connect to reader's problems

## Integration with Other Protocols

- **User Communication**: Match tone to target audience
- **Progress Communication**: Update user during long drafts
- **Information Integration**: Synthesize sources properly with attribution

## Sources

- Medium Help Center: Using the story editor
- Medium Blog: Tips and Tricks for Medium Writers (May 2025)
- Medium community articles on table workarounds

---
**Status**: Active Specialized Protocol - v1.2.0`
};
