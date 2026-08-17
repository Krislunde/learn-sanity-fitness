import {defineArrayMember, defineField, defineType} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'

export const article = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'steps',
      type: 'array',
      description: 'The article broken into ordered steps.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'step',
          title: 'Step',
          fields: [
            defineField({
              name: 'title',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'body',
              type: 'array',
              of: [defineArrayMember({type: 'block'}), defineArrayMember({type: 'callout'})],
            }),
          ],
          preview: {
            select: {title: 'title'},
          },
        }),
      ],
    }),
    defineField({
      name: 'coach',
      title: 'Author',
      type: 'reference',
      to: [{type: 'person'}],
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'coach.name'},
  },
})
