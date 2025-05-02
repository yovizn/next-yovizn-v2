import { type SchemaTypeDefinition } from 'sanity'
import { imageWithAltSchema } from './components/imageWithAlt.schema'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [imageWithAltSchema],
}
