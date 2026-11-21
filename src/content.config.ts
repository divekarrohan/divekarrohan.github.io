import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const metric = z.object({ label: z.string(), value: z.string() });

// One Markdown file per concept = one demo card.
// A card marked `live` must carry a demo file, at least two numbers and a code link,
// so an unfinished card can never be published as finished.
const concepts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/concepts' }),
  schema: z
    .object({
      title: z.string(),
      claim: z.string(),
      week: z.number().int().min(0).max(16), // week of the 16-week plan; 0 = done before it
      order: z.number().int(),
      status: z.enum(['planned', 'in-progress', 'live']),
      demo: z.object({
        type: z.enum(['plot', 'animation', 'video', 'live']),
        src: z.string().optional(), // path under /public, e.g. /demos/kl.gif, or a URL for live demos
        alt: z.string(),
      }),
      metrics: z.array(metric).default([]),
      code: z.url().optional(),
      derivation: z.url().optional(),
      shows: z.string(),
      limits: z.string(),
    })
    .superRefine((card, ctx) => {
      if (card.status !== 'live') return;
      if (!card.demo.src) ctx.addIssue({ code: 'custom', message: 'live card needs demo.src', path: ['demo', 'src'] });
      if (card.metrics.length < 2) ctx.addIssue({ code: 'custom', message: 'live card needs at least 2 metrics', path: ['metrics'] });
      if (!card.code) ctx.addIssue({ code: 'custom', message: 'live card needs a code link', path: ['code'] });
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    repo: z.string(), // repo name on GitHub
    weeks: z.string(), // e.g. "1–16"
    order: z.number().int(),
    status: z.enum(['planned', 'in-progress', 'live']),
    proves: z.string(),
    headline: z.string(), // the one number a hiring manager should see
    gate: z.string(),
  }),
});

export const collections = { concepts, projects };
