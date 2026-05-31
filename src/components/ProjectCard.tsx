import { CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import HoverCard from './HoverCard';

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
    <HoverCard>
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
    </HoverCard>
  );
}
