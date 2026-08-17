import {defineField, defineType} from 'sanity'
import {BlockquoteIcon} from '@sanity/icons/Blockquote'

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  icon: BlockquoteIcon,
  fields: [
    defineField({
      name: 'quote',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'person',
      type: 'string',
      description: 'Who said it.',
    }),
    defineField({
      name: 'result',
      type: 'string',
      description: 'The outcome they achieved, e.g. "Lost 8 kg in 12 weeks".',
    }),
  ],
  preview: {
    select: {title: 'quote', person: 'person', result: 'result'},
    prepare({title, person, result}) {
      return {
        title: title || 'Untitled testimonial',
        subtitle: [person, result].filter(Boolean).join(' · ') || undefined,
      }
    },
  },
})
