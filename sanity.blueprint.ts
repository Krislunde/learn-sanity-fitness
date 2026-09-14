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
    defineDocumentFunction({
      name: 'complete-muscles',
      event: {
        on: ['create', 'update'],
        filter:
          '_type == "exercise" && (!defined(muscles) || count(muscles) < 2) && !defined(musclesSuggestedAt)',
        projection: '{_id, name, muscles}',
        resource: {
          type: 'dataset',
          id: 'w4np8kfp.production',
        },
      },
      timeout: 60,
    }),
  ],
})
