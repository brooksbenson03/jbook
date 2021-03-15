import 'bulmaswatch/superhero/bulmaswatch.min.css'
import { useState } from 'react'
import { CodeEditor } from './code-editor'
import Preview from './preview'
import bundle from '../bundler'
import Resizable from './resizable'

const CodeCell = () => {
  const [input, setInput] = useState<any>()
  const [code, setCode] = useState('')

  const onClick = async () => {
    const output = await bundle(input)
    setCode(output)
  }

  return (
    <Resizable dir="y">
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          height: '100%'
        }}
      >
        <CodeEditor
          initialValue="const a = 'a'"
          handleChange={(change) => setInput(change)}
        />
        <Preview code={code} />
      </div>
    </Resizable>
  )
}

export default CodeCell
