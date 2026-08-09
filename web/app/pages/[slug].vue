<script setup lang="ts">
const route = useRoute()
const query = groq`*[_type == "post" && slug.current == $slug][0]{ _id, title, body }`
const { data: post } = await useSanityQuery<{ _id: string, title?: string, body?: Array<{ _type: string, [key: string]: unknown }> } | null>(
  query,
  { slug: route.params.slug }
)
</script>

<template>
  <UPage v-if="post">
    <UPageHeader :title="post.title" />

    <UPageBody>
      <SanityContent
        v-if="post.body"
        :value="post.body"
      />
    </UPageBody>
  </UPage>
</template>
