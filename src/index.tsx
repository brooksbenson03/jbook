import 'bulmaswatch/superhero/bulmaswatch.min.css'
import ReactDOM from 'react-dom'
import { useState } from 'react'
import { CodeEditor } from './components/code-editor'
import Preview from './components/preview'
import bundle from './bundler'

const App = () => {
  const [input, setInput] = useState<any>()
  const [code, setCode] = useState('')

  const onClick = async () => {
    const output = await bundle(input)
    setCode(output)
  }

  return (
    <div>
      <CodeEditor
        initialValue="const a = 'a'"
        handleChange={(change) => setInput(change)}
      />
      <button onClick={onClick}>Submit</button>
      <Preview code={code} />
    </div>
  )
}

ReactDOM.render(<App />, document.querySelector('#root'))
