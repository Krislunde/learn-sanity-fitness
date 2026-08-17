import {useDocuments} from '@sanity/sdk-react'
import {Container, Heading, Stack, Text} from '@sanity/ui'
import {Suspense} from 'react'
import {Exercise} from './Exercise'

export function Exercises() {
  const {data: exercises} = useDocuments({
    documentType: 'exercise',
  })

  return (
    <Container width={2}>
      <Stack space={4} padding={4}>
        <Heading as="h1">Demo videos</Heading>
        <Text muted size={1}>
          Every exercise in the library. Paste a demo video URL and publish without opening the
          Studio.
        </Text>
        <Stack space={3}>
          {exercises?.map((exercise) => (
            <Suspense key={exercise.documentId} fallback={<Text>Loading...</Text>}>
              <Exercise key={exercise.documentId} {...exercise} />
            </Suspense>
          ))}
        </Stack>
      </Stack>
    </Container>
  )
}
