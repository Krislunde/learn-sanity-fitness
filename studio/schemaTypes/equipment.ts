import {defineField, defineType} from 'sanity'
import {PackageIcon} from '@sanity/icons/Package'

export const equipment = defineType({
  name: 'equipment',
  title: 'Equipment',
  type: 'document',
  icon: PackageIcon,
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
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
      name: 'category',
      type: 'reference',
      to: [{type: 'equipmentCategory'}],
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'category.name', media: 'image'},
  },
})
