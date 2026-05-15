# Router Store

Use NgRx router-store as the only source for route-derived application state.

Do not read router state with `ActivatedRoute`, `Router.events`, router snapshots, or component input bindings. Components, effects, guards, resolvers, and state slices should consume route params, query params, data, fragments, and URLs through selectors backed by `@ngrx/router-store`.

## Registering router-store

Register router-store in the core application providers next to `provideStore()`.

```ts
import { provideStore } from '@ngrx/store';
import { provideRouterStore, routerReducer } from '@ngrx/router-store';

export function provideCore({ routes }: CoreOptions) {
  return [
    provideRouter(routes),
    provideStore(),
    provideState('router', routerReducer),
    provideRouterStore(),
  ];
}
```

If the app already calls `provideStore()`, add the `router` reducer to that root store object. Keep `provideRouterStore()` in `core.ts`, not in lazy feature route providers.

## Router selector factories

Use `getRouterSelectors()` from `@ngrx/router-store` to create router selector factories.

```ts
import { getRouterSelectors } from '@ngrx/router-store';

export const {
  // only use factories which you actually need
  selectCurrentRoute,
  selectFragment,
  selectQueryParam,
  selectQueryParams,
  selectRouteData,
  selectRouteParam,
  selectRouteParams,
  selectUrl,
} = getRouterSelectors();

export const selectProductIdFromUrlPathParams = selectRouteParam('productId');
export const selectQueryFromUrlQueryParams = selectQueryParam('query');
```

Router selectors are selector factories, so create named selectors for every route param or query param that is consumed by app code. Do not call `selectRouteParam('id')` directly inside components or other selectors.

## Where router selectors live

Apply the same ownership rules as state slices:

- If router selectors are only used by one lazy feature, implement them in that feature.
- If a feature state selector needs route state, create the needed named router selectors directly in that feature's `<something>-state/<something>.selectors.ts` file instead of creating a dedicated router selector file.
- If router selectors are only used by one container component, they can live next to that component in its `<component>.selectors.ts` file.
- If router selectors are reused by multiple features, implement them in `core/router-state/router.selectors.ts`.
- If router selectors are used by core state slices, effects, guards, or shared container selectors, implement them in `core/router-state/router.selectors.ts`.
- If a container component combines router state with feature state, create the final view selector next to the container component, following [selectors.md](selectors.md).

## Consuming router state

Consume router selectors through Store APIs.

```ts
export const selectProductView = createSelector(
  selectProductState,
  selectProductId,
  (productState, productId) => ({
    ...productState,
    selectedProduct: productState.items.find((item) => item.id === productId),
  }),
);
```

Effects should also use router selectors through the Store, for example with `concatLatestFrom`. Do not inject `ActivatedRoute` into effects,
e.g. `concatLatestFrom(this.store.select(selectProductId))`

## Checklist

- Register `routerReducer` in the root store and call `provideRouterStore()` in `core.ts`.
- Read route params, query params, data, fragment, and URL only through router-store selectors.
- Create named selectors from router selector factories before use.
- Place router selectors by ownership: feature-local if feature-only, `core/router-state` if shared or core-facing.
- Keep component-specific combined selectors next to the container component.
