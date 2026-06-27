import nextVitals from 'eslint-config-next/core-web-vitals'

const eslintConfig = [
  ...nextVitals,
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'public/media/**',
      'drizzle/**',
      'next-env.d.ts',
      'tsconfig.tsbuildinfo',
    ],
  },
]

export default eslintConfig
