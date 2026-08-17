import {DocumentHandle} from '@sanity/sdk'
import {useDocument, useEditDocument} from '@sanity/sdk-react'
import {Box, Button, TextInput} from '@sanity/ui'

function isValidUrl(url: string) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function DemoVideoURL(props: DocumentHandle) {
  const {data: value} = useDocument<string>({
    ...props,
    path: 'demoVideoUrl',
  })
  const editDemoVideoURL = useEditDocument({
    ...props,
    path: 'demoVideoUrl',
  })

  const isValid = isValidUrl(value || '')

  return (
    <>
      <Box flex={1}>
        <TextInput
          type="url"
          placeholder="https://youtube.com/..."
          value={value || ''}
          onChange={(event) => editDemoVideoURL(event.currentTarget.value)}
        />
      </Box>
      {/* `disabled` is not a valid prop once Button renders as an anchor, so an
          unusable "Open" is rendered as a plain disabled button instead. */}
      {isValid ? (
        <Button
          as="a"
          href={value}
          target="_blank"
          rel="noreferrer"
          text="Open"
          tone="primary"
          mode="ghost"
        />
      ) : (
        <Button disabled text="Open" tone="primary" mode="ghost" />
      )}
    </>
  )
}
