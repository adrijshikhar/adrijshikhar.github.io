/**
 * The positioning line, in exactly one place.
 *
 * It used to live in three: the hero paragraph in `index.astro`, the default
 * `description` in `BaseLayout.astro`, and a `tagline` in `about.md` that
 * nothing ever read. A content-only edit changed the one nobody rendered — so
 * the page said one thing while every search result, unfurl and social card
 * still advertised the older framing. Anything that states what this site is
 * about imports from here.
 *
 * `og-image.jpg` renders this same sentence as pixels, so changing it here
 * means regenerating that asset too.
 */
export const HERO_LEAD = {
  body: 'Senior software engineer at Hevo Data. I build connector platforms and the agent tooling that generates and operates them, and ',
  emphasis: 'write down what breaks on the way',
} as const;

export const SITE_DESCRIPTION = `${HERO_LEAD.body}${HERO_LEAD.emphasis}.`;
