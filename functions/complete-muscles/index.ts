import {createClient} from '@sanity/client'
import {documentEventHandler} from '@sanity/functions'

// Deliberately unused. The Agent Actions troubleshooting page says every request
// needs a schemaId, but that applies to the schema-aware actions (generate,
// translate, patch). `prompt` is the raw one: @sanity/client's PromptRequest type
// has no schemaId field at all. Kept here because "which actions are schema-aware"
// is the useful distinction, not a footnote.
// Deployed schema for workspace `default`:
const SCHEMA_ID = 'uEiB81k2a9rDuCuHyrdd8vQrAsiGbzmeyVuRpzJ22dKd6Fg'
void SCHEMA_ID

// The floor on what the model may propose. One, not two: a single-joint isolation
// movement — a rope pushdown, a calf raise — has exactly one primary mover, and the
// muscle vocabulary is eleven coarse groups with no room for a second honest pick.
// A floor of two made the model decline those outright rather than answer with one.
// Thin suggestions on genuine compound lifts are caught by the draft review instead.
const MIN_MUSCLES = 1

interface ExerciseData {
  _id: string
  name?: string
  muscles?: {_ref?: string}[]
}

interface MuscleChoice {
  ids?: string[]
  reasoning?: string
}

export const handler = documentEventHandler<ExerciseData>(async ({context, event}) => {
  const {data} = event

  // Agent Actions require apiVersion 'vX'. Mutations use a dated version.
  const agent = createClient({...context.clientOptions, useCdn: false, apiVersion: 'vX'})
  const write = createClient({...context.clientOptions, useCdn: false, apiVersion: '2026-09-01'})

  const publishedId = data._id
  const draftId = `drafts.${publishedId}`
  const now = new Date().toISOString()

  // Stamped on every outcome, a decline included, so the document is considered once
  // and then excluded by the event filter. The muscles themselves only ever land on
  // the draft. Published carries the stamp and, when nothing was suggested, the note
  // explaining why — otherwise the reason would exist only in the function log, and
  // the editor would see a stamped, untagged exercise with no explanation.
  const markConsidered = (note?: string) => {
    const fields: Record<string, string> = {musclesSuggestedAt: now}
    if (note) fields.musclesSuggestionNote = note
    return write.patch(publishedId).set(fields).commit({dryRun: context.local})
  }

  try {
    const result = await agent.agent.action.prompt<MuscleChoice>({
      instruction: [
        'You are tagging a strength-training exercise with the muscles it works.',
        '',
        'Exercise: $exercise',
        '',
        'Choose only from these muscle documents: $muscles',
        '',
        'Respond in JSON with exactly this shape:',
        '{"ids": ["<_id>"], "reasoning": "one short sentence"}',
        '',
        'Rules:',
        '- Use only _id values from the supplied list. Never invent one.',
        '- Return the primary movers: the muscles the movement is built to work.',
        '  Do not pad the list with minor stabilisers.',
        '- A compound movement normally has two to four primary movers. A single-joint',
        '  isolation movement has one, and a single _id is the correct answer for it.',
        '  Never add a second muscle just to reach a quota.',
        '- Only return {"ids": [], "reasoning": "why"} if no muscle in the list is a',
        '  primary mover for this exercise.',
      ].join('\n'),
      instructionParams: {
        exercise: {type: 'document', documentId: publishedId},
        muscles: {type: 'groq', query: '*[_type == "muscle"]{_id, name}'},
      },
      format: 'json',
      temperature: 0.1,
    })

    // Typed as an object, but parse defensively in case the API hands back a string.
    const parsed: MuscleChoice = typeof result === 'string' ? JSON.parse(result) : result
    const proposed = [...new Set(parsed?.ids ?? [])]

    if (proposed.length < MIN_MUSCLES) {
      await markConsidered(parsed?.reasoning)
      console.log(`Skip ${data.name}: ${proposed.length} proposed. ${parsed?.reasoning ?? ''}`)
      return
    }

    // Never trust returned IDs. A reference to a non-existent document is a broken document.
    const valid = await write.fetch<string[]>('*[_type == "muscle" && _id in $ids]._id', {
      ids: proposed,
    })

    // The suggestion lands on the draft, so compare against the draft when one already
    // exists. Comparing against the published document instead would re-append muscles
    // the draft already carries, breaking the unique() validation on the array.
    const draft = await write.fetch<{muscles?: {_ref?: string}[]} | null>(
      '*[_id == $draftId][0]{muscles}',
      {draftId},
    )
    const base = (draft ? (draft.muscles ?? []) : (data.muscles ?? [])).map((m) => m._ref)
    const toAdd = valid.filter((id) => !base.includes(id))

    // Nothing to add, either because the muscles are already there or because every
    // proposed ID was invalid. The reasoning still describes the tags the exercise
    // carries, so it is worth keeping rather than discarding.
    if (!toAdd.length) {
      await markConsidered(parsed?.reasoning)
      console.log(`Skip ${data.name}: nothing new to add.`)
      return
    }

    // Creates the draft from the published document only if one does not already exist,
    // then patches it — atomically. An editor with a draft open keeps their work; the
    // published document is untouched, so they see "unpublished changes" and review.
    await write.action(
      {
        actionType: 'sanity.action.document.edit',
        draftId,
        publishedId,
        patch: {
          setIfMissing: {muscles: []},
          insert: {
            after: 'muscles[-1]',
            items: toAdd.map((_ref) => ({_type: 'reference', _ref, _key: crypto.randomUUID()})),
          },
          set: {musclesSuggestedAt: now, musclesSuggestionNote: parsed?.reasoning ?? ''},
        },
      },
      {dryRun: context.local},
    )

    // Deliberately after the draft edit. If that throws, the document stays unmarked and
    // is retried on the next publish; marking first would lose the suggestion silently.
    // No note passed: on a suggestion the reasoning belongs on the draft, next to the
    // muscles it explains, not on the published document.
    await markConsidered()

    console.log(
      `${context.local ? 'Dry run: ' : ''}${data.name}: suggested ${toAdd.length} on ${draftId}. ${parsed?.reasoning ?? ''}`,
    )
  } catch (error) {
    console.error(error)
  }
})
