import { CardHeader, CardTitle } from './ui/card';
import HoverCard from './HoverCard';

interface BlogCardProps {
  title: string;
  date: string;
  href: string;
}

export default function BlogCard({ title, date, href }: BlogCardProps) {
  return (
    <HoverCard>
      <CardHeader className="relative z-10 !gap-0 !p-0">
        <a href={href} className="flex flex-col gap-1.5 text-inherit hover:text-inherit">
          <span className="bh-label inline-block text-accent">{date}</span>
          <CardTitle className="!text-lg !font-bold !leading-tight !tracking-tightest text-heading">
            <span className="transition-colors group-hover:text-accent">{title}</span>
          </CardTitle>
        </a>
      </CardHeader>
    </HoverCard>
  );
}
