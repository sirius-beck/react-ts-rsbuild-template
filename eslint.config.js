// @ts-check

import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginReactRecommended from 'eslint-plugin-react/configs/recommended.js'
import configPrettier from 'eslint-config-prettier'
import pluginPrettier from 'eslint-plugin-prettier'

export default tseslint.config(
  { languageOptions: { globals: { ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: ['tsconfig.json', 'tsconfig.node.json']
      }
    }
  },
  {
    files: ['**/*.{js,cjs,mjs}'],
    ...tseslint.configs.disableTypeChecked
  },
  Object.assign({}, pluginReactRecommended, {
    files: ['**/*.{tsx,jsx,cjsx,mjsx}'],
    languageOptions: {
      globals: { ...globals.browser },
      ecmaVersion: 'latest'
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: { 'react/no-string-refs': 'off' }
  }),
  configPrettier,
  {
    plugins: {
      prettier: pluginPrettier,
      '@typescript-eslint': tseslint.plugin
    },
    rules: {
      'prettier/prettier': 'error',
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off',
      '@typescript-eslint/no-unused-vars': 'warn'
    }
  }
)
