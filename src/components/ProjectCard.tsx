import HoverCard from './HoverCard';

interface ProjectCardProps {
  title: string;
  company?: string;
  date: string;
  link?: string;
  builtWith?: string[];
  contentHtml?: string;
}

const prose =
  'mt-3 text-[0.975rem] leading-relaxed text-slate-300 prose prose-invert max-w-none ' +
  'prose-headings:text-slate-100 prose-headings:text-base prose-headings:font-semibold prose-headings:tracking-tighter prose-headings:mt-4 prose-headings:mb-2 ' +
  'prose-p:text-slate-300 prose-li:text-slate-300 prose-li:my-0.5 prose-ul:my-1.5 marker:text-slate-400 ' +
  'prose-a:text-blue-400 prose-a:underline prose-a:decoration-1 prose-a:underline-offset-[0.2em] prose-strong:text-slate-100 prose-strong:font-medium';

export default function ProjectCard({ title, company, date, link, builtWith = [], contentHtml }: ProjectCardProps) {
  const Title = (
    <span className="transition-colors duration-[120ms] group-hover/list-item:text-blue-400">
      {title}
      {link && <span className="ml-1 text-xs text-slate-400 transition-colors group-hover/list-item:text-blue-400">&#8599;</span>}
    </span>
  );

  return (
    <HoverCard>
      <div className="flex items-baseline justify-between gap-4">
        <span className="meta-data">{date}</span>
        {company && <span className="meta-data meta-data--muted">{company}</span>}
      </div>
      <h3 className="mt-2 title-entry">
        {link ? (
          <a href={link} target="_blank" rel="noreferrer noopener" className="text-slate-100 no-underline hover:text-slate-100">
            {Title}
          </a>
        ) : (
          Title
        )}
      </h3>
      {builtWith.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
          {builtWith.map((tech) => (
            <li
              key={tech}
              className={`font-mono text-[11px] uppercase tracking-[0.1em] text-slate-400 before:mr-1.5 before:text-slate-400 before:content-['+']`}
            >
              {tech}
            </li>
          ))}
        </ul>
      )}
      {contentHtml && (
        <div className={prose} dangerouslySetInnerHTML={{ __html: contentHtml }} />
      )}
    </HoverCard>
  );
}
