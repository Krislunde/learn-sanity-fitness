<script setup lang="ts">
const query = groq`*[_type == "post" && defined(slug.current)] | order(_createdAt desc){ _id, title, slug }`
const { data: posts } = await useSanityQuery<Array<{ _id: string, title?: string, slug?: { current?: string } }>>(query)
</script>

<template>
  <UPage>
    <UPageHeader title="Posts" />

    <UPageBody>
      <ul>
        <li
          v-for="post in posts || []"
          :key="post._id"
        >
          <NuxtLink :to="`/${post.slug?.current}`">
            {{ post.title }}
          </NuxtLink>
        </li>
      </ul>
    </UPageBody>
  </UPage>
</template>
