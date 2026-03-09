import { defineCollection, z } from 'astro:content';

const realizacje = defineCollection({
  type: 'content', 
  schema: z.object({
    title: z.string(),
    order: z.number().default(0), 
    description: z.string().optional(),
    author: z.string().default('Redakcja Offroad News'),
    date: z.coerce.date(), 
    tags: z.array(z.string()).optional(),
    category: z.union([z.string(), z.array(z.string())]).optional(),
    thumbnail: z.string().optional(),
    tileImage: z.string().optional(),
    imageMain: z.string().optional(),
    link: z.string().optional(),
    background: z.string().optional(),
    tileBg: z.string().optional(),
    robots: z.string().optional(),
  }),
});

const artykuly = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    author: z.string().optional().default('Redakcja Offroad News'),
    date: z.coerce.date(),
    tags: z.array(z.string()).optional(),
    thumbnail: z.string().optional(),
    tileImage: z.string().optional(),
    imageMain: z.string().optional(),
    background: z.string().optional(),
    tileBg: z.string().optional(),
    robots: z.string().optional(),
    order: z.number().optional(),
    category: z.union([z.string(), z.array(z.string())]).optional(),
  }),
});

const imprezy = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    dateStart: z.coerce.date(),
    dateEnd: z.coerce.date().optional(),
    location: z.string(),
    region: z.string().optional(),
    organizer: z.string().optional(),
    type: z.string().optional(),
    status: z.string().optional(),
    thumbnail: z.string().optional(),
    tileImage: z.string().optional(),
    featured: z.boolean().optional().default(false),
    robots: z.string().optional(),
  }),
});

export const collections = {
  realizacje,
  artykuly,
  imprezy,
  miasta: defineCollection({
    type: 'content',
    schema: z.object({
      town: z.string(),
      title: z.string(),
      description: z.string(),
      maplink: z.string(),
    }),
  }),
  faq: defineCollection({
    type: 'content',
    schema: z.object({
      title: z.string(),
      answer: z.string(),
    }),
  }),
  opinie: defineCollection({
    type: 'content',
    schema: z.object({
      title: z.string(),
      client: z.string().optional(),
      industry: z.string().optional(),
      review: z.string(),
      clientlogo: z.string().optional(),
      clientavatar: z.string().optional(),
      addate: z.string().optional(),
      order: z.number().optional(),
    }),
  }),
  klienci: defineCollection({
    type: 'content',
    schema: z.object({
      title: z.string(),
      logo: z.string().optional(),
    }),
  }),
};
