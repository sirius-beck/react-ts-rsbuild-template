import fs from 'node:fs'
import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'

const isDev = process.env.NODE_ENV === 'development'

function whenDev<V = any, F = any>(value: V, fallback: F): V | F
function whenDev<T = any>(value: T, fallback: T): T {
  return isDev ? value : fallback
}

const favicon = (() => {
  return [
    './public/favicon.ico',
    './public/favicon.png',
    './public/favicon.svg',
    './public/icon.ico',
    './public/icon.png',
    './public/icon.svg'
  ].find((icon) => fs.existsSync(icon))
})()

export default defineConfig({
  source: {
    entry: {
      index: './src/index.tsx'
    }
  },
  output: {
    // assetPrefix: isProd ? 'https://cdn.example.com/' : '',
    charset: 'utf8',
    copy: [
      {
        from: './public',
        to: '',
        noErrorOnMissing: true,
        globOptions: {
          ignore: ['**/index.html', favicon ?? '']
        }
      }
    ],
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
      }
    }),
    sourceMap: {
      js: whenDev('source-map', false),
      css: isDev
    }
  },
  html: {
    favicon,
    inject: 'body'
  },
  plugins: [pluginReact()]
})
