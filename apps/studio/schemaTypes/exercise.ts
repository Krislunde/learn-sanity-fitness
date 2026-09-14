import {defineArrayMember, defineField, defineType} from 'sanity'
import {ActivityIcon} from '@sanity/icons/Activity'

export const exercise = defineType({
  name: 'exercise',
  title: 'Exercise',
  type: 'document',
  icon: ActivityIcon,
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
      name: 'instructions',
      type: 'array',
      description: 'How to perform the movement, step by step.',
      of: [defineArrayMember({type: 'block'}), defineArrayMember({type: 'callout'})],
    }),
    defineField({
      name: 'demoImage',
      title: 'Demo Image',
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
      name: 'demoVideoUrl',
      title: 'Demo Video URL',
      type: 'url',
      description:
        'Link to a hosted video (YouTube, Vimeo, Mux). Video is not uploaded to Sanity — file assets have no transcoding or adaptive streaming.',
      validation: (rule) => rule.uri({scheme: ['http', 'https']}),
    }),
    defineField({
      name: 'muscles',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'muscle'}]})],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'equipment',
      type: 'reference',
      to: [{type: 'equipment'}],
    }),
    defineField({
      name: 'difficulty',
      type: 'string',
      options: {
        list: [
          {title: 'Beginner', value: 'beginner'},
          {title: 'Intermediate', value: 'intermediate'},
          {title: 'Advanced', value: 'advanced'},
        ],
        layout: 'radio',
      },
    }),
    // Written by the `complete-muscles` Sanity Function, never by an editor. Set on
    // every outcome, including when the model declines to suggest anything, so each
    // exercise is considered exactly once — the event filter excludes it afterwards.
    defineField({
      name: 'musclesSuggestedAt',
      title: 'Muscles suggested',
      description: 'Automatically set when the muscle tagging was last considered.',
      type: 'datetime',
      readOnly: true,
    }),
    // Written by the `complete-muscles` Sanity Function alongside a suggestion, so the
    // editor reviewing the unpublished changes can see why these muscles were proposed.
    defineField({
      name: 'musclesSuggestionNote',
      title: 'Muscle suggestion note',
      description: 'Why these muscles were proposed.',
      type: 'string',
      readOnly: true,
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'difficulty', media: 'demoImage'},
  },
})
