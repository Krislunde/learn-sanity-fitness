import {useEffect, useState} from 'react'
import {useClient} from 'sanity'
import {IntentLink} from 'sanity/router'
import {Box, Card, Spinner, Stack, Text} from '@sanity/ui'

const API_VERSION = '2026-08-09'

// Incoming references are resolved at read time rather than stored on both documents,
// so this list can never drift out of sync with the owning document.
const INCOMING_QUERY = `
  *[
    !(_id in path("drafts.**"))
    && _type in $types
    && references($id)
  ]{ _id, _type, "title": coalesce(title, name) } | order(_type asc, title asc)
`

type IncomingDoc = {
  _id: string
  _type: string
  title: string | null
}

type UsedInViewProps = {
  documentId: string
}

export function createUsedInView(options: {types: string[]; emptyText: string}) {
  function UsedInView({documentId}: UsedInViewProps) {
    const client = useClient({apiVersion: API_VERSION})
    const [docs, setDocs] = useState<IncomingDoc[] | null>(null)
    const [error, setError] = useState<string | null>(null)

    const publishedId = documentId.replace(/^drafts\./, '')

    useEffect(() => {
      let cancelled = false

      setDocs(null)
      setError(null)

      client
        .fetch<IncomingDoc[]>(INCOMING_QUERY, {id: publishedId, types: options.types})
        .then((result) => {
          if (!cancelled) setDocs(result)
        })
        .catch((err: unknown) => {
          if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load')
        })

      return () => {
        cancelled = true
      }
    }, [client, publishedId])

    if (error) {
      return (
        <Box padding={4}>
          <Text size={1} muted>
            Could not load references: {error}
          </Text>
        </Box>
      )
    }

    if (docs === null) {
      return (
        <Box padding={4}>
          <Spinner muted />
        </Box>
      )
    }

    if (docs.length === 0) {
      return (
        <Box padding={4}>
          <Text size={1} muted>
            {options.emptyText}
          </Text>
        </Box>
      )
    }

    return (
      <Box padding={4}>
        <Stack space={2}>
          {docs.map((doc) => (
            <Card key={doc._id} padding={3} radius={2} shadow={1}>
              <IntentLink intent="edit" params={{id: doc._id, type: doc._type}}>
                <Text size={2}>{doc.title || 'Untitled'}</Text>
              </IntentLink>
              <Box marginTop={2}>
                <Text size={1} muted>
                  {doc._type}
                </Text>
              </Box>
            </Card>
          ))}
        </Stack>
      </Box>
    )
  }

  return UsedInView
}
