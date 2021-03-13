import * as esbuild from 'esbuild-wasm'
import ReactDOM from 'react-dom'
import { useState, useEffect, useRef } from 'react'
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin'
import { fetchPlugin } from './plugins/fetch-plugin'

const App = () => {
  const builder = useRef<any>()
  const iframe = useRef<any>()
  const [input, setInput] = useState<any>()

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

    iframe.current.srcDoc = html

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

    iframe.current.contentWindow.postMessage(res.outputFiles[0].text, '*')
  }

  const html = `
    <html>
      <head></head>
      <body>
        <div id="root"></div>
        <script>
          const executeScript = event => {
            try {
              eval(event.data)
            } catch (e) {
              const root = document.querySelector('#root')
              root.innerHTML = '<div>' + e + '</div>'
            }
          }
          window.addEventListener('message', executeScript)
        </script>
      </body>
    </html>
  `

  return (
    <div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
      ></textarea>
      <div />
      <button onClick={onClick}>Submit</button>
      <iframe
        title="preview"
        ref={iframe}
        srcDoc={html}
        sandbox="allow-scripts"
      ></iframe>
    </div>
  )
}

ReactDOM.render(<App />, document.querySelector('#root'))
