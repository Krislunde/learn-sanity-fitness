import {defineField, defineType} from 'sanity'
import {TagIcon} from '@sanity/icons/Tag'

export const bodyRegion = defineType({
  name: 'bodyRegion',
  title: 'Body Region',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      description: 'Shoulders, back, chest, arms, core, legs, glutes, and so on.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 2,
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'description'},
  },
})
