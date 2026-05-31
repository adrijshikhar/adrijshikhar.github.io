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
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">{date}</span>
        <h3 className="mt-2 font-heading text-base font-medium leading-snug tracking-tighter text-heading">
          <span className="transition-colors duration-[120ms] group-hover:text-accent">{title}</span>
          <span className="ml-1 text-xs text-muted transition-colors group-hover:text-accent">&rarr;</span>
        </h3>
      </a>
    </HoverCard>
  );
}
