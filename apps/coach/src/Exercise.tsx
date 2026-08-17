import {Suspense} from 'react'
import {DocumentHandle} from '@sanity/sdk'
import {useDocumentProjection} from '@sanity/sdk-react'
import {Card, Flex, Grid, Stack, Text} from '@sanity/ui'
import {DemoVideoURL} from './DemoVideoURL'
import {Publish} from './Publish'

type ExerciseProjection = {
  name: string | null
  difficulty: string | null
}

export function Exercise(props: DocumentHandle) {
  const {data: exercise} = useDocumentProjection<ExerciseProjection>({
    ...props,
    projection: `{ name, difficulty }`,
  })

  return (
    <Card borderBottom paddingBottom={3}>
      <Grid columns={2} gap={2}>
        <Stack space={2}>
          <Text weight="medium">{exercise?.name || 'Untitled'}</Text>
          {exercise?.difficulty ? (
            <Text muted size={1}>
              {exercise.difficulty}
            </Text>
          ) : null}
        </Stack>
        <Flex gap={1}>
          <Suspense fallback="Loading...">
            <DemoVideoURL {...props} />
          </Suspense>
          <Suspense fallback="Loading...">
            <Publish {...props} />
          </Suspense>
        </Flex>
      </Grid>
    </Card>
  )
}
