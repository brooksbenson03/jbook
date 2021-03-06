import * as esbuild from 'esbuild-wasm'
import axios from 'axios'

export const unpkgPathPlugin = () => {
  return {
    name: 'unpkg-path-plugin',
    setup(build: esbuild.PluginBuild) {
      // filters are executed against file names
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        // executes first
        console.log('onResolve', args)
        if (args.path === 'index.js') {
          return { path: args.path, namespace: 'a' }
        }

        // relative file resolution
        if (args.path.includes('./') || args.path.includes('../')) {
          return {
            namespace: 'a',
            path: new URL(
              args.path,
              'https://unpkg.com' + args.resolveDir + '/'
            ).href
          }
        }

        return {
          namespace: 'a',
          path: `https://unpkg.com/${args.path}`
        }
      })

      build.onLoad({ filter: /.*/ }, async (args: any) => {
        // executes second
        console.log('onLoad', args)

        if (args.path === 'index.js') {
          // if contents contain an import, repeat steps onResolve, onLoad
          return {
            loader: 'jsx', // contents is the file contents
            contents: ` 
              const message = require('nested-test-pkg'); 
              console.log(message);
            `
          }
        }

        const { data, request } = await axios.get(args.path)

        return {
          loader: 'jsx',
          contents: data,
          resolveDir: new URL('./', request.responseURL).pathname
        }
      })
    }
  }
}
