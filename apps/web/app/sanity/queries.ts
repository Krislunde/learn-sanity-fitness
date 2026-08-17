import { defineQuery } from 'groq'

// Queries live here rather than inline in pages so Sanity TypeGen can find them
// and generate a result type for each one. Pages import the query and its type
// together, which is what keeps the front end honest about the schema.

export const PROGRAMS_QUERY = defineQuery(`*[_type == "program" && defined(slug.current)] | order(title asc){
  _id, title, slug, focus, duration
}`)

export const PROGRAM_QUERY = defineQuery(`*[_type == "program" && slug.current == $slug][0]{
  _id, title, description, focus, duration,
  coach->{ name, slug },
  workouts[]->{ _id, title, slug, order, estimatedDuration }
}`)

export const WORKOUT_QUERY = defineQuery(`*[_type == "workout" && slug.current == $slug][0]{
  _id, title, order, estimatedDuration,
  coach->{ name },
  exercises[]->{ _id, name, slug, difficulty }
}`)

export const EXERCISE_QUERY = defineQuery(`*[_type == "exercise" && slug.current == $slug][0]{
  _id, name, difficulty, instructions, demoVideoUrl,
  muscles[]->{ name },
  equipment->{ name }
}`)
