import fs from 'node:fs'
import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import { pluginImageCompress } from '@rsbuild/plugin-image-compress'
import { generateRoutes } from './scripts/generateRoutes.js'

await generateRoutes()

const isDev = process.env.NODE_ENV === 'development'

function whenDev<V = any, F = any>(value: V, fallback: F): V | F
function whenDev<T = any>(value: T, fallback: T): T {
  return isDev ? value : fallback
}

export default defineConfig({
  source: {
    entry: {
      index: './src/index.tsx'
    }
  },
  output: {
    // assetPrefix: whenDev('', 'https://cdn.example.com/assets/'),
    charset: 'utf8',
    distPath: whenDev(
      {
        root: '.build',
        html: '/',
        js: 'static/js',
        jsAsync: 'static/js/async',
        css: 'static/styles',
        cssAsync: 'static/styles/async',
        svg: 'static/svg',
        font: 'static/font',
        wasm: 'static/wasm',
        image: 'static/image',
        media: 'static/media',
        server: 'server',
        worker: 'worker'
      },
      {
        root: '.build',
        html: '/',
        js: '[hash:16]',
        jsAsync: '[hash:16]',
        css: '[hash:16]',
        cssAsync: '[hash:16]',
        svg: '[hash:16]',
        font: '[hash:16]',
        wasm: '[hash:16]',
        image: '[hash:16]',
        media: '[hash:16]',
        server: '[hash:16]',
        worker: '[hash:16]'
      }
    ),
    filename: whenDev(
      {},
      {
        js: '[contenthash:16].js',
        css: '[contenthash:16].css',
        svg: '[contenthash:16].svg',
        font: '[contenthash:16][ext]',
        image: '[contenthash:16][ext]',
        media: '[contenthash:16][ext]'
      }
    ),
    minify: whenDev(false, {
      jsOptions: {
        compress: {
          arguments: true,
          drop_console: true
        },
        format: {
          comments: false
        },
        mangle: true
      },
      htmlOptions: {
        removeComments: true
      }
    }),
    sourceMap: {
      js: whenDev('source-map', false),
      css: isDev
    }
  },
  html: {
    favicon() {
      return [
        './public/favicon.ico',
        './public/favicon.png',
        './public/favicon.svg',
        './public/icon.ico',
        './public/icon.png',
        './public/icon.svg'
      ].find((icon) => fs.existsSync(icon))
    },
    inject: 'body',
    template({ value, entryName }) {
      const template = [
        `./public/${entryName}.html`,
        './public/index.html'
      ].find((file) => fs.existsSync(file))
      return template ?? value
    },
    title: 'React App'
  },
  server: {
    publicDir: {
      name: 'public',
      copyOnBuild: true
    }
  },
  performance: {
    bundleAnalyze: whenDev({}, undefined),
    chunkSplit: {
      /** For targets without HTTP/2 support, change the strategy. See https://rsbuild.dev/guide/optimization/split-chunk */
      strategy: 'split-by-module'
    }
  },
  plugins: [
    pluginReact(),
    whenDev(
      undefined,
      ...[
        pluginImageCompress([
          { use: 'jpeg', test: /\.(?:jpg|jpeg|jpe)$/ },
          'pngLossless',
          'ico'
        ])
      ]
    )
  ]
})
