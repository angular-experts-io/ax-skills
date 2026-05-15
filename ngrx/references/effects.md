# Effects

NgRx effects are a dedicated place (and concept) for implementing EVERY type of side effect in our application, for example:

- Backend requests (HTTP, WebSocket, etc.)
- Deep linking (reflecting state to URL, consuming state from URL)
- Navigation (e.g. as a result of some processing, save data then navigate, ...)
- Synchronization of state into browser storage (local storage, session storage, etc.)
- Opening of new browser windows or tabs
- Programmatic scrolling

## General principles

1. Keep effects orchestration-only. Put calculations in selectors and I/O/business logic in services.
2. Effects emit ONE event per emission. It can be a different event per branch, e.g. success or failure, but only one event is emitted as the result. Or zero events if it's a pure side-effect.
3. ONE effect should implement only ONE side effect (focused, short snippet) and, if necessary, subsequent effects will be triggered by the result event of the previous effect.
4. For complex async processing, multi-step processes with a chain of short effects, it's preferable to extract it into a dedicated file in the same state slice folder with a descriptive name.

## Effect architecture

```ts
@Injectable()
export class <Key>Effects {
  #events = inject(Actions);
  
  // effects that dispatch result events
  effectWhichDoesSomething = createEffect(() => {
    // always use explicit return
    return this.#events.pipe( 
      ofType(<Key>Events.someEvent, <Key>Events.someOtherEvent),
      // implement logic here
      map((payload) => <Key>Events.someResultEvent({ payload })) // result event
    )
  });

  // pure side-effects
  effectWhichDoesSomethingElse = createEffect(() => {
    // always use explicit return
    return this.#events.pipe(
      ofType(<Key>Events.someEvent, <Key>Events.someOtherEvent),
      // implement logic here
      tap((payload) => {
        // do something with the payload, but do not dispatch any event
      })
    )
  }, { dispatch: false });
}
```

## Backend Requests (HTTP, WebSocket, etc.)

Specifics of how to perform a request should be encapsulated in a separate service which is located in the same lazy feature folder (or "domain" folder when in `core/`).

### Loading of data (read)

When loading data, prefer the following RxJS flattening operators based on the use case:

`switchMap` - loading data based on some variable like `id` or `query` (cancels previous loading to only get the latest response)
`exhaustMap` - loading data which always returns the same collection. In that case, we can block other loading attempts if the previous one is still loading, for example loading of all products, user profile, etc.

### Saving data (create, update, delete)

When saving data, prefer the following RxJS flattening operators based on the use case:

`concatMap` - saving data where order matters, e.g. backend assigns a timestamp, and we want to make sure that the timestamps are in correct order
`mergeMap` - saving data where order does not matter, better performance

### Handling the result of async operations that can fail (e.g. HTTP requests)

Always use `mapResponse()` method from the `@ngrx/operators` package, the operator MUST be used in the nested `.pipe()` 
because otherwise it will complete (shut down) the effect stream after the first handled error, which is always wrong.

```ts
loadItems = createEffect(() => {
  return this.#events.pipe(
    ofType(<Key>Events.loadItemsTriggered),
    switchMap(() => this.someService.getItems().pipe(
      mapResponse({
        next: (products) => ProductApiEvents.productsLoadedSuccess({ products }),
        error: (error: HttpErrorResponse) => ProductApiEvents.productLoadedFailure({ error: error.message }),
      }),
    ))
  );
});
```

## Error handling

Make sure that the `mapResponse` operator is used in the nested `.pipe()` of the async operation, otherwise the effect stream will complete (shut down) after the first handled error, which is always wrong.

## Deep linking

Effects are the right place to implement deep linking in our application (syncing of the client state, e.g. filters,
pagination, etc.) to the URL query params.

### Reflecting state to URL

```ts
reflectStateToUrl = createEffect(() => {
  return this.#events.pipe(
    ofType(
      <Key>Events.someEventWhichAffectsSyncedClientStateA,
      <Key>Events.someEventWhichAffectsSyncedClientStateB,
    ),
    // always select all relevant client state props using custom selector
    // use undefined as an empty value instead of '' (null, false, ...) so the query params fall out completely when not relevant
    concatLatestFrom(() => this.#store.select(selectClientStateForQueryParams)),
    tap(([, queryParams]) => {
      this.#router.navigate([], {
        queryParams: {
          // spread all relevant client state props into query params
          ...queryParams
        },
        queryParamsHandling: 'merge', // merge with other existing query params in the URL
      });
    })
  );
}, { dispatch: false });
```

### Consuming state from URL

Only consume state from the URL on the relevant container component `init` event to prevent an infinite loop of URL state syncing.

```ts
consumeInitialClientStateFromUrl = createEffect(() => {
  return this.#events.pipe(
    ofType(SomeContainerEvents.init),
    // use a custom selector which in turn uses router-store selectors (or selector factories)
    // to retrieve (and parse) relevant query params (e.g. "null" => null, "undefined" => undefined, "true" => true, "1" => 1,...)
    concatLatestFrom(() => this.#store.select(selectInitialClientStateFromUrl)),
    filter(([, initialClientStateFromUrl ]) => Object.keys(initialClientStateFromUrl).length > 0),
    map(([, initialClientStateFromUrl ]) =>
      <Key>Events.initialClientStateFromUrlDetected({ initialClientStateFromUrl })
    )
  );
});

```

## Navigation

## Retrieving additional state that was NOT delivered by an event payload

Effects are often triggered by events, and events have payloads, which are often sufficient for effect execution,
but sometimes we need to retrieve some additional state from the state slices using selectors

Always use `concatLatestFrom()` operator from the `@ngrx/operators` package

Never select from multiple selectors. If you need to select from multiple selectors, create a new selector which combines the needed state from the multiple selectors and select from that single selector in the effect.

```ts
someEffect = createEffect(() => {
  return this.#events.pipe(
    ofType(<Key>Events.someEvent),
    concatLatestFrom(() => this.#store.select(selectAllNecessaryStateForEffectExecution)),
    concatMap(([event, necessaryState]) => {
      // implement logic here using event and someStateA
    })
  );
});
```

## Effects triggered by selectors

### Selector data change as an event

### Feature independent reloading of data based on path params


## Testing
