import {defineArrayMember, defineField, defineType} from 'sanity'
import {CalendarIcon} from '@sanity/icons/Calendar'

export const program = defineType({
  name: 'program',
  title: 'Program',
  type: 'document',
  icon: CalendarIcon,
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
      name: 'goal',
      type: 'string',
      description: 'What this program is for, e.g. build strength, lose fat, improve mobility.',
    }),
    defineField({
      name: 'duration',
      type: 'number',
      description: 'Length in weeks.',
      validation: (rule) => rule.positive(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'workouts',
      type: 'array',
      description: 'Ordered list of workouts that make up this program.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'workout'}]})],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'coach',
      type: 'reference',
      to: [{type: 'person'}],
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'goal', media: 'coverImage'},
  },
})
