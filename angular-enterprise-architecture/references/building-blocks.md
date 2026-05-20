# Architecture Building Blocks

Use `architecture building block` for the concept, `folder` for its implementation location, and `ESLint boundary type` for the matching enforcement entry.

Use this table as the standard format for folder placement and dependency decisions.

| Building Block | Folder / File Pattern | Purpose | Contents | May Consume | Must Not |
| --- | --- | --- | --- | --- | --- |
| `main` | `projects/<app>/src/main.ts` | Bootstrap only. | `bootstrapApplication(AppComponent, appConfig)`. | `app` of same app. | Business logic or provider composition. |
| `app` | `projects/<app>/src/app/app*.ts` | Eager shell wiring. | `app.component`, `app.config`, `app.routes`; root app config delegates to `provideCore({ routes })`. | same app `core`, `layout`, first-level `feature-routes`. | Feature implementation or direct root provider composition outside `provideCore()`. |
| `core` | `projects/<app>/src/app/core/` | Eager root-injector logic. | `provideCore(coreOptions)`, global providers, router registration, guards, interceptors, root state, services, utilities. | `core`, `events`, `env`, external libs. | Components, directives, pipes, feature imports. |
| `layout` | `projects/<app>/src/app/layout/` | Eager visual frame around routed features. | Layout components, layout-only directives/pipes. | `core`, `ui`, rare `pattern`, `events`, `env`. | Feature implementation. |
| `ui` | `projects/<app>/src/app/ui/` | Generic reusable template-context building blocks. | Standalone components, directives, pipes with inputs/outputs only. | `ui`, `env`, external libs. | Services, stores, selectors, `core`, `feature`, `pattern`. |
| `feature` | `projects/<app>/src/app/feature/<name>/` | Isolated lazy business flow. | Routes, containers, UI local to the feature, services, state, lazy sub-features. | `core`, `ui`, `pattern`, same feature, `events`, `env`. | Sibling feature implementation. |
| `feature-routes` | `feature/<name>/*.routes.ts` | Lazy routing API for a feature. | Route config and lazy sub-route wiring. | Same feature implementation, `core`, `pattern`, other feature route configs. | Other feature implementation files. |
| `pattern` | `projects/<app>/src/app/pattern/<name>/` | Reusable drop-in non-routed business feature. | Root drop-in component, pattern UI, services, state slices, effects. | `core`, `ui`, `pattern`, `events`, `env`. | Feature implementation. |
| `events` | `projects/<app>/src/app/**/*.events.ts` | Public write API events. | Event/action definitions. | Usually nothing app-specific. | Implementation imports. |
| `env` | `projects/<app>/src/environments/` | Build-time environment values. | Environment constants. | Nothing app-specific. | Runtime app logic. |
| `lib-api` | `projects/<lib>/src/public-api.ts` | Public API of an Angular library. | Exports only. | Own `lib`. | App internals. |
| `lib` | `projects/<lib>/src/lib/` | Library implementation. | Library-specific implementation. | Own `lib`. | App internals or other library internals unless explicitly allowed. |

## Dependency Matrix

Use this as the quick dependency allow-list. The ESLint config is the executable version.

| From | Allowed Dependencies |
| --- | --- |
| `main` | `app` of same app |
| `app` | `app`, `core`, `layout`, `feature-routes`, `env`, `lib-api` |
| `core` | `core`, `events`, `env`, `lib-api` |
| `layout` | `layout`, `core`, `ui`, rare `pattern`, `events`, `env`, `lib-api` |
| `ui` | `ui`, `env`, `lib-api` |
| `feature` | same feature, `core`, `ui`, `pattern`, `events`, `env`, `lib-api` |
| `feature-routes` | same feature implementation, other `feature-routes`, `core`, `pattern`, `env`, `lib-api` |
| `pattern` | `pattern`, `core`, `ui`, `events`, `env`, `lib-api` |
| `events` | no app implementation dependencies by default |
| `env` | no app implementation dependencies |
| `lib-api` | own `lib` |
| `lib` | own `lib` |

## Workspace Shapes

The provided ESLint boundary config targets an Angular CLI polyrepo with multiple apps and libraries under `projects/`. This is why most matchers use `basePattern` and capture the current `app` or `lib`.

For a single-app workspace using `src/app`, simplify the matchers to the local folder structure. In many cases `basePattern` and `baseCapture` can be omitted because there is only one app namespace to protect.

## Eager Blocks

Keep `core/` headless. Use `provideCore()` as the single place for application-wide providers and startup logic. Register Angular providers, third-party infrastructure providers, root state, and `ENVIRONMENT_INITIALIZER` there.

Root app config, whether it lives in `app.config.ts` or temporarily in `main.ts`, must not compose root providers directly. It should pass routes and any future root configuration through a typed `CoreOptions` object:

```ts
export const appConfig: ApplicationConfig = {
  providers: [provideCore({ routes })],
};
```

Do not leave Angular or infrastructure providers next to `provideCore()` in root app config:

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideCore(),
  ],
};
```

Define the options and provider composition in `core.ts` instead:

```ts
export interface CoreOptions {
  routes: Routes;
}

export function provideCore(options: CoreOptions) {
  return makeEnvironmentProviders([
    provideBrowserGlobalErrorListeners(),
    provideRouter(options.routes),
    // other root providers...
  ]);
}
```

Keep `layout/` visual. Layout may read core state such as auth/user state, use generic `ui/` components such as avatar/menu/button, and host router outlets. A layout importing a feature is an architecture bug because it pulls lazy code into the eager graph.

## Patterns

Use `pattern/<pattern-name>/` for reusable drop-in business features such as document manager, approval process, change history, notes, or comments.

A pattern is like a feature, but consumed through a root component in another template rather than through routing. It may have services, state slices, effects, containers, and its own internal UI. It may be lazy-loaded with `@defer` when heavy or interaction-gated.

Patterns can be used by lazy features and rarely by layout. Patterns must not import feature implementation.
