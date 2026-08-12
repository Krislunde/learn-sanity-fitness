<script setup lang="ts">
type Workout = {
  _id: string
  title?: string
  order?: number
  estimatedDuration?: number
  coach?: { name?: string }
  exercises?: Array<{
    _id: string
    name?: string
    slug?: { current?: string }
    difficulty?: string
  }>
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced'
}

const route = useRoute()
const query = groq`*[_type == "workout" && slug.current == $slug][0]{
  _id, title, order, estimatedDuration,
  coach->{ name },
  exercises[]->{ _id, name, slug, difficulty }
}`
const { data: workout } = await useSanityQuery<Workout | null>(query, { slug: route.params.slug })

if (!workout.value) {
  throw createError({ statusCode: 404, statusMessage: 'Workout not found', fatal: true })
}
</script>

<template>
  <article v-if="workout">
    <h1>{{ workout.title }}</h1>

    <p
      v-if="workout.order || workout.estimatedDuration || workout.coach"
      class="meta"
    >
      <span v-if="workout.order">Day {{ workout.order }}</span>
      <span v-if="workout.order && (workout.estimatedDuration || workout.coach)"> · </span>
      <span v-if="workout.estimatedDuration">{{ workout.estimatedDuration }} min</span>
      <span v-if="workout.estimatedDuration && workout.coach"> · </span>
      <span v-if="workout.coach">with {{ workout.coach.name }}</span>
    </p>

    <section v-if="workout.exercises?.length">
      <h2>Exercises</h2>

      <ul class="exercise-list">
        <li
          v-for="exercise in workout.exercises"
          :key="exercise._id"
        >
          <NuxtLink
            :to="`/exercises/${exercise.slug?.current}`"
            class="exercise-name"
          >
            {{ exercise.name }}
          </NuxtLink>
          <span
            v-if="exercise.difficulty"
            class="meta"
          >{{ DIFFICULTY_LABELS[exercise.difficulty] || exercise.difficulty }}</span>
        </li>
      </ul>
    </section>
  </article>
</template>

<style lang="scss" scoped>
.meta {
  color: var(--muted);
  font-size: 0.875rem;
}

h2 {
  margin-top: 2.5rem;
  font-size: 1.35rem;
}

.exercise-list {
  margin: 0;
  padding: 0;
  list-style: none;

  li + li {
    border-top: 1px solid var(--border);
  }

  li {
    padding-block: 0.75rem;
  }
}

.exercise-name {
  margin-right: 0.5rem;
  font-weight: 550;
}
</style>
