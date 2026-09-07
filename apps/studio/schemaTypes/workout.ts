import {defineArrayMember, defineField, defineType} from 'sanity'
import {ClipboardIcon} from '@sanity/icons/Clipboard'

export const workout = defineType({
  name: 'workout',
  title: 'Workout',
  type: 'document',
  icon: ClipboardIcon,
  // The programs a workout belongs to are not stored here. Program.workouts is the
  // single source of truth; the reverse is resolved with a references() query and
  // surfaced in the Studio through the "Used in" view.
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
      name: 'exercises',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'exercise'}]})],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'estimatedDuration',
      title: 'Est. Duration',
      type: 'number',
      description: 'Approximate length in minutes.',
      validation: (rule) => rule.positive(),
    }),
    defineField({
      name: 'coach',
      type: 'reference',
      to: [{type: 'person'}],
    }),
  ],
  preview: {
    select: {title: 'title', duration: 'estimatedDuration'},
    prepare({title, duration}) {
      const parts = [typeof duration === 'number' ? `${duration} min` : null].filter(Boolean)

      return {title, subtitle: parts.join(' · ') || undefined}
    },
  },
})
