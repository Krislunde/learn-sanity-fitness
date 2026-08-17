import {type SanityConfig} from '@sanity/sdk'
import {SanityApp} from '@sanity/sdk-react'
import {Flex, Spinner} from '@sanity/ui'
import {SanityUI} from './SanityUI'
import {Exercises} from './Exercises'

function App() {
  // apps can access many different projects or other sources of data
  const sanityConfigs: SanityConfig[] = [
    {
      projectId: 'w4np8kfp',
      dataset: 'production',
    },
  ]

  function Loading() {
    return (
      <Flex justify="center" align="center" style={{width: '100vw', height: '100vh'}}>
        <Spinner />
      </Flex>
    )
  }

  return (
    <SanityUI>
      <SanityApp config={sanityConfigs} fallback={<Loading />}>
        <Exercises />
      </SanityApp>
    </SanityUI>
  )
}

export default App
