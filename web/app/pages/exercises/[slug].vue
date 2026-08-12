<script setup lang="ts">
import CalloutBlock from '~/components/CalloutBlock.vue'

type Exercise = {
  _id: string
  name?: string
  difficulty?: string
  instructions?: Array<{ _type: string, [key: string]: unknown }>
  demoVideoUrl?: string
  muscles?: Array<{ name?: string }>
  equipment?: { name?: string }
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced'
}

const route = useRoute()
const query = groq`*[_type == "exercise" && slug.current == $slug][0]{
  _id, name, difficulty, instructions, demoVideoUrl,
  muscles[]->{ name },
  equipment->{ name }
}`
const { data: exercise } = await useSanityQuery<Exercise | null>(query, { slug: route.params.slug })

if (!exercise.value) {
  throw createError({ statusCode: 404, statusMessage: 'Exercise not found', fatal: true })
}

// Registers CalloutBlock (auto-imported) as the renderer for the custom `callout`
// Portable Text object type. Without this, <SanityContent> would silently skip it.
const ptComponents = { types: { callout: CalloutBlock } }
</script>

<template>
  <article v-if="exercise">
    <h1>{{ exercise.name }}</h1>

    <p
      v-if="exercise.difficulty || exercise.equipment || exercise.muscles?.length"
      class="meta"
    >
      <span v-if="exercise.difficulty">{{ DIFFICULTY_LABELS[exercise.difficulty] || exercise.difficulty }}</span>
      <span v-if="exercise.difficulty && exercise.equipment"> · </span>
      <span v-if="exercise.equipment">{{ exercise.equipment.name }}</span>
      <span v-if="(exercise.difficulty || exercise.equipment) && exercise.muscles?.length"> · </span>
      <span v-if="exercise.muscles?.length">{{ exercise.muscles.map((m) => m.name).join(', ') }}</span>
    </p>

    <p v-if="exercise.demoVideoUrl">
      <a
        :href="exercise.demoVideoUrl"
        target="_blank"
        rel="noopener"
      >Watch demo</a>
    </p>

    <SanityContent
      v-if="exercise.instructions"
      :value="exercise.instructions"
      :components="ptComponents"
      class="prose"
    />
  </article>
</template>

<style lang="scss" scoped>
.meta {
  color: var(--muted);
  font-size: 0.875rem;
}
</style>
