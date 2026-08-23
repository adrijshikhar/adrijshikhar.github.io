import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BlogCardProps {
  title: string;
  date: string;
  href: string;
  description?: string;
}

export default function BlogCard({ title, date, href, description }: BlogCardProps) {
  return (
    // `relative` + the anchor's `after:absolute after:inset-0` below is the
    // stretched-link pattern: the whole card is clickable, but there is still
    // exactly ONE link in the accessibility tree, named by the title. Wrapping
    // the card in an <a> instead would swallow the heading semantics, and adding
    // a second overlay anchor would announce the post twice.
    <Card className="group relative h-full transition-all duration-200 hover:-translate-y-0.5 hover:border-ring hover:shadow-lg focus-within:border-ring motion-reduce:translate-none motion-reduce:transition-none">
      <CardHeader>
        <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{date}</div>
        <CardTitle className="text-xl leading-snug">
          <a
            href={href}
            className="after:absolute after:inset-0 after:rounded-xl after:content-[''] group-hover:underline focus-visible:outline-none"
          >
            {title} <span aria-hidden="true">&rarr;</span>
          </a>
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
    </Card>
  );
}
