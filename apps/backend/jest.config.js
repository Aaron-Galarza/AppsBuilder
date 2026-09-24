/**
 * Configuración de Jest para apps/backend.
 * Convierte TS con ts-jest (isolatedModules: type-check liviano), corre en Node,
 * y apunta a una base MongoDB de TEST dedicada (appsbuilder-test) vía setup-env.
 * maxWorkers=1: los archivos corren secuenciales (cada uno wipisa la base).
 */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        isolatedModules: true,
        tsconfig: {
          target: 'ES2020',
          module: 'CommonJS',
          moduleResolution: 'Node',
          esModuleInterop: true,
          strict: false,
          types: ['node', 'jest'],
          typeRoots: ['node_modules/@types', '../../node_modules/@types'],
        },
      },
    ],
  },
  setupFiles: ['<rootDir>/test/setup-env.ts'],
  clearMocks: true,
  maxWorkers: 1,
  testTimeout: 30000,
  verbose: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/server.ts', '!src/scripts/**'],
};