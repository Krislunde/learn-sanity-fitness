<script setup lang="ts">
const query = groq`*[_type == "post" && defined(slug.current)] | order(_createdAt desc){ _id, title, slug }`
const { data: posts } = await useSanityQuery<Array<{ _id: string, title?: string, slug?: { current?: string } }>>(query)
</script>

<template>
  <div>
    <h1>Posts</h1>

    <ul
      v-if="posts?.length"
      class="post-list"
    >
      <li
        v-for="post in posts"
        :key="post._id"
      >
        <NuxtLink :to="`/${post.slug?.current}`">
          {{ post.title }}
        </NuxtLink>
      </li>
    </ul>

    <p
      v-else
      class="empty"
    >
      No posts yet.
    </p>
  </div>
</template>

<style lang="scss" scoped>
.post-list {
  margin: 0;
  padding: 0;
  list-style: none;

  li + li {
    border-top: 1px solid var(--border);
  }

  a {
    display: block;
    padding-block: 0.875rem;
    font-weight: 550;
  }
}

.empty {
  color: var(--muted);
}
</style>
