import {defineBlueprint, defineDocumentFunction} from '@sanity/blueprints'

export default defineBlueprint({
  resources: [
    defineDocumentFunction({
      name: 'first-published',
      event: {
        includeAllVersions: true,
        on: ['create', 'update'],
        filter: '_type == "program" && !defined(firstPublished)',
      },
    }),
  ],
})
