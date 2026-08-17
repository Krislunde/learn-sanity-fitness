<script setup lang="ts">
import { PROGRAMS_QUERY } from '~/sanity/queries'
import type { PROGRAMS_QUERY_RESULT } from '~/sanity/types'
import { FOCUS_LABELS } from '~/sanity/labels'

const { data: programs } = await useSanityQuery<PROGRAMS_QUERY_RESULT>(PROGRAMS_QUERY)
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
          v-if="program.focus || program.duration"
          class="meta"
        >
          <span v-if="program.focus">{{ FOCUS_LABELS[program.focus] || program.focus }}</span>
          <span v-if="program.focus && program.duration"> · </span>
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
