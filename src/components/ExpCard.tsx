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

const prose =
  'mt-3 text-[0.975rem] leading-relaxed text-foreground prose prose-invert max-w-none ' +
  'prose-headings:text-foreground prose-headings:text-base prose-headings:font-semibold prose-headings:tracking-tighter prose-headings:mt-4 prose-headings:mb-2 ' +
  'prose-p:text-foreground prose-li:text-foreground prose-li:my-0.5 prose-ul:my-1.5 marker:text-muted-foreground ' +
  'prose-a:text-primary prose-a:underline prose-a:decoration-1 prose-a:underline-offset-[0.2em] prose-strong:text-foreground prose-strong:font-medium';

export default function ExpCard({ position, company, companyLink, location, startDate, endDate, tagline, contentHtml }: ExpCardProps) {
  return (
    <HoverCard>
      <div className="flex items-baseline justify-between gap-4">
        <span className="meta-data">
          {startDate} <span className="opacity-50">—</span> {endDate}
        </span>
      </div>
      <h3 className="mt-2 title-entry">
        <span className="transition-colors duration-[120ms] group-hover/list-item:text-primary">{position}</span>
        <span className="mx-1.5 text-muted-foreground">/</span>
        {companyLink ? (
          <a
            href={companyLink}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-baseline text-foreground no-underline hover:text-primary"
          >
            {company}
            <span className="ml-1 text-xs text-muted-foreground transition-colors group-hover/list-item:text-primary">&#8599;</span>
          </a>
        ) : (
          <span className="text-foreground">{company}</span>
        )}
      </h3>
      {(tagline || location) && (
        <p className="mt-1 text-sm text-muted-foreground">{tagline || location}</p>
      )}
      {contentHtml && (
        <div className={prose} dangerouslySetInnerHTML={{ __html: contentHtml }} />
      )}
    </HoverCard>
  );
}
