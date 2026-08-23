/**
 * Shiki themes for fenced code, authored in the site palette.
 *
 * The ramp IS the syntax palette. This is where most of the colour on the site
 * actually lives, since the blog is code-heavy, so it is the place the spectral
 * system has to earn its keep. Each role takes exactly the hue that role owns
 * everywhere else on the site:
 *
 *   keyword   Purple  #C678DD   4.75:1   keywords, storage, tags
 *   function  Blue    #61AFEF   5.92:1   function names, JSON keys; also links
 *   type      Cyan    #56B6C2   5.91:1   class and type names; also infra tags
 *   string    Green   #98C379   6.90:1   strings; also language tags
 *   number    Orange  #E5C07B   8.10:1   numerics and constants; also the Sun
 *   error     Red     #E06C75   4.38:1   invalid and deleted ONLY
 *   ink       -       #ABB2BF   6.57:1   variables, punctuation, operators
 *   comment   -       #636D7E   2.68:1   italic — BELOW AA, see below
 *
 * This is One Dark's own syntax mapping, so all six of the palette's hues have a
 * real job and none is invented. Two tokens sit under 4.5:1 against the pane:
 * comment #636D7E and error #E06C75. Both are the supplied values used verbatim,
 * which the palette owner asked for explicitly; One Dark sets comments below the
 * bar by design. scripts/verify-code-theme.mjs allows exactly these two by hex
 * and still fails on anything else that drops under, so the exemption is visible
 * rather than the bar being quietly lowered.
 *
 * Ratios are measured against the pane (--surface-2 #282C34), not the page
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
  bg: '#282C34',        // Surface — the pane code sits on
  fg: '#ABB2BF',        // Secondary Text
  ink: '#ABB2BF',
  comment: '#636D7E',   // Muted Text
  keyword: '#C678DD',   // Purple
  function: '#61AFEF',  // Blue
  type: '#56B6C2',      // Cyan
  string: '#98C379',    // Green
  number: '#E5C07B',    // Orange
  error: '#E06C75',     // Red
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
