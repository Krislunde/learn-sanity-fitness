import {at, defineMigration, unset} from 'sanity/migrate'

export default defineMigration({
  title: 'remove-workout-order',
  documentTypes: ['workout'],
  filter: `defined(order)`,
  migrate: {
    document(doc) {
      return [at('order', unset())]
    },
  },
})
