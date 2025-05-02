import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().nonempty(),
  NEXT_PUBLIC_SANITY_DATASET: z.string().nonempty(),
  NEXT_PUBLIC_SANITY_API_VERSION: z.string().nonempty(),
  //   SANITY_API_READ_TOKEN: z.string().nonempty(),
  //   SANITY_API_WRITE_TOKEN: z.string().nonempty(),
  NEXT_PUBLIC_WEBSITE_NAME: z.string().nonempty(),
  NEXT_PUBLIC_WEBSITE_URL: z.string().nonempty(),
  NEXT_PUBLIC_WEBSITE_HOSTNAME: z.string().nonempty(),
  NEXT_PUBLIC_WEBSITE_DESCRIPTION: z.string().nonempty(),
  NEXT_PUBLIC_GA_ID: z.string().nonempty(),
  NEXT_PUBLIC_GTM_ID: z.string().nonempty(),
});

const envConfig = envSchema.safeParse(process.env);

if (!envConfig.success) {
  console.error("Invalid environment variables:", envConfig.error.format());

  throw new Error("Invalid environment variables");
}

export const env = envConfig.data;
