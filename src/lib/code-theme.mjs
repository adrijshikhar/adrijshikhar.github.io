/**
 * Shiki themes for fenced code, authored in the site palette.
 *
 * The ramp IS the syntax palette. This is where most of the colour on the site
 * actually lives, since the blog is code-heavy, so it is the place the spectral
 * system has to earn its keep. Each role takes exactly the hue that role owns
 * everywhere else on the site:
 *
 *   keyword   O/B  #61AFEF   6.75:1   also links and active nav
 *   type      A    #56B6C2   6.73:1   also infra tags and planets
 *   literal   G    #E5C07B   9.23:1   strings and numerics; also Sun values
 *   number    K    #E59779   6.86:1   also language tags
 *   error     M    #E06C75   4.99:1   errors ONLY, nowhere else
 *   ink       -    #ABB2BF   7.48:1   identifiers, punctuation, operators
 *   comment   -    #939BA9   5.69:1   italic
 *
 * Ratios are measured against the pane (--surface-2 #1E222A), not the page
 * ground, because that is what code actually sits on. All clear AA.
 *
 * Two things this replaces, both flagged in the design review: bronze was
 * assigned to KEYWORDS, so the site's single accent meant "SQL keyword" inside
 * a <pre> and "link" everywhere else; and a teal literal sat at hue 191 inside
 * a palette declared as hue 66-78. Keywords now take the link hue because a
 * keyword IS the structural element of a line, and nothing is invented
 * per-language.
 *
 * The site is dark only, so both entries carry the same values; the dual-theme
 * mechanism in astro.config stays wired rather than being ripped out.
 *
 * Verified by scripts/verify-code-theme.mjs, which fails the build if any token
 * drops under 4.5:1 against its own pane.
 */

const SPECTRAL = {
  bg: '#1E222A',
  fg: '#ABB2BF',
  ink: '#ABB2BF',
  keyword: '#61AFEF',
  type: '#56B6C2',
  string: '#E5C07B',
  number: '#E59779',
  error: '#E06C75',
  muted: '#939BA9',
  // Only bronze, literal, ink and muted are reached by SCOPES below; the rest
  // are the role names the ramp is documented by. bronze IS the keyword hue.
  bronze: '#61AFEF',
  literal: '#E5C07B',
};

const LIGHT = SPECTRAL;
const DARK = SPECTRAL;

const SCOPES = (c) => [
  {
    scope: ['comment', 'punctuation.definition.comment', 'string.comment'],
    settings: { foreground: c.muted, fontStyle: 'italic' },
  },
  {
    scope: [
      'string',
      'string.quoted',
      'string.template',
      'constant.numeric',
      'constant.language',
      'constant.character',
      'constant.other',
      'support.constant',
    ],
    settings: { foreground: c.literal },
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
      'support.type.property-name.json',
    ],
    settings: { foreground: c.bronze },
  },
  {
    // Names carry weight, not a fifth hue.
    scope: [
      'entity.name.function',
      'support.function',
      'entity.name.type',
      'entity.name.class',
      'support.class',
      'support.type',
    ],
    settings: { foreground: c.ink, fontStyle: 'bold' },
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
