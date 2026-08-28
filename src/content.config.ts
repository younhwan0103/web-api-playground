import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const webApi = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/web-api" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    /** 붙일 데모. 값을 추가하면 [...slug].astro에도 분기를 추가해야 한다. */
    demo: z.enum(["broadcast", "canvas"]).optional(),
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

export const collections = { webApi };
