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
  return (
    <Card
      className="group transition-all duration-200 hover:-translate-y-0.5 hover:border-ring hover:shadow-lg motion-reduce:translate-none motion-reduce:transition-none"
    >
      <CardHeader>
        <div className="text-xs text-muted-foreground">
          {startDate} &ndash; {endDate}
        </div>
        <CardTitle className="text-xl">
          {position}
          <span className="text-muted-foreground"> / </span>
          {companyLink ? (
            <a
              href={companyLink}
              target="_blank"
              rel="noreferrer noopener"
              className="hover:underline"
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
