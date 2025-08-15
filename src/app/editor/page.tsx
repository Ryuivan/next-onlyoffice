import { getOnlyOfficeConfig } from './actions'
import Editor from './components/Editor'

interface EditorPageProps {
  searchParams: Promise<{
    name: string
  }>
}

const EditorPage = async ({ searchParams }: EditorPageProps) => {
  const { name } = await searchParams

  const config = await getOnlyOfficeConfig(decodeURIComponent(name))

  return <Editor config={config} />
}

export default EditorPage