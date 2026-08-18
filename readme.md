# Fitness Content Operations

Applications developed while following courses on [sanity.io/learn](https://www.sanity.io/learn).

A pnpm workspace holding three applications plus one serverless function, all reading and writing
the same Content Lake (project `w4np8kfp`).

| Path                        | What it is                                                            |
| --------------------------- | --------------------------------------------------------------------- |
| `apps/studio`               | The Sanity Studio. Schema, migrations, and CLI scripts.               |
| `apps/web`                  | Nuxt 4 front end, typed from the Studio schema by Sanity TypeGen.     |
| `apps/coach`                | App SDK application — a demo-video desk that runs outside the Studio. |
| `functions/first-published` | Sanity Function stamping `firstPublished` on programs.                |
| `sanity.blueprint.ts`       | Declares which functions deploy and what events trigger them.         |

## Getting started

```bash
pnpm install
```

Then run everything, or one app at a time:

```bash
pnpm dev                                # all apps in parallel
pnpm --filter ./apps/studio run dev     # Studio on :3333
pnpm --filter ./apps/web run dev        # Nuxt on :3000
pnpm --filter ./apps/coach run dev      # App SDK app
```

`apps/studio/.env` holds the project ID, dataset, and Studio hostname and is source controlled —
see `.env.example`. The Nuxt app needs its own `apps/web/.env`, which is not source controlled:

```
NUXT_PUBLIC_SANITY_PROJECT_ID="w4np8kfp"
NUXT_PUBLIC_SANITY_DATASET="production"
```

## Types

The Studio owns the schema, so it also generates the front end's types:

```bash
pnpm --filter ./apps/studio run typegen
```

That extracts `apps/studio/schema.json` and writes `apps/web/app/sanity/types.ts` with a result type
per query in `apps/web/app/sanity/queries.ts`. Queries live in that one `.ts` file rather than inline
in pages precisely so TypeGen can find them. Re-run it after any schema or query change.

## Scripts

`instructions.ts` calls an Agent Action to draft step-by-step instructions for an exercise that has
none yet.

## Functions

`first-published` stamps `firstPublished` the first time a program is published. Before the first
deploy, initialise a blueprint stack:

```bash
npx sanity blueprints init
npx sanity blueprints deploy
```

Test it against a real document without writing anything:

```bash
npx sanity functions test first-published --document-id <program-id>
```

## CI

Two workflows:

- **CI** — typecheck, lint, Studio schema validation, and dataset validation. Dataset validation runs
  only for `main`, since it checks real content.
- **Deploy Sanity Studio** — deploys the Studio per branch: `main` to production, `development` to
  `fit-development`, and every pull request to its own `fit-pr-<n>` preview, torn down on close.
