import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  app: {
    // The "Learn" organization this sandbox belongs to.
    organizationId: 'oIQaHkn4h',
    entry: './src/App.tsx',
  },
  server: {
    port: 3334,
  },
  // `deployment.appId` is written here by the CLI the first time you run
  // `pnpm --filter ./apps/coach run deploy`. It is intentionally absent until
  // then, so the first deploy creates a new app rather than overwriting one.
})
