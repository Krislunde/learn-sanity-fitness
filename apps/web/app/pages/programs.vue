<script setup lang="ts">
type ProgramListItem = {
  _id: string
  title?: string
  slug?: { current?: string }
  goal?: string
  duration?: number
}

const query = groq`*[_type == "program" && defined(slug.current)] | order(title asc){
  _id, title, slug, goal, duration
}`
const { data: programs } = await useSanityQuery<ProgramListItem[]>(query)
</script>

<template>
  <div>
    <h1>Programs</h1>

    <ul
      v-if="programs?.length"
      class="program-list"
    >
      <li
        v-for="program in programs"
        :key="program._id"
      >
        <NuxtLink :to="`/${program.slug?.current}`">
          {{ program.title }}
        </NuxtLink>

        <p
          v-if="program.goal || program.duration"
          class="meta"
        >
          <span v-if="program.goal">{{ program.goal }}</span>
          <span v-if="program.goal && program.duration"> · </span>
          <span v-if="program.duration">{{ program.duration }} weeks</span>
        </p>
      </li>
    </ul>

    <p
      v-else
      class="empty"
    >
      No programs yet.
    </p>
  </div>
</template>

<style lang="scss" scoped>
.program-list {
  margin: 0;
  padding: 0;
  list-style: none;

  li + li {
    border-top: 1px solid var(--border);
  }

  li {
    padding-block: 0.875rem;
  }

  a {
    font-weight: 550;
  }
}

.meta {
  margin: 0.25rem 0 0;
  color: var(--muted);
  font-size: 0.875rem;
}

.empty {
  color: var(--muted);
}
</style>
