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
        } else if (args.path === 'tiny-test-pkg') {
          return {
            path: 'https://unpkg.com/tiny-test-pkg@1.0.0/index.js',
            namespace: 'a'
          }
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
              const message = require('tiny-test-pkg'); 
              console.log(message);
            `
          }
        }

        const { data } = await axios.get(args.path)
        return {
          loader: 'jsx',
          contents: data
        }
      })
    }
  }
}
