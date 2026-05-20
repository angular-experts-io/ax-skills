import boundaries from 'eslint-plugin-boundaries';
import { defineConfig } from 'eslint/config';

// Angular CLI polyrepo version: supports multiple applications and libraries
// under projects/. For a single-app src/app workspace, simplify the patterns
// and omit basePattern/baseCapture where the app namespace is not needed.
export default defineConfig({
  files: ['**/*.ts'],
  ignores: [],
  plugins: { boundaries },
  extends: [
    boundaries.configs.strict,
  ],
  rules: {
    'boundaries/element-types': [
      'error',
      {
        default: 'disallow',
        rules: [
          {
            from: 'main',
            allow: [['app', { app: '${from.app}' }]],
          },
          {
            from: 'core',
            allow: [
              ['lib-api'],
              ['env', { app: '${from.app}' }],
              ['core', { app: '${from.app}' }],
              ['events', { app: '${from.app}' }],
            ],
          },
          {
            from: 'ui',
            allow: [
              ['lib-api'],
              ['env', { app: '${from.app}' }],
              ['ui', { app: '${from.app}' }],
            ],
          },
          {
            from: 'layout',
            allow: [
              ['lib-api'],
              ['env', { app: '${from.app}' }],
              ['core', { app: '${from.app}' }],
              ['ui', { app: '${from.app}' }],
              ['pattern', { app: '${from.app}' }],
              ['layout', { app: '${from.app}' }],
              ['events', { app: '${from.app}' }],
            ],
          },
          {
            from: 'app',
            allow: [
              ['lib-api'],
              ['env', { app: '${from.app}' }],
              ['app', { app: '${from.app}' }],
              ['core', { app: '${from.app}' }],
              ['layout', { app: '${from.app}' }],
              ['feature-routes', { app: '${from.app}' }],
            ],
          },
          {
            from: ['pattern'],
            allow: [
              ['lib-api'],
              ['env', { app: '${from.app}' }],
              ['core', { app: '${from.app}' }],
              ['ui', { app: '${from.app}' }],
              ['pattern', { app: '${from.app}' }],
              ['events', { app: '${from.app}' }],
            ],
          },
          {
            from: ['feature'],
            allow: [
              ['lib-api'],
              ['env', { app: '${from.app}' }],
              ['core', { app: '${from.app}' }],
              ['ui', { app: '${from.app}' }],
              ['pattern', { app: '${from.app}' }],
              ['feature', { app: '${from.app}', feature: '${from.feature}' }],
              ['events', { app: '${from.app}' }],
            ],
          },
          {
            from: ['feature-routes'],
            allow: [
              ['lib-api'],
              ['env', { app: '${from.app}' }],
              ['core', { app: '${from.app}' }],
              ['pattern', { app: '${from.app}' }],
              ['feature', { app: '${from.app}', feature: '${from.feature}' }],
              [
                'feature-routes',
                { app: '${from.app}', feature: '!${from.feature}' },
              ],
            ],
          },
          {
            from: ['lib-api'],
            allow: [['lib', { app: '${from.lib}' }]],
          },
          {
            from: ['lib'],
            allow: [['lib', { app: '${from.lib}' }]],
          },
        ],
      },
    ],
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
    'boundaries/ignore': [],
    'boundaries/dependency-nodes': ['import', 'dynamic-import'],
    'boundaries/elements': [
      {
        type: 'env',
        pattern: 'environments',
        basePattern: 'projects/**/src',
        baseCapture: ['app'],
      },
      {
        type: 'main',
        mode: 'file',
        pattern: 'main.ts',
        basePattern: 'projects/**/src',
        baseCapture: ['app'],
      },
      {
        type: 'app',
        mode: 'file',
        pattern: 'app?(-|.)*.ts',
        basePattern: 'projects/**/src/app',
        baseCapture: ['app'],
      },
      {
        type: 'core',
        pattern: 'core',
        basePattern: 'projects/**/src/app',
        baseCapture: ['app'],
      },
      {
        type: 'ui',
        pattern: 'ui',
        basePattern: 'projects/**/src/app',
        baseCapture: ['app'],
      },
      {
        type: 'layout',
        pattern: 'layout',
        basePattern: 'projects/**/src/app',
        baseCapture: ['app'],
      },
      {
        type: 'pattern',
        pattern: 'pattern',
        basePattern: 'projects/**/src/app',
        baseCapture: ['app'],
      },
      {
        type: 'events',
        mode: 'file',
        pattern: '**/*.events.ts',
        basePattern: 'projects/**/src/app',
        baseCapture: ['app'],
      },
      {
        type: 'feature-routes',
        mode: 'file',
        pattern: 'feature/*/*.routes.ts',
        capture: ['feature'],
        basePattern: 'projects/**/src/app',
        baseCapture: ['app'],
      },
      {
        type: 'feature',
        pattern: 'feature/*',
        capture: ['feature'],
        basePattern: 'projects/**/src/app',
        baseCapture: ['app'],
      },
      {
        type: 'lib-api',
        mode: 'file',
        pattern: 'projects/**/src/public-api.ts',
        capture: ['lib'],
      },
      {
        type: 'lib',
        pattern: 'projects/**/src/lib',
        capture: ['lib'],
      },
    ],
  },
});
