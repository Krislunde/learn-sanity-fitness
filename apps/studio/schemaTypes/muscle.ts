import {defineField, defineType} from 'sanity'
import {UserIcon} from '@sanity/icons/User'

export const muscle = defineType({
  name: 'muscle',
  title: 'Muscle',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'bodyRegion',
      title: 'Body Region',
      type: 'reference',
      to: [{type: 'bodyRegion'}],
    }),
    defineField({
      name: 'diagram',
      type: 'image',
      description: 'Illustration highlighting where this muscle sits.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'bodyRegion.name', media: 'diagram'},
  },
})
