import { defineField, defineType } from 'sanity'

export const imageWithAltSchema = defineType({
  type: 'image',
  name: 'imageAlt',
  validation: (r) => r.required(),
  options: {
    hotspot: true,
  },
  fields: [
    defineField({
      type: 'string',
      name: 'alt',
      title: 'Alternative Text',
      validation: (r) => r.required(),
    }),
  ],
})
