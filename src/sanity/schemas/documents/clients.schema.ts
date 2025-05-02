import { defineField, defineType } from 'sanity'

export const clientsSchema = defineType({
  name: 'clients',
  title: 'Clients',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 124,
      },
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'imageWithAlt',
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'link',
      title: 'Link',
      type: 'url',
    }),
  ],
})
