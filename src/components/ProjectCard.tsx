import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProjectCardProps {
  title: string;
  company?: string;
  date: string;
  link?: string;
  builtWith?: string[];
  contentHtml?: string;
}

export default function ProjectCard({
  title,
  company,
  date,
  link,
  builtWith = [],
  contentHtml,
}: ProjectCardProps) {
  return (
    <Card
      className="group transition-colors duration-200 rounded-none border-0 border-b border-border bg-transparent p-0 py-6 shadow-none gap-2 hover:border-input motion-reduce:transition-none"
    >
      <CardHeader className="p-0 gap-2">
        <div className="flex items-baseline justify-between gap-4 font-mono text-xs uppercase tracking-wider">
          <span className="text-number-ink">{date}</span>
          {company && <span className="text-muted-foreground">{company}</span>}
        </div>
        <CardTitle className="text-heading text-xl leading-snug">
          {link ? (
            <a href={link} target="_blank" rel="noreferrer noopener" className="text-heading no-underline hover:text-heading hover:no-underline">
              {title} <span className="text-primary" aria-hidden="true">&#8599;</span>
            </a>
          ) : (
            title
          )}
        </CardTitle>
        {builtWith.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {builtWith.map((tech) => (
              <Badge key={tech} variant="secondary" className="text-tag-ink rounded-none border border-border/80 bg-secondary/80">
                {tech}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      {contentHtml && (
        <CardContent className="p-0 pt-3">
          <div
            className="prose prose-sm prose-invert max-w-none text-base leading-[1.65]"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </CardContent>
      )}
    </Card>
  );
}
