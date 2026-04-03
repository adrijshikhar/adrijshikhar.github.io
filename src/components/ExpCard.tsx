import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';

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
    <li className="mb-12">
      <Card className="!gap-0 !overflow-visible !rounded-none !py-0 group relative border-0 bg-transparent p-0 shadow-none !ring-0 text-inherit transition-all lg:hover:!opacity-100 lg:group-hover/list:opacity-50">
        <div className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-6 lg:block lg:group-hover:bg-slate-800/50 lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg" />
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
      </Card>
    </li>
  );
}
