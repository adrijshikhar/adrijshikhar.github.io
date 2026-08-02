/**
 * Shiki themes for fenced code, authored in the site palette.
 *
 * Every bundled light theme was measured against our paper ground and rejected:
 * they assume a pure-white editor background, spread 190-320 degrees of hue
 * (red + green + blue + purple in one block), and land 3-8 tokens under 4.5:1
 * once the background stops being #fff. See DESIGN.md.
 *
 * Four colours, distinguished by role rather than by hue variety:
 *   ink      identifiers, punctuation, operators   (entity names take bold)
 *   bronze   keywords, storage, control flow, tags (the site's one accent)
 *   literal  strings, numbers, constants           (low-chroma deep teal)
 *   muted    comments                              (italic)
 *
 * Verified by scripts/verify-code-theme.mjs, which fails the build if any
 * token drops under 4.5:1 against its own pane.
 */

/** Light: warm ink on paper. Pane background is --surface (oklch 94.5% .005 78). */
const LIGHT = {
  bg: '#efece9',
  fg: '#3a352f',
  ink: '#3a352f',
  bronze: '#8a4405',
  literal: '#215c69',
  muted: '#635d56',
};

/** Dark: the same four roles, inverted onto --surface (oklch 19.2% .012 250). */
const DARK = {
  bg: '#10151a',
  fg: '#cbc5bd',
  ink: '#cbc5bd',
  bronze: '#d1a05e',
  literal: '#8fb9c4',
  muted: '#9a938b',
};

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
