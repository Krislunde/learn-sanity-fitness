import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { LinkIcon } from '@sanity/icons/Link'
import { schemaTypes } from './schemaTypes'
import { createUsedInView } from './components/UsedIn'

// Reverse relationships are derived, not stored. These views let editors see where a
// document has been used without anyone maintaining a second list by hand.
const usedInViews: Record<string, { title: string; types: string[]; emptyText: string }> = {
	workout: {
		title: 'Used in',
		types: ['program'],
		emptyText: 'This workout has not been added to any program yet.',
	},
	exercise: {
		title: 'Used in',
		types: ['workout'],
		emptyText: 'This exercise has not been added to any workout yet.',
	},
	person: {
		title: 'Credited on',
		types: ['program', 'workout', 'article'],
		emptyText: 'Nothing credits this person yet.',
	},
	muscle: {
		title: 'Worked by',
		types: ['exercise'],
		emptyText: 'No exercises target this muscle yet.',
	},
	equipment: {
		title: 'Used in',
		types: ['exercise'],
		emptyText: 'No exercises use this equipment yet.',
	},
}

export default defineConfig({
	name: 'default',
	title: 'Fitness',

	projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
	dataset: process.env.SANITY_STUDIO_DATASET!,

	studioHost: process.env.SANITY_STUDIO_HOSTNAME!,


	deployment: {
		appId: process.env.SANITY_STUDIO_APP_ID,
	},

	plugins: [
		structureTool({
			defaultDocumentNode: (S, { schemaType }) => {
				const config = usedInViews[schemaType as string]

				if (!config) return S.document().views([S.view.form()])

				return S.document().views([
					S.view.form(),
					S.view
						.component(createUsedInView({ types: config.types, emptyText: config.emptyText }))
						.title(config.title)
						.icon(LinkIcon),
				])
			},
		}),
		visionTool(),
	],

	schema: {
		types: schemaTypes,
	},
})
