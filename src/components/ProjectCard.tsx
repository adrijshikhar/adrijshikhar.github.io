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
        <span className="bh-label mb-2 inline-block text-accent">{date}</span>
        <div className="flex items-baseline justify-between gap-4">
          <CardTitle className="!text-lg !font-bold !leading-tight !tracking-tightest text-heading">
            {link ? (
              <a href={link} target="_blank" rel="noreferrer noopener" className="inline-flex items-baseline text-inherit hover:text-inherit">
                <span className="transition-colors group-hover:text-accent">
                  {title}<span className="ml-1 text-xs text-muted transition-colors group-hover:text-accent">&#8599;</span>
                </span>
              </a>
            ) : (
              <span className="transition-colors group-hover:text-accent">{title}</span>
            )}
          </CardTitle>
        </div>
        {company && (
          <CardDescription className="mt-1 text-sm font-semibold text-ink">{company}</CardDescription>
        )}
      </CardHeader>
      {builtWith.length > 0 && (
        <div className="relative z-10 mt-3 flex flex-wrap gap-1.5">
          {builtWith.map((tech) => (
            <span key={tech} className="border-2 border-ink bg-bg px-2 py-0.5 font-mono text-[0.65rem] font-bold uppercase tracking-wide text-ink">{tech}</span>
          ))}
        </div>
      )}
      {contentHtml && (
        <CardContent
          className="prose relative z-10 mt-3 max-w-none !p-0 text-[0.975rem] leading-relaxed text-text prose-headings:mb-2 prose-headings:mt-4 prose-headings:text-base prose-headings:font-bold prose-headings:text-heading prose-a:text-accent prose-strong:text-heading prose-ul:my-2 prose-li:my-1"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      )}
    </HoverCard>
  );
}
