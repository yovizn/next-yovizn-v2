import { defineField, defineType } from 'sanity'

export const clientsViewSchema = defineType({
  name: 'clientsView',
  title: 'Clients View',
  type: 'document',
  fields: [
    defineField({
        name: 'clients',
        title: 'Clients',
        type: 'array',
        of: [{ type: 'reference', to: { type: 'clients' } }],
    })
  ]
})
