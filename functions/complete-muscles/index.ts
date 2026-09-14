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

const MIN_MUSCLES = 2

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
  // and then excluded by the event filter. This is the only thing written to the
  // published document: the suggestion itself only ever lands on the draft.
  const markConsidered = () =>
    write.patch(publishedId).set({musclesSuggestedAt: now}).commit({dryRun: context.local})

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
        '{"ids": ["<_id>", "<_id>"], "reasoning": "one short sentence"}',
        '',
        'Rules:',
        '- Use only _id values from the supplied list. Never invent one.',
        '- Return the primary movers, normally two to four. Do not pad with minor stabilisers.',
        '- If you cannot confidently pick at least two, return {"ids": [], "reasoning": "why"}.',
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
      await markConsidered()
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

    if (!toAdd.length) {
      await markConsidered()
      console.log(`Skip ${data.name}: nothing new to add.`)
      return
    }

    // Only suggest a set that would actually clear the two-muscle bar, so accepting the
    // draft cannot leave the document in a state that still looks under-tagged.
    if (base.length + toAdd.length < MIN_MUSCLES) {
      await markConsidered()
      console.log(
        `Skip ${data.name}: ${toAdd.length} valid of ${proposed.length} proposed, still under ${MIN_MUSCLES}.`,
      )
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
    await markConsidered()

    console.log(
      `${context.local ? 'Dry run: ' : ''}${data.name}: suggested ${toAdd.length} on ${draftId}. ${parsed?.reasoning ?? ''}`,
    )
  } catch (error) {
    console.error(error)
  }
})
