import type { StructureResolver } from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title("YOVIZN Project's Content")
    .items([
      S.listItem()
        .id('clientsView')
        .schemaType('clientsView')
        .title('Clients View')
        .child(S.document().schemaType('clientsView').documentId('clientsView')),
      ...S.documentTypeListItems().filter(
        (listItem) => listItem.getId() !== 'clientsView',
      ),
    ])
