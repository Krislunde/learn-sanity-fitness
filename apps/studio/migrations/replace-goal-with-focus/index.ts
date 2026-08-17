import {defineMigration, at, setIfMissing, unset, insert} from 'sanity/migrate'
import {PROGRAM_FOCUS_LABELS} from '../../schemaTypes/program'

// Should be unique for the migration but never change.
const idempotenceKey = 'migrate-program-goal-to-focus'

const from = 'goal'
const to = 'focus'

// `goal` was free text, so every program phrased its purpose differently. Each
// pattern maps a phrase onto one of the values `focus` now allows. Ordered:
// the first match wins, so put the more specific patterns first.
const RULES: Array<[RegExp, string]> = [
  [/hypertroph|muscle|size|mass/i, 'hypertrophy'],
  [/strength|stronger|powerlift/i, 'strength'],
  [/fat|weight loss|lean|cut/i, 'fat-loss'],
  [/endurance|cardio|conditioning|stamina|run/i, 'endurance'],
  [/mobility|flexib|stretch|rom/i, 'mobility'],
  [/foundation|movement pattern|basic|beginner|fundamental/i, 'foundations'],
]

export function normalizeGoal(goal: unknown): string | undefined {
  if (typeof goal !== 'string') return undefined

  // Already a valid value (e.g. a partially migrated document).
  if (goal in PROGRAM_FOCUS_LABELS) return goal

  return RULES.find(([pattern]) => pattern.test(goal))?.[1]
}

export default defineMigration({
  title: 'Replace program goal with focus',
  documentTypes: ['program'],
  filter: `defined(${from}) && !defined(${to})`,
  migrate: {
    document(doc) {
      if (((doc?._migrations as string[]) || []).includes(idempotenceKey)) {
        // Document already migrated, so we can skip.
        return
      }

      const focus = normalizeGoal(doc[from])

      // Nothing sensible to map this phrase onto. Leaving `goal` in place keeps
      // the wording available to whoever picks a focus by hand, and leaves the
      // document matching this migration's filter so a later run can retry it.
      if (!focus) {
        console.warn(`Could not classify goal ${JSON.stringify(doc[from])} on ${doc._id} - skipping`)
        return
      }

      return [
        at(to, setIfMissing(focus)),
        at(from, unset()),
        // … add idempotence key
        at('_migrations', setIfMissing([])),
        at('_migrations', insert(idempotenceKey, 'after', 0)),
      ]
    },
  },
})
