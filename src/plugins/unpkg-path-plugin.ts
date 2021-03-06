import * as esbuild from 'esbuild-wasm'
import axios from 'axios'
import localForage from 'localforage'

const fileCache = localForage.createInstance({
  name: 'filecache'
})

export const unpkgPathPlugin = (contents: string) => {
  return {
    name: 'unpkg-path-plugin',
    setup(build: esbuild.PluginBuild) {
      // handle root entry file of index.js
      build.onResolve({ filter: /^index\.js$/ }, (args: any) => {
        return { path: args.path, namespace: 'a' }
      })

      // handle relative paths of a module
      build.onResolve({ filter: /^\.+\// }, (args: any) => {
        return {
          namespace: 'a',
          path: new URL(args.path, 'https://unpkg.com' + args.resolveDir + '/')
            .href
        }
      })

      // handle main file of a module
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        return {
          namespace: 'a',
          path: `https://unpkg.com/${args.path}`
        }
      })

      build.onLoad({ filter: /.*/ }, async (args: any) => {
        if (args.path === 'index.js') {
          // if contents contain an import, repeat steps onResolve, onLoad
          return {
            loader: 'jsx', // contents is the file contents
            contents
          }
        }

        // get file from cache
        const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(
          args.path
        )

        // return file if present
        if (cachedResult) {
          return cachedResult
        }

        // make request for file
        const { data, request } = await axios.get(args.path)

        // build esbuild load result
        const result: esbuild.OnLoadResult = {
          loader: 'jsx',
          contents: data,
          resolveDir: new URL('./', request.responseURL).pathname
        }

        // set result in cache
        await fileCache.setItem(args.path, result)

        // return result
        return result
      })
    }
  }
}
