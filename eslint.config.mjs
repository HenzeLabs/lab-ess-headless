import next from 'eslint-config-next';

export default [
  // Next.js recommended + Core Web Vitals, flat-config ready
  ...next(),
  // Your overrides (optional)
  {
    ignores: ['.next/**', 'node_modules/**'],
    rules: {
      // example: turn off require() rule if you need CJS in next.config
      // '@typescript-eslint/no-require-imports': 'off',
    },
  },
];
