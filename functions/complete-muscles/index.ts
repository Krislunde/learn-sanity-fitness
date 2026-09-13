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
        exercise: {type: 'document', documentId: data._id},
        muscles: {type: 'groq', query: '*[_type == "muscle"]{_id, name}'},
      },
      format: 'json',
      temperature: 0.1,
    })

    // Typed as an object, but parse defensively in case the API hands back a string.
    const parsed: MuscleChoice = typeof result === 'string' ? JSON.parse(result) : result
    const proposed = [...new Set(parsed?.ids ?? [])]

    if (proposed.length < MIN_MUSCLES) {
      console.log(`Skip ${data.name}: ${proposed.length} proposed. ${parsed?.reasoning ?? ''}`)
      return
    }

    // Never trust returned IDs. A reference to a non-existent document is a broken document.
    const valid = await write.fetch<string[]>('*[_type == "muscle" && _id in $ids]._id', {
      ids: proposed,
    })
    const existing = (data.muscles ?? []).map((m) => m._ref)
    const toAdd = valid.filter((id) => !existing.includes(id))

    if (!toAdd.length) {
      console.log(`Skip ${data.name}: nothing new to add.`)
      return
    }

    // The blueprint filter is the loop guard: it stops matching at two or more
    // muscles. A write that lands the document below that would still match and
    // re-invoke on the next publish, so only write when it clears the bar.
    if (existing.length + toAdd.length < MIN_MUSCLES) {
      console.log(
        `Skip ${data.name}: ${toAdd.length} valid of ${proposed.length} proposed, still under ${MIN_MUSCLES}.`,
      )
      return
    }

    await write
      .patch(data._id)
      .setIfMissing({muscles: []})
      .append(
        'muscles',
        toAdd.map((_ref) => ({_type: 'reference', _ref, _key: crypto.randomUUID()})),
      )
      .commit({dryRun: context.local})

    console.log(
      `${context.local ? 'Dry run: ' : ''}${data.name}: added ${toAdd.length}. ${parsed?.reasoning ?? ''}`,
    )
  } catch (error) {
    console.error(error)
  }
})
