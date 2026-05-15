# State slice

Always remove all comments from the provided code examples in this file (they are just implementation hints for you); the only exception is grouping of the state types in the `State` interface.

A state slice is an isolated part of the state registered in the NgRx global store under a unique name (property).
Each state slice has to have a unique KEY!

Example keys:

* `product` - can contain all state related to products (entities, loading, error, filters, sorting, pagination, ...)
* `product-entity` - contains entity-related state properties like `products` array, `loading` boolean, `error` string, ...

## Structure

Every state slice has a name (which is usually used for the unique key) and is implemented in a folder that
follows the `<key>-state/` pattern.

Inside the folder there are always the following files:

### Events <key>.events.ts

Create multiple event groups based on the source (where they are dispatched).

Always use `someEventName` instead of `'Some event name'`, events describe what happened, NOT what should happen!

Correct: `saveTriggered` (what happened)
Incorrect: `saveItem` (do something)

```ts
import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const <Key>Events = createActionGroup({
  source: '<Key> Page', // <Key> API, ...
  events: {
    init: emptyProps(),
    <key>LoadedSuccess: props<{ items: <Key>[] }>();
    // try to come up with a list of necessary events based on the provided description and state
  }
});
```

### Reducer <key>.reducer.ts

```ts
import { createFeature, createReducer, on } from '@ngrx/store';
import { <Key>Events } from './<key>.events';

export const <key>FeatureKey = '<key>';

export interface State {
  // use the following categories when implementing state properties, try to keep them as flat as possible
  // persistent state (entity, loading, error, ...)
  // when storing entities, use descriptive name for the array, e.g. `products` instead of `items`
  
  // client state (filters, sorting, pagination, ...)
  
  // transient state (local storage, session storage, ...)
}

export const initialState: State = {
  // implement all properties from the State interface and provide initial values (usually empty arrays, '', undefined, ...)
};

export const reducer = createReducer(
  initialState,
  
  // implement logic for all events from events file using the following pattern
  on(<Key>Events.someEvent, (state): State => ({ // always use :State return type
    ...state,
    // whatever should change
  })),
  
  // make sure to provide single handler for multiple events if they have the same payload and update the state in the same way
);

export const <key>Feature = createFeature({
  name: <key>FeatureKey,
  reducer,
});
```

### Effects <key>.effects.ts

```ts
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { <Key>Events } from './<key>.events';

@Injectable()
export class <Key>Effects {
  #events = inject(Actions);

  someEffect = createEffect(() =>
    this.#events.pipe(
      ofType(<Key>Events.someEvent),
      // implement logic here
    )
  );
}
```

### Selectors <key>.selectors.ts

```ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { <key>FeatureKey, State } from './<key>.reducer';

export const <key>FeatureSelector = createFeatureSelector<State>(<key>FeatureKey);

export const select<Key>State = createSelector(<key>FeatureSelector, (state) => ({...state}));

// other selectors
```

### Model <key>.model.ts (optional)

State slices usually manage some entity from the API (backend). If this is not yet described by an existing model, then you can create a new one in the state slice folder.
Prefer single model file even if it contains multiple interfaces.

## Where to implement them

Every state slice belongs to an Angular injector, global state slices are registered in `core` (e.g. `core.ts`) after the `provideStore()` call.
State slices that belong to a lazy loaded feature (because they are only used by a single lazy loaded feature) should be registered in the feature injector (usually `<some-feature>.routes.ts`) file. If it lacks a `providers: []` array, then introduce a wrapper empty route with `path: ''`, and `providers: []` and move all existing routes into its `children: []` array.


## Registering state slices

Always use `provideState(<key>Feature)` to register the state slice.
Always use `provideEffects([<Key>Effects, <Key2>Effects])`, there is only one `provideEffects` per injector (e.g. core, or lazy loaded feature).

### Cleanup (experimental injector auto cleanup)

If the application uses `withExperimentalAutoCleanupInjectors()` as an optional `Router` feature (registered in `provideRouter()`),
then make sure all effects in the lazy loaded features are auto unsubscribed with `takeUntilDestroyed()` operator.


## Splitting state slices

If another (sibling) feature needs to access all state from another lazy feature state slice, then extract that whole lazy state slice folder (events, reducer, selectors, effects) into `core/` and move its registration into the `core.ts` file.

If you realize that you need only a part of the state properties of a sibling lazy feature state slice, then create a new state slice in the `core/` (and register it in the `core.ts` file) and

1. it should have a unique key, e.g. if key was `product` and you only extract entity-related state properties, then key could be `product-entity`
2. move only related events, effects, and selectors into the new state slice
3. use the new selectors to deliver the extracted state into the selectors of the original state slice
4. emit the necessary events from the new state slice to the original state slice (e.g. to trigger loading of the entities)

### Example: extracting entity state to core

Before extraction, lazy `product-state/` owns both entity state and client state:

```ts
export interface State {
  // persistent state
  products: Product[];
  loading: boolean;
  error: UiError | undefined;

  // client state
  searchQuery: string;
  currentPage: number;
  pageSize: number;
  sorting: ProductSorting;
}
```

If sibling features need only products, loading, and error, create `core/product-entity-state/`:

```ts
export const productEntityFeatureKey = 'product-entity';

export interface State {
  // persistent state
  products: Product[];
  loading: boolean;
  error: UiError | undefined;
}
```

Keep only product page client state in lazy `product-state/`:

```ts
export interface State {
  // client state
  searchQuery: string;
  currentPage: number;
  pageSize: number;
  sorting: ProductSorting;
}
```

Use the core entity selector in the original lazy feature selector:

```ts
export const selectProductView = createSelector(
  selectProductEntityState,
  selectProductState,
  (entityState, productState) => ({
    ...entityState,
    ...productState,
  }),
);
```

Register `productEntityFeature` and `ProductEntityEffects` in `core.ts`; keep `productFeature` and product page effects in the lazy feature injector.
