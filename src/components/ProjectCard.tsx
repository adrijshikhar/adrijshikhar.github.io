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
      className="group transition-all duration-200 hover:-translate-y-0.5 hover:border-input hover:shadow-none motion-reduce:translate-none motion-reduce:transition-none"
    >
      <CardHeader>
        <div className="flex items-baseline justify-between gap-4 text-xs font-mono uppercase tracking-wider">
          <span className="text-number-ink">{date}</span>
          {company && <span className="text-muted-foreground">{company}</span>}
        </div>
        <CardTitle className="text-heading text-xl leading-snug">
          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`${title} (opens in a new tab)`}
              className="group/link text-heading no-underline transition-colors hover:text-primary hover:no-underline"
            >
              {title}{' '}
              <span className="inline-block text-primary transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" aria-hidden="true">&#8599;</span>
            </a>
          ) : (
            title
          )}
        </CardTitle>
        {builtWith.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {builtWith.map((tech) => (
              <Badge key={tech} variant="secondary" className="text-tag-ink">
                {tech}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      {contentHtml && (
        <CardContent>
          <div
            className="prose prose-sm prose-invert max-w-none text-base leading-[1.65]"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </CardContent>
      )}
    </Card>
  );
}
