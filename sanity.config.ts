'use client'

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `\src\app\workspace\[[...tool]]\page.tsx` route
 */

import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { apiVersion, dataset, projectId } from '@/sanity/env'
import { schema } from '@/sanity/schemas'
import { structure } from '@/sanity/structure'

import { Logo } from '@/components/common/icon'

export default defineConfig({
  basePath: '/workspace',
  projectId,
  dataset,
  icon: Logo,
  title: "Yovizn Project's Content",
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema,
  plugins: [
    structureTool({ structure }),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
