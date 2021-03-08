import * as esbuild from 'esbuild-wasm'
import axios from 'axios'
import localForage from 'localforage'

const fileCache = localForage.createInstance({
  name: 'filecache'
})

export const fetchPlugin = (entryFile: string) => ({
  name: 'fetch-plugin',
  setup(build: esbuild.PluginBuild) {
    build.onLoad({ filter: /^index\.js/ }, async (args: any) => ({
      loader: 'jsx',
      contents: entryFile
    }))

    build.onLoad({ filter: /.*/ }, async (args: any) => {
      const filePath = args.path

      const cachedLoadResult = await fileCache.getItem<esbuild.OnLoadResult>(
        filePath
      )

      if (cachedLoadResult) {
        return cachedLoadResult
      }
    })

    build.onLoad({ filter: /\.css$/ }, async (args: any) => {
      const filePath = args.path

      const { data: fileContents, request } = await axios.get(filePath)

      const processedCss = fileContents
        .replace(/\n/g, '')
        .replace(/"/g, '\\"')
        .replace(/'/g, "\\'")

      const contents = `
        const style = document.createElement('style')
        style.innerText = '${processedCss}'
        document.head.appendChild(style)
      `

      const result: esbuild.OnLoadResult = {
        loader: 'jsx',
        resolveDir: new URL('./', request.responseURL).pathname,
        contents
      }

      // set result in cache
      await fileCache.setItem(filePath, result)

      // return result
      return result
    })

    build.onLoad({ filter: /.*/ }, async (args: any) => {
      const filePath = args.path

      const { data: contents, request } = await axios.get(filePath)

      const result: esbuild.OnLoadResult = {
        loader: 'jsx',
        resolveDir: new URL('./', request.responseURL).pathname,
        contents
      }

      // set result in cache
      await fileCache.setItem(filePath, result)

      // return result
      return result
    })
  }
})
