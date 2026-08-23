import { Card, CardHeader, CardTitle } from '@/components/ui/card';

interface BlogCardProps {
  title: string;
  date: string;
  href: string;
}

export default function BlogCard({ title, date, href }: BlogCardProps) {
  return (
    <Card>
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
