import {defineField, defineType} from 'sanity'
import {UserIcon} from '@sanity/icons/User'

export const person = defineType({
  name: 'person',
  title: 'Person',
  type: 'document',
  icon: UserIcon,
  // A person is referenced by the role they play — Program, Workout and Article each
  // hold their own `coach` reference. Nothing is stored in the other direction; the
  // reverse is resolved with a references() query and shown in the "Credited on" view.
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'name'},
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
      name: 'bio',
      type: 'text',
      rows: 4,
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'bio', media: 'image'},
  },
})
