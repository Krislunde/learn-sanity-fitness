import {defineField, defineType} from 'sanity'
import {WarningOutlineIcon} from '@sanity/icons/WarningOutline'

// A custom Portable Text block: an editor writing exercise instructions or an
// article step can insert one of these alongside plain paragraphs to flag a tip,
// a caution, or a safety note. Registered once here and reused from both
// exercise.instructions and article.steps[].body — see those files' `of` arrays.
export const callout = defineType({
  name: 'callout',
  title: 'Callout',
  type: 'object',
  icon: WarningOutlineIcon,
  fields: [
    defineField({
      name: 'tone',
      type: 'string',
      options: {
        list: [
          {title: 'Tip', value: 'tip'},
          {title: 'Caution', value: 'caution'},
          {title: 'Safety', value: 'safety'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'text',
      type: 'text',
      rows: 2,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {tone: 'tone', text: 'text'},
    prepare({tone, text}: {tone?: string; text?: string}) {
      const labels: Record<string, string> = {tip: 'Tip', caution: 'Caution', safety: 'Safety'}
      const label = (tone && labels[tone]) || 'Callout'
      return {title: `${label}: ${text || ''}`}
    },
  },
})
