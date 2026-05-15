# Consuming Observable Data Sources

Sometimes, we need to consume data from services that we're not in control of (e.g. from a library, another team, etc.)

Such services often deliver data as RxJS `Observable` or new Angular `Signal`, but these do not compose well with NgRx selectors.

Turn external observable/signal data sources into state slices when they have to compose with application state: read with selectors, write with events/effects.

## Creating a thing state slice

To solve this interface impedance, create a thin state slice (follow the standard rules for the state slices for its location, e.g. core or lazy feature)

## Observable data source

The NgRx effect will listen to the Observable data source and dispatch an event with the new data whenever it changes

```ts
import { Injectable, inject } from '@angular/core';
import { createEffect } from '@ngrx/effects';
import { map } from 'rxjs';

import { SomeService } from '@my-org/some-lib';

import { SomeEvents } from './some.events';

@Injectable()
export class SomeEffects {
    #someService = inject(SomeService);

    syncSome = createEffect(() => {
        return this.#someService.getSome().pipe(
            map(some => SomeEvents.someChanged({ some })), // use JSON cloning ONLY if the data is NOT serializable
        );
    });
}
```

## Signal data source

The NgRx effect will streamify the signal using `toObservable()` and dispatch an event with the new data whenever it changes

```ts
import { Injectable, inject } from '@angular/core';
import { createEffect } from '@ngrx/effects';
import { map } from 'rxjs';

import { SomeService } from '@my-org/some-lib';

import { SomeEvents } from './some.events';

@Injectable()
export class SomeEffects {
    #someService = inject(SomeService);

    syncSome = createEffect(() => {
        return toObservable(this.#someService.some).pipe(
            map(some => SomeEvents.someChanged({ some })), // use JSON cloning ONLY if the data is NOT serializable
        );
    });
}
```

## Exposing state as a selector

```ts
import { createFeatureSelector, createSelector } from '@ngrx/store';

import * as fromSome from './some.reducer';

export const selectSomeState = createFeatureSelector<fromSome.State>(
    fromSome.someFeatureKey,
);

export const selectSome = createSelector(selectSomeState, state => state.some);
```
