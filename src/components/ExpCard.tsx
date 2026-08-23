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
      className={`group h-full scroll-mt-24 transition-all duration-200 hover:-translate-y-0.5 hover:border-ring hover:shadow-lg focus-within:border-ring motion-reduce:translate-none motion-reduce:transition-none${
        isPreview ? ' relative' : ''
      }`}
    >
      <CardHeader>
        <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          {startDate} &ndash; {endDate}
        </div>
        <CardTitle className="text-xl leading-snug">
          {isPreview ? (
            <a
              href={`/experience/#${slug}`}
              className="after:absolute after:inset-0 after:rounded-xl after:content-[''] group-hover:underline focus-visible:outline-none"
            >
              {position}
            </a>
          ) : (
            position
          )}
          <span className="text-muted-foreground"> / </span>
          {companyLink ? (
            // Sits ABOVE the stretched overlay so the company link stays its own
            // target; without the z-index the overlay would swallow it.
            <a
              href={companyLink}
              target="_blank"
              rel="noreferrer noopener"
              className="relative z-10 hover:underline focus-visible:outline-none"
            >
              {company} <span aria-hidden="true">&#8599;</span>
            </a>
          ) : (
            company
          )}
        </CardTitle>
        {(tagline || location) && <CardDescription>{tagline || location}</CardDescription>}
      </CardHeader>
      {contentHtml && (
        <CardContent>
          <div
            className="prose prose-sm prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </CardContent>
      )}
    </Card>
  );
}
