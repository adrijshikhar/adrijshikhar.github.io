/**
 * Shiki themes for fenced code, authored in the site palette.
 *
 * The ramp IS the syntax palette. This is where most of the colour on the site
 * actually lives, since the blog is code-heavy, so it is the place the spectral
 * system has to earn its keep. Each role takes exactly the hue that role owns
 * everywhere else on the site:
 *
 *   keyword   purple-400  #C084FC   keywords, storage, tags
 *   function  blue-400    #60A5FA   function names, JSON keys
 *   type      cyan-400    #22D3EE   class and type names
 *   string    green-400   #4ADE80   strings
 *   number    amber-400   #FBBF24   numerics and constants
 *   error     red-400     #F87171   invalid and deleted ONLY
 *   ink       foreground  #FAFAFA   variables, punctuation, operators
 *   comment   muted-fg    #A1A1A1   italic
 *
 * Ratios are not repeated here on purpose: they were stale in every row the last
 * time this table was hand-maintained. scripts/verify-code-theme.mjs measures
 * them against the pane on every build and fails if any drops under 4.5:1, so it
 * is the source of truth. SUB_AA_ALLOWED is currently empty — nothing is exempt.
 *
 * Ratios are measured against the pane (shadcn --card #171717), not the page
 * ground, because that is what code actually sits on.
 *
 * An earlier revision of this file collapsed the whole map onto two colours and
 * gave keywords the link hue, on the reasoning that a keyword is the structural
 * element of a line. That reasoning is dropped: the palette is One Dark Vivid,
 * whose author already assigns every hue a syntax role, and inventing a
 * different mapping for the same palette is how the code pane stops looking
 * like the theme it is named after.
 *
 * The site is dark only, so both entries carry the same values; the dual-theme
 * mechanism in astro.config stays wired rather than being ripped out.
 *
 * Verified by scripts/verify-code-theme.mjs, which fails the build if any token
 * drops under 4.5:1 against its own pane.
 */

const SPECTRAL = {
  bg: '#171717',        // shadcn --card, the pane code sits on
  fg: '#FAFAFA',        // shadcn --foreground
  ink: '#FAFAFA',       // shadcn --foreground
  comment: '#A1A1A1',   // shadcn --muted-foreground
  // Syntax hues: shadcn defines no syntax colours, so these are stock Tailwind
  // at ONE uniform step (-400) rather than a shade chosen per token.
  keyword: '#C084FC',   // purple-400
  function: '#60A5FA',  // blue-400
  type: '#22D3EE',      // cyan-400
  string: '#4ADE80',    // green-400
  number: '#FBBF24',    // amber-400
  error: '#F87171',     // red-400
};

const LIGHT = SPECTRAL;
const DARK = SPECTRAL;

const SCOPES = (c) => [
  {
    scope: ['comment', 'punctuation.definition.comment', 'string.comment'],
    settings: { foreground: c.comment, fontStyle: 'italic' },
  },
  {
    scope: ['string', 'string.quoted', 'string.template', 'constant.character.escape'],
    settings: { foreground: c.string },
  },
  {
    scope: [
      'constant.numeric',
      'constant.language',
      'constant.character',
      'constant.other',
      'support.constant',
    ],
    settings: { foreground: c.number },
  },
  {
    scope: [
      'keyword',
      'keyword.control',
      'keyword.operator.new',
      'keyword.operator.expression',
      'storage',
      'storage.type',
      'storage.modifier',
      'entity.name.tag',
      'markup.heading',
      'variable.language',
    ],
    settings: { foreground: c.keyword },
  },
  {
    scope: ['entity.name.function', 'support.function', 'support.type.property-name.json'],
    settings: { foreground: c.function },
  },
  {
    scope: ['entity.name.type', 'entity.name.class', 'support.class', 'support.type'],
    settings: { foreground: c.type },
  },
  {
    scope: ['invalid', 'invalid.illegal', 'markup.deleted'],
    settings: { foreground: c.error },
  },
  {
    scope: [
      'variable',
      'variable.parameter',
      'variable.other',
      'entity.other.attribute-name',
      'punctuation',
      'keyword.operator',
      'meta.brace',
    ],
    settings: { foreground: c.ink },
  },
];

const build = (name, type, c) => ({
  name,
  type,
  colors: { 'editor.background': c.bg, 'editor.foreground': c.fg },
  settings: [{ settings: { background: c.bg, foreground: c.fg } }, ...SCOPES(c)],
});

export const codeThemeLight = build('observatory-light', 'light', LIGHT);
export const codeThemeDark = build('observatory-dark', 'dark', DARK);
export const CODE_PALETTE = { LIGHT, DARK };
