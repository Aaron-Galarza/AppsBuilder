import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({
  baseDirectory: dirname,
});

const adminConfig = [
  // Ignora build dirs, notificación de Next.js
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'node_modules/**', '**/*.d.ts'],
  },
  ...compat.extends('next/core-web-vitals'),
  ...compat.extends('next/typescript'),
  ...compat.config({
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  }),
];

export default adminConfig;