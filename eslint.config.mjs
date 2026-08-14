import { fixupConfigRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import { defineConfig } from 'eslint/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  {
    extends: fixupConfigRules(compat.extends('@react-native', 'prettier')),
    plugins: { prettier },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'prettier/prettier': 'error',
    },
  },
  {
    // Generated output and vendored dependencies. Native build directories hold
    // bundled third-party browser scripts that otherwise trip `no-undef`, and
    // they only exist after a local build - so linting them makes results differ
    // between a developer machine and a fresh CI checkout.
    ignores: [
      '**/node_modules/',
      'lib/',
      'coverage/',
      '.yarn/',
      '**/build/',
      '**/Pods/',
      '**/vendor/',
      '**/samples/',
      '**/user-workspace/',
    ],
  },
]);
