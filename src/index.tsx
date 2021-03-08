import * as esbuild from 'esbuild-wasm'
import ReactDOM from 'react-dom'
import { useState, useEffect, useRef } from 'react'
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin'
import { fetchPlugin } from './plugins/fetch-plugin'

const App = () => {
  const builder = useRef<any>()
  const [input, setInput] = useState<any>()
  const [code, setCode] = useState('')

  const createBuilder = async () => {
    builder.current = await esbuild.startService({
      worker: true,
      wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm'
    })
  }

  useEffect(() => {
    createBuilder()
  }, [])

  const onClick = async () => {
    if (!builder.current) return
    else {
      const res = await builder.current.build({
        entryPoints: ['index.js'],
        bundle: true,
        write: false,
        plugins: [unpkgPathPlugin(), fetchPlugin(input)],
        define: {
          'process.env.NODE_ENV': '"production"',
          global: 'window'
        }
      })
      const code = res.outputFiles[0].text
      setCode(code)
    }
  }

  return (
    <div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
      ></textarea>
      <div>
        <button onClick={onClick}>Submit</button>
      </div>
      <pre>{code}</pre>
      <iframe src="/test.html" sandbox=""></iframe>
    </div>
  )
}

ReactDOM.render(<App />, document.querySelector('#root'))
