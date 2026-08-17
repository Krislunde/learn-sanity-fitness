# Coach

A Sanity App SDK application that sits alongside the Studio, built while following the
[App SDK docs](https://www.sanity.io/docs/app-sdk).

It is a single-purpose desk for one chore the Studio makes slower than it needs to be: filling in
demo video URLs for exercises. It lists every `exercise` document, lets you paste a URL straight
into the row, open it to check it, and publish — without opening the Studio.

## Running it

```bash
pnpm --filter ./apps/coach run dev
```

## Deploying it

```bash
pnpm --filter ./apps/coach run deploy
```

The first deploy creates the app in the `Learn` organization and writes `deployment.appId` into
`sanity.cli.ts`. Commit that change so later deploys update the same app instead of creating
another one.

## How it works

| File | Role |
| --- | --- |
| `src/App.tsx` | Entry point. Declares which project and dataset the app reads. |
| `src/Exercises.tsx` | `useDocuments` to list every exercise. |
| `src/Exercise.tsx` | `useDocumentProjection` for the name and difficulty of one row. |
| `src/DemoVideoURL.tsx` | `useDocument` + `useEditDocument` to read and write one field. |
| `src/Publish.tsx` | `useApplyDocumentActions` + `publishDocument` to publish a draft. |

Data hooks suspend while loading, so each row renders inside a `<Suspense>` boundary.
