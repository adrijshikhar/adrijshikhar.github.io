import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    draft: z.boolean().default(false),
    canonicalUrl: z.string().url().optional(),
    // Optional cover/banner image — absolute path under /public (e.g. /blog/foo.png)
    // or a remote URL. Rendered full-width atop the post and as a list thumbnail.
    cover: z.string().optional(),
  }),
});

export const collections = { blog };
