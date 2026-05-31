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
        <a href={href} className="flex flex-col gap-1 text-inherit hover:text-inherit">
          <span className="font-mono text-xs uppercase tracking-wide text-slate-400/60">{date}</span>
          <CardTitle className="!text-base !font-medium !leading-snug text-slate-200">
            <span className="group-hover:text-accent transition-colors">{title}</span>
          </CardTitle>
        </a>
      </CardHeader>
    </HoverCard>
  );
}
