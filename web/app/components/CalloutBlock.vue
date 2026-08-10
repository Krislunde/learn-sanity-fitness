<script setup lang="ts">
// Props match @portabletext/vue's PortableTextComponentProps contract so this
// component can be registered under :components="{ types: { callout: CalloutBlock } }".
// Only `value` is used; the rest are declared just wide enough (not imported from
// @portabletext/vue — it's a transitive dep of @nuxtjs/sanity, not installed directly)
// so this component's prop types remain a valid, assignable superset.
defineProps<{
  value: {
    tone?: string
    text?: string
  }
  index: number
  isInline: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- must structurally match the library's NodeRenderer signature
  renderNode: (...args: any[]) => any
}>()

const TONE_LABELS: Record<string, string> = {
  tip: 'Tip',
  caution: 'Caution',
  safety: 'Safety'
}
</script>

<template>
  <aside
    class="callout"
    :class="`callout--${value.tone}`"
  >
    <span class="callout__label">{{ TONE_LABELS[value.tone || ''] || 'Note' }}</span>
    <p class="callout__text">
      {{ value.text }}
    </p>
  </aside>
</template>

<style lang="scss" scoped>
.callout {
  margin: 1.25rem 0;
  padding: 0.875rem 1rem;
  border: 1px solid var(--border);
  border-left: 3px solid var(--muted);
  border-radius: 0.25rem;
}

.callout--tip {
  border-left-color: var(--accent);
}

.callout--caution,
.callout--safety {
  border-left-color: #d97706;
}

.callout__label {
  display: block;
  margin-bottom: 0.25rem;
  color: var(--muted);
  font-size: 0.75rem;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.callout__text {
  margin: 0;
}
</style>
