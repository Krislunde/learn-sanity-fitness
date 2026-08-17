import {defineField, defineType} from 'sanity'
import {TagIcon} from '@sanity/icons/Tag'

export const equipmentCategory = defineType({
  name: 'equipmentCategory',
  title: 'Equipment Category',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      description:
        'By type (free weights, machines, cables, resistance bands) or by function (cardio, strength, mobility, recovery).',
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
