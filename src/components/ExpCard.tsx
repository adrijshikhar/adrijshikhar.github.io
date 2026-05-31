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
          <div className="flex items-baseline justify-between gap-4">
            <CardTitle className="!text-base !font-medium !leading-snug text-slate-200">
              <span className="group-hover:text-accent transition-colors">{position}</span>
              <span className="mx-1 text-slate-400/40">·</span>
              {companyLink ? (
                <a href={companyLink} target="_blank" rel="noreferrer noopener" className="text-inherit hover:text-inherit inline-flex items-baseline">
                  {company}<span className="ml-1 text-xs text-slate-400/60 group-hover:text-accent transition-colors">&#8599;</span>
                </a>
              ) : <span>{company}</span>}
            </CardTitle>
            <span className="shrink-0 text-xs font-mono uppercase tracking-wide text-slate-400/60">{startDate} — {endDate}</span>
          </div>
          {(tagline || location) && (
            <CardDescription className="text-slate-400/60 text-sm mt-0.5">
              {tagline || location}
            </CardDescription>
          )}
        </CardHeader>
        {contentHtml && (
          <CardContent
            className="relative z-10 !p-0 mt-2 text-sm leading-normal text-slate-400 prose prose-invert prose-sm max-w-none prose-headings:text-slate-200 prose-headings:text-sm prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2 prose-li:my-0.5 prose-ul:my-1 prose-a:text-accent prose-strong:text-slate-200"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        )}
    </HoverCard>
  );
}
