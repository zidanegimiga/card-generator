import { z } from "zod";

import {
  domainSchema,
  hexColorSchema,
  imageUrlSchema,
} from "@/lib/card/schema";

/** The API contract. The server builds it, the client validates it. */
export const brandPullSchema = z.object({
  name: z.string().min(1).max(32),
  domain: domainSchema,
  logoUrl: imageUrlSchema.optional(),
  primary: hexColorSchema.optional(),
  background: hexColorSchema.optional(),
  text: hexColorSchema.optional(),
});

export type BrandPull = z.output<typeof brandPullSchema>;

export const brandPullErrorSchema = z.object({ error: z.string() });
