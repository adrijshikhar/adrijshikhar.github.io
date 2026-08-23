import { Card, CardHeader, CardTitle } from '@/components/ui/card';

interface BlogCardProps {
  title: string;
  date: string;
  href: string;
}

export default function BlogCard({ title, date, href }: BlogCardProps) {
  return (
    <Card
      className="group transition-all duration-200 hover:-translate-y-0.5 hover:border-ring hover:shadow-lg motion-reduce:translate-none motion-reduce:transition-none"
    >
      <CardHeader>
        <div className="text-xs text-muted-foreground">{date}</div>
        <CardTitle className="text-xl">
          <a href={href} className="hover:underline">
            {title} <span aria-hidden="true">&rarr;</span>
          </a>
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
