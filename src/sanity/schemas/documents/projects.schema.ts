import { defineArrayMember, defineField, defineType } from 'sanity'

export const projectsSchema = defineType({
  name: 'projects',
  title: 'Projects',
  type: 'document',
  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
      media: 'cover.asset',
    },
  },
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 124,
      },
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'cover',
      title: 'Cover',
      type: 'imageAlt',
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'content',
      title: 'Content',
      type: 'blockContent',
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'service',
      title: 'Service',
      type: 'string',
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'credits',
      title: 'Credits',
      type: 'array',
      of: [{ type: 'string' }],
    }),

    defineField({
      name: 'client',
      title: 'Client',
      type: 'reference',
      to: { type: 'clients' },
    }),

    defineField({
      name: 'link',
      title: 'Link',
      type: 'url',
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      validation: (r) => r.required(),
      options: {
        layout: 'grid',
      },
      of: [
        defineArrayMember({
          name: 'imageLayout',
          type: 'object',
          validation: (r) => r.required(),
          preview: {
            select: {
              title: 'image.alt',
              media: 'image.asset',
            },
          },
          fields: [
            defineField({
              name: 'image',
              title: 'Image',
              type: 'imageAlt',
              validation: (r) => r.required(),
            }),
            defineField({
              name: 'layout',
              title: 'Layout',
              type: 'string',
              options: {
                list: ['full', 'half', 'third'],
              },
              validation: (r) => r.required(),
            }),
          ],
        }),
      ],
    }),

    defineField({
      name: 'date',
      title: 'Date',
      type: 'datetime',
      validation: (r) => r.required(),
      options: {
        dateFormat: 'MM-YYYY',
      },
    }),
  ],
})
