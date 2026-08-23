import HoverCard from './HoverCard';

interface BlogCardProps {
  title: string;
  date: string;
  href: string;
}

export default function BlogCard({ title, date, href }: BlogCardProps) {
  return (
    <HoverCard>
      <a href={href} className="block text-inherit no-underline hover:text-inherit">
        <span className="meta-data">{date}</span>
        <h3 className="mt-2 title-entry">
          <span className="transition-colors duration-[120ms] group-hover/list-item:text-blue-400">{title}</span>
          <span className="ml-1 text-xs text-slate-400 transition-colors group-hover/list-item:text-blue-400">&rarr;</span>
        </h3>
      </a>
    </HoverCard>
  );
}
