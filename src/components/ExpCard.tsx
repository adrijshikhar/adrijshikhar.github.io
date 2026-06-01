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
  index?: number;
}

const prose =
  'mt-3 text-[0.975rem] leading-relaxed text-text prose prose-invert max-w-none ' +
  'prose-headings:text-heading prose-headings:text-base prose-headings:font-semibold prose-headings:tracking-tighter prose-headings:mt-4 prose-headings:mb-2 ' +
  'prose-p:text-text prose-li:text-text prose-li:my-0.5 prose-ul:my-1.5 marker:text-accent ' +
  'prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-strong:text-heading prose-strong:font-medium';

export default function ExpCard({ position, company, companyLink, location, startDate, endDate, tagline, contentHtml, index = 0 }: ExpCardProps) {
  return (
    <HoverCard index={index}>
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
          {startDate} <span className="opacity-50">—</span> {endDate}
        </span>
      </div>
      <h3 className="mt-2 font-heading text-base font-medium leading-snug tracking-tighter text-heading">
        <span className="transition-colors duration-[120ms] group-hover/list-item:text-accent">{position}</span>
        <span className="mx-1.5 text-muted">/</span>
        {companyLink ? (
          <a
            href={companyLink}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-baseline text-heading no-underline hover:text-accent"
          >
            {company}
            <span className="ml-1 text-xs text-muted transition-colors group-hover/list-item:text-accent">&#8599;</span>
          </a>
        ) : (
          <span className="text-heading">{company}</span>
        )}
      </h3>
      {(tagline || location) && (
        <p className="mt-1 text-sm text-muted">{tagline || location}</p>
      )}
      {contentHtml && (
        <div className={prose} dangerouslySetInnerHTML={{ __html: contentHtml }} />
      )}
    </HoverCard>
  );
}
