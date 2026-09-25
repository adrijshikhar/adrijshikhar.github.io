import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ExpCardProps {
  slug: string;
  position: string;
  company: string;
  companyLink?: string;
  location: string;
  startDate: string;
  endDate: string;
  tagline?: string;
  contentHtml?: string;
}

export default function ExpCard({
  slug,
  position,
  company,
  companyLink,
  location,
  startDate,
  endDate,
  tagline,
  contentHtml,
}: ExpCardProps) {
  // A card with no body prose is a PREVIEW (the home page). Its click target is
  // the detail view on /experience/, deep-linked to this entry — not the
  // company's site, which is a secondary destination. On /experience/ the card
  // IS the detail, so it gets the anchor id instead of an overlay.
  const isPreview = !contentHtml;

  return (
    <Card
      id={isPreview ? undefined : slug}
      className={`group h-full scroll-mt-24 transition-colors duration-200 rounded-none border-0 border-b border-border bg-transparent p-0 py-6 shadow-none gap-2 hover:border-input focus-within:border-ring motion-reduce:transition-none${
        isPreview ? ' relative' : ''
      }`}
    >
      <CardHeader className="p-0 gap-2">
        <div className="font-mono text-xs uppercase tracking-wider text-number-ink">
          {startDate} &ndash; {endDate}
        </div>
        <CardTitle className="text-heading text-xl leading-snug">
          {isPreview ? (
            <a
              href={`/experience/#${slug}`}
              className="text-heading no-underline after:absolute after:inset-0 after:rounded-none after:content-[''] hover:text-heading hover:no-underline"
            >
              {position}
            </a>
          ) : (
            position
          )}
          <span className="text-foreground"> / </span>
          {companyLink ? (
            // Sits ABOVE the stretched overlay so the company link stays its own
            // target; without the z-index the overlay would swallow it.
            <a
              href={companyLink}
              target="_blank"
              rel="noreferrer noopener"
              className="relative z-10 text-heading hover:text-heading hover:underline"
            >
              {company} <span className="text-primary" aria-hidden="true">&#8599;</span>
            </a>
          ) : (
            company
          )}
        </CardTitle>
        {(tagline || location) && <CardDescription className="text-foreground text-base leading-[1.65]">{tagline || location}</CardDescription>}
      </CardHeader>
      {contentHtml && (
        <CardContent className="p-0 pt-3">
          <div
            className="prose prose-sm prose-invert max-w-none text-base leading-[1.65]"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </CardContent>
      )}
    </Card>
  );
}
