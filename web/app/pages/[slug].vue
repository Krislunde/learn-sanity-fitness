<script setup lang="ts">
const route = useRoute()
const query = groq`*[_type == "post" && slug.current == $slug][0]{ _id, title, body }`
const { data: post } = await useSanityQuery<{ _id: string, title?: string, body?: Array<{ _type: string, [key: string]: unknown }> } | null>(
  query,
  { slug: route.params.slug }
)

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found', fatal: true })
}
</script>

<template>
  <article v-if="post">
    <h1>{{ post.title }}</h1>

    <SanityContent
      v-if="post.body"
      :value="post.body"
      class="prose"
    />
  </article>
</template>
