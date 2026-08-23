import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BlogCardProps {
  title: string;
  date: string;
  href: string;
  description?: string;
}

export default function BlogCard({ title, date, href, description }: BlogCardProps) {
  return (
    <Card
      className="group h-full transition-all duration-200 hover:-translate-y-0.5 hover:border-ring hover:shadow-lg motion-reduce:translate-none motion-reduce:transition-none"
    >
      <CardHeader>
        <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{date}</div>
        <CardTitle className="text-xl leading-snug">
          <a href={href} className="hover:underline">
            {title} <span aria-hidden="true">&rarr;</span>
          </a>
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
    </Card>
  );
}
