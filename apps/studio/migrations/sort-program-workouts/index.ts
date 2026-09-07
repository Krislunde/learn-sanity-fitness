import {at, defineMigration, set} from 'sanity/migrate'

// `workout.order` is a single global number on a document that can belong to
// several programs, so it cannot express "day 2 of *this* program". Array
// position in `program.workouts` can. Before `remove-workout-order` deletes the
// field, fold whatever intent it carried into the array so nothing is lost.
//
// Run this BEFORE `remove-workout-order`. Once `order` is unset there is nothing
// left to sort by.

type WorkoutRef = {_key: string; _ref: string; _type: 'reference'}

// Workouts with no `order` sort last and keep their relative position, so a
// half-filled field never scrambles an array that was already correct. A finite
// sentinel rather than Infinity: subtracting two Infinities gives NaN, which
// makes the comparator meaningless.
const NO_ORDER = Number.MAX_SAFE_INTEGER

export default defineMigration({
  title: 'Sort program workouts by the legacy workout order field',
  documentTypes: ['program'],
  // A program with one workout cannot be out of sequence.
  filter: `count(workouts) > 1`,
  migrate: {
    async document(doc, context) {
      const workouts = doc.workouts as WorkoutRef[] | undefined

      // An async `document` helper cannot return `undefined` the way the sync
      // one can, so "nothing to do" is an empty patch list.
      if (!workouts || workouts.length < 2) return []

      // `context.filtered` only sees the documents this migration selected -
      // programs - so the workouts themselves have to come from the client.
      // Note this reads the live dataset even during a `--from-export` dry run.
      //
      // `fetch`, not `getDocuments`: the proxy that restricts the migration
      // client hands back unbound methods, and getDocument/getDocuments then
      // fail on a private field ("Cannot read private member #httpRequest").
      const referenced = await context.client.fetch<{_id: string; order?: number}[]>(
        `*[_id in $ids]{_id, order}`,
        {ids: workouts.map((ref) => ref._ref)},
      )

      const orderById = new Map<string, number>()
      for (const workout of referenced) {
        orderById.set(workout._id, typeof workout.order === 'number' ? workout.order : NO_ORDER)
      }

      const orderOf = (ref: WorkoutRef) => orderById.get(ref._ref) ?? NO_ORDER

      const unordered = workouts.filter((ref) => orderOf(ref) === NO_ORDER)
      if (unordered.length) {
        console.warn(
          `${doc._id}: ${unordered.length} of ${workouts.length} workouts have no order - leaving those at the end`,
        )
      }

      // Array.prototype.sort is stable, so equal keys keep their current position.
      const sorted = [...workouts].sort((a, b) => orderOf(a) - orderOf(b))

      // Already in the right sequence. Returning nothing is what makes this
      // migration idempotent - no `_migrations` bookkeeping needed, unlike
      // `replace-goal-with-focus`, where setIfMissing/insert are not repeatable.
      if (sorted.every((ref, index) => ref._key === workouts[index]._key)) return []

      // Reordering the existing members carries each `_key` along, so no
      // reference loses its identity and no history is orphaned.
      return at('workouts', set(sorted))
    },
  },
})
