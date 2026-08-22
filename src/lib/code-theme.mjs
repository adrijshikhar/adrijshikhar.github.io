/**
 * Shiki themes for fenced code, authored in the site palette.
 *
 * The ramp IS the syntax palette. This is where most of the colour on the site
 * actually lives, since the blog is code-heavy, so it is the place the spectral
 * system has to earn its keep. Each role takes exactly the hue that role owns
 * everywhere else on the site:
 *
 *   keyword   O/B  #7fa8f5   7.27:1   also links and active nav
 *   type      A    #bfd2f2  11.30:1   also infra tags
 *   string    G    #f0ce72  11.35:1   also Sun values
 *   number    K    #eda05b   8.06:1   also language tags
 *   error     M    #e8776a   6.00:1   errors ONLY, nowhere else
 *   ink       -    #bfc6d0  10.05:1   identifiers, punctuation, operators
 *   comment   -    #848e9c   5.21:1   italic
 *
 * Ratios are measured against the pane (--surface-2 #161b22), not the page
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
  bg: '#1B1E22',
  fg: '#D3D7DC',
  ink: '#D3D7DC',
  keyword: '#71AAFF',
  type: '#BBD6FF',
  string: '#FAD661',
  number: '#FFA863',
  error: '#FF8382',
  muted: '#9CA1A9',
  // kept so existing scope maps keep resolving
  bronze: '#71AAFF',
  literal: '#FAD661',
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
