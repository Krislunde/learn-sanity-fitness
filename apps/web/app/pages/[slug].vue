<script setup lang="ts">
import { PROGRAM_QUERY } from '~/sanity/queries'
import type { PROGRAM_QUERY_RESULT } from '~/sanity/types'
import { FOCUS_LABELS } from '~/sanity/labels'

const route = useRoute()
const { data: program } = await useSanityQuery<PROGRAM_QUERY_RESULT>(PROGRAM_QUERY, { slug: route.params.slug })

if (!program.value) {
  throw createError({ statusCode: 404, statusMessage: 'Program not found', fatal: true })
}
</script>

<template>
  <article v-if="program">
    <h1>{{ program.title }}</h1>

    <p
      v-if="program.focus || program.duration || program.coach"
      class="meta"
    >
      <span v-if="program.focus">{{ FOCUS_LABELS[program.focus] || program.focus }}</span>
      <span v-if="program.focus && (program.duration || program.coach)"> · </span>
      <span v-if="program.duration">{{ program.duration }} weeks</span>
      <span v-if="program.duration && program.coach"> · </span>
      <span v-if="program.coach">with {{ program.coach.name }}</span>
    </p>

    <p v-if="program.description">
      {{ program.description }}
    </p>

    <section v-if="program.workouts?.length">
      <h2>Workouts</h2>

      <ol class="workout-list">
        <li
          v-for="workout in program.workouts"
          :key="workout._id"
        >
          <NuxtLink
            :to="`/workouts/${workout.slug?.current}`"
            class="workout-title"
          >
            {{ workout.title }}
          </NuxtLink>
          <span
            v-if="workout.estimatedDuration"
            class="meta"
          >{{ workout.estimatedDuration }} min</span>
        </li>
      </ol>
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

.workout-list {
  margin: 0;
  padding-left: 1.25rem;

  li {
    padding-block: 0.4rem;
  }
}

.workout-title {
  margin-right: 0.5rem;
  font-weight: 550;
}
</style>
