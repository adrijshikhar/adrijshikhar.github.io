/**
 * Shiki themes for fenced code, authored in the site palette.
 *
 * The ramp IS the syntax palette. This is where most of the colour on the site
 * actually lives, since the blog is code-heavy, so it is the place the spectral
 * system has to earn its keep. Each role takes exactly the hue that role owns
 * everywhere else on the site:
 *
 *   keyword   purple-400  #C084FC   5.54:1   keywords, storage, tags
 *   function  blue-400    #60A5FA   5.75:1   function names, JSON keys; also links
 *   type      cyan-400    #22D3EE   8.09:1   class and type names
 *   string    green-400   #4ADE80   8.40:1   strings
 *   number    amber-300   #FCD34D  10.15:1   numerics and constants
 *   error     red-400     #F87171   5.29:1   invalid and deleted ONLY
 *   ink       slate-300   #CBD5E1   9.85:1   variables, punctuation, operators
 *   comment   slate-400   #94A3B8   5.71:1   italic
 *
 * All stock Tailwind. Every token clears 4.5:1 against the pane (slate-800), so
 * the sub-AA allowlist the previous palette needed is gone.
 *
 * Ratios are measured against the pane (slate-800 #1E293B), not the page
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
 * drops under 4.5:1 against its own pane except the two allowed by hex above.
 */

const SPECTRAL = {
  bg: '#1E293B',        // slate-800  — the pane code sits on
  fg: '#CBD5E1',        // slate-300
  ink: '#CBD5E1',       // slate-300
  comment: '#94A3B8',   // slate-400  (slate-500 is 3.07:1 here and fails AA)
  keyword: '#C084FC',   // purple-400
  function: '#60A5FA',  // blue-400
  type: '#22D3EE',      // cyan-400
  string: '#4ADE80',    // green-400
  number: '#FCD34D',    // amber-300
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
