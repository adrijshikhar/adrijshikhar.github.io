import { CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import HoverCard from './HoverCard';

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

export default function ExpCard({ position, company, companyLink, location, startDate, endDate, tagline, contentHtml }: ExpCardProps) {
  return (
    <HoverCard>
      <CardHeader className="relative z-10 !gap-0 !p-0">
        <span className="bh-label mb-2 inline-block text-accent">{startDate} — {endDate}</span>
        <div className="flex items-baseline justify-between gap-4">
          <CardTitle className="!text-lg !font-bold !leading-tight !tracking-tightest text-heading">
            <span className="transition-colors group-hover:text-accent">{position}</span>
          </CardTitle>
        </div>
        <CardDescription className="mt-1 text-sm font-semibold text-ink">
          {companyLink ? (
            <a href={companyLink} target="_blank" rel="noreferrer noopener" className="inline-flex items-baseline text-ink underline decoration-accent decoration-2 underline-offset-2 hover:text-accent">
              {company}<span className="ml-1 text-xs">&#8599;</span>
            </a>
          ) : <span>{company}</span>}
          {tagline && <span className="ml-2 font-normal text-muted">· {tagline}</span>}
        </CardDescription>
      </CardHeader>
      {contentHtml && (
        <CardContent
          className="prose prose-sm relative z-10 mt-3 max-w-none !p-0 text-sm leading-normal text-text prose-headings:mb-2 prose-headings:mt-4 prose-headings:text-sm prose-headings:font-bold prose-headings:text-heading prose-a:text-accent prose-strong:text-heading prose-ul:my-1 prose-li:my-0.5"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      )}
    </HoverCard>
  );
}
