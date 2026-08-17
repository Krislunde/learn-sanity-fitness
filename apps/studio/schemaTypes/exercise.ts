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
  ],
  preview: {
    select: {title: 'name', subtitle: 'difficulty', media: 'demoImage'},
  },
})
