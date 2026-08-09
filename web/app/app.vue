<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'Fitness'
const description = 'A fitness site powered by Sanity.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description
})
</script>

<template>
  <header class="site-header">
    <div class="wrap">
      <NuxtLink
        to="/"
        class="site-title"
      >
        Fitness
      </NuxtLink>

      <nav class="site-nav">
        <NuxtLink to="/posts">
          Posts
        </NuxtLink>
      </nav>
    </div>
  </header>

  <main class="site-main">
    <div class="wrap">
      <NuxtPage />
    </div>
  </main>

  <footer class="site-footer">
    <div class="wrap">
      <p>© {{ new Date().getFullYear() }} Fitness</p>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
@use "~/assets/scss/variables" as v;

.site-header {
  border-bottom: 1px solid var(--border);

  .wrap {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    min-height: v.$header-height;
  }
}

.site-title {
  color: var(--fg);
  font-size: 1rem;
  font-weight: 650;
}

.site-nav {
  display: flex;
  gap: 1rem;
}

.site-main {
  padding-block: 2rem 3rem;

  @include v.respond-to("sm") {
    padding-block: 2.5rem 4rem;
  }
}

.site-footer {
  border-top: 1px solid var(--border);
  color: var(--muted);
  font-size: 0.875rem;

  .wrap {
    padding-block: 1.25rem;
  }

  p {
    margin: 0;
  }
}
</style>
