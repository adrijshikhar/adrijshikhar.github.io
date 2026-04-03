import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';

interface ProjectCardProps {
  title: string;
  company?: string;
  date: string;
  link?: string;
  builtWith?: string[];
  contentHtml?: string;
}

export default function ProjectCard({ title, company, date, link, builtWith = [], contentHtml }: ProjectCardProps) {
  return (
    <li className="mb-12">
      <Card className="!gap-0 !overflow-visible !rounded-none !py-0 group relative border-0 bg-transparent p-0 shadow-none !ring-0 text-inherit transition-all lg:hover:!opacity-100 lg:group-hover/list:opacity-50">
        <div className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-6 lg:block lg:group-hover:bg-slate-800/50 lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg" />
        <CardHeader className="relative z-10 !gap-0 !p-0">
          <div className="flex items-baseline justify-between gap-4">
            <CardTitle className="!text-base !font-medium !leading-snug text-slate-200">
              {link ? (
                <a href={link} target="_blank" rel="noreferrer noopener" className="text-inherit hover:text-inherit inline-flex items-baseline">
                  <span className="group-hover:text-accent transition-colors">
                    {title}<span className="ml-1 text-xs text-slate-400/60 group-hover:text-accent transition-colors">&#8599;</span>
                  </span>
                </a>
              ) : (
                <span className="group-hover:text-accent transition-colors">{title}</span>
              )}
            </CardTitle>
            <span className="shrink-0 text-xs font-mono uppercase tracking-wide text-slate-400/60">{date}</span>
          </div>
          {company && (
            <CardDescription className="text-slate-400/60 text-sm mt-0.5">{company}</CardDescription>
          )}
        </CardHeader>
        {builtWith.length > 0 && (
          <div className="relative z-10 flex flex-wrap gap-1.5 mt-2">
            {builtWith.map((tech) => (
              <span key={tech} className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">{tech}</span>
            ))}
          </div>
        )}
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
