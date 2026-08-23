import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ExpCardProps {
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
  position,
  company,
  companyLink,
  location,
  startDate,
  endDate,
  tagline,
  contentHtml,
}: ExpCardProps) {
  // Stretch the company link over the whole card ONLY when the card has no body
  // prose. On /experience/ the body carries its own links, and an overlay would
  // sit on top of them and swallow every click. The home page renders these
  // cards without prose, so there the whole card is safely one target.
  const stretch = !contentHtml && !!companyLink;

  return (
    <Card
      className={`group h-full transition-all duration-200 hover:-translate-y-0.5 hover:border-ring hover:shadow-lg focus-within:border-ring motion-reduce:translate-none motion-reduce:transition-none${
        stretch ? ' relative' : ''
      }`}
    >
      <CardHeader>
        <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          {startDate} &ndash; {endDate}
        </div>
        <CardTitle className="text-xl leading-snug">
          {position}
          <span className="text-muted-foreground"> / </span>
          {companyLink ? (
            <a
              href={companyLink}
              target="_blank"
              rel="noreferrer noopener"
              className={`group-hover:underline focus-visible:outline-none${
                stretch ? " after:absolute after:inset-0 after:rounded-xl after:content-['']" : ''
              }`}
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
