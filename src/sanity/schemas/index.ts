import { type SchemaTypeDefinition } from 'sanity'

import { imageWithAltSchema } from './components/imageWithAlt.schema'
import { clientsSchema } from './documents/clients.schema'
import { clientsViewSchema } from './documents/clients-view.schema'
import { projectsSchema } from './documents/projects.schema'
import { blockContentSchema } from './components/blockContent.schema'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [imageWithAltSchema, clientsSchema, clientsViewSchema, projectsSchema, blockContentSchema],
}
