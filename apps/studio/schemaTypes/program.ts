import {defineArrayMember, defineField, defineType} from 'sanity'
import {CalendarIcon} from '@sanity/icons/Calendar'

// The focus values a program can take. Exported so the migration that moves
// documents off the old free-text `goal` field stays in step with the schema.
export const PROGRAM_FOCUS_OPTIONS = [
  {title: 'Strength', value: 'strength'},
  {title: 'Hypertrophy', value: 'hypertrophy'},
  {title: 'Fat loss', value: 'fat-loss'},
  {title: 'Endurance', value: 'endurance'},
  {title: 'Mobility', value: 'mobility'},
  {title: 'Foundations', value: 'foundations'},
] as const

export const PROGRAM_FOCUS_LABELS: Record<string, string> = Object.fromEntries(
  PROGRAM_FOCUS_OPTIONS.map(({value, title}) => [value, title]),
)

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
    // Superseded by `focus`. Free text meant every program described its purpose
    // differently ("Build a strength base" vs "Lose fat"), so the value could not
    // be filtered or grouped on. Kept in code, hidden from editors, until the
    // migration has run everywhere and the field can be deleted outright.
    defineField({
      name: 'goal',
      type: 'string',
      deprecated: {
        reason: 'Use the "Focus" field instead.',
      },
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'focus',
      type: 'string',
      description: 'What this program is for. Drives filtering on the front end.',
      options: {
        list: PROGRAM_FOCUS_OPTIONS.map(({title, value}) => ({title, value})),
        layout: 'radio',
      },
      // Required, but at warning level: programs whose old free-text goal could
      // not be classified automatically still need a human to pick a value. That
      // nudge belongs in the Studio, not in a red CI run.
      validation: (rule) =>
        rule.required().warning('Pick a focus so this program can be filtered.'),
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
    // Written once by the `first-published` Sanity Function, never by an editor.
    defineField({
      name: 'firstPublished',
      title: 'First published',
      description: 'Automatically set the first time this program is published.',
      type: 'datetime',
      readOnly: true,
    }),
  ],
  preview: {
    select: {title: 'title', focus: 'focus', media: 'coverImage'},
    prepare({title, focus, media}: {title?: string; focus?: string; media?: unknown}) {
      return {
        title,
        subtitle: focus ? PROGRAM_FOCUS_LABELS[focus] || focus : undefined,
        media: media as never,
      }
    },
  },
})
