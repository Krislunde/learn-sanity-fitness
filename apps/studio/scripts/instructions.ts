import {getCliClient} from 'sanity/cli'

// Run with:  pnpm --filter ./apps/studio exec sanity exec scripts/instructions.ts --with-user-token
const client = getCliClient({apiVersion: 'vX'})

const EXERCISE_QUERY = `*[
    _type == "exercise"
    && defined(name)
    && defined(equipment)
    && !defined(instructions)][0]{
      _id,
      name,
      equipment->{ name },
      "muscles": muscles[]->name
}`

type ExerciseDocument = {
  _id: string
  name: string
  equipment: {name: string}
  muscles: string[] | null
}

async function run() {
  const exercise = await client.fetch<ExerciseDocument | null>(EXERCISE_QUERY)

  if (!exercise) {
    console.log('Every exercise with equipment already has instructions - nothing to do.')
    return
  }

  await client.agent.action
    .generate({
      schemaId: '_.schemas.default',
      documentId: exercise._id,
      instruction:
        'Write short, numbered, step-by-step instructions for performing this exercise safely. ' +
        'The exercise is "$name", it uses $equipment, and it trains $muscles. ' +
        'Keep it to four or five steps and include one safety cue.',
      instructionParams: {
        name: exercise.name,
        equipment: exercise.equipment.name,
        muscles: exercise.muscles?.join(', ') || 'the whole body',
      },
      target: [{path: ['instructions']}],
    })
    .then((res) => {
      console.log('Wrote instructions for', exercise.name)
      console.log(res.instructions?.[0]?.children?.[0]?.text)
    })
    .catch((err) => {
      console.error(err)
    })
}

run()
