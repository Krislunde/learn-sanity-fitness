import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
    dataset: process.env.SANITY_STUDIO_DATASET!,
  },

  // `sanity deploy` resolves the target hostname from here. Without it the CLI
  // fails with "No studio hostname configured" even when SANITY_STUDIO_HOSTNAME
  // is set in the environment.
  studioHost: process.env.SANITY_STUDIO_HOSTNAME!,

  deployment: {
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },

  server: {
    port: 3333,
  },

  // Types are generated from the deployed schema straight into the Nuxt app, so
  // the front end and the Studio cannot drift apart silently.
  typegen: {
    enabled: true,
    path: '../web/app/**/*.ts',
    schema: './schema.json',
    generates: '../web/app/sanity/types.ts',
  },
})
