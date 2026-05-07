# Effects

NgRx effects are a dedicated place (and concept) for implementing EVERY type of side effect in our application, for example:

- Backend requests (HTTP, WebSocket, etc)
- Deep linking (reflecting state to URL, consuming state from URL)
- Navigation (e.g. as a result of some processing, save data then navigate, ...)
- Synchronization of state into browser storage (local storage, session storage, etc)
- Opening of new browser windows or tabs
- Programmatic scrolling

## General principles

1. Effects should contain as LITTLE logic as possible, try to move as much logic into services and selectors and keep effects focused purely on the orchestration
2. Effect should only result in ONE (or zero) event returned (it could be different events, eg success, failure or other, but ONLY one can be returned)
3. ONE effect should implement only ONE side-effect (focused, short snippet) and if necessry subsequent effects will be triggered by the result event of the previous effect.
4. For complex async processing, multistep processes with chain of short effects, it's preferable to extract it into a dedicated file in the same state slice folder with a descriptive name 

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

## Backend Requests (HTTP, WebSocket, etc)

Specifics of how to perform request should be encapsulated in a separate service which is located in the same lazy feature folder (or "domain" folder when in `core/`)

### Loading of data (read)

When loading data prefer following RxJs flattening operators based on the use case

`switchMap` - loading data based on some variable like `id` or `query` (cancels previous loading to only get the latest response)
`exhaustMap` - loading data which always return the same collection, in that case we can block other loading attempts if the previous one is still loading, for example loading of all products, user profile, etc

### Saving data (create, update, delete)

When saving data prefer following RxJs flattening operators based on the use case

`concatMap` - saving data where order matters, eg backend assigns a timestamp, and we want to make sure that the timestamps are in correct order
`mergeMap` - saving data where order does not matter, better performance

### Handling result of async operations that can fail (e.g. HTTP requests)

Always use `mapResponse()` method from the `@ngrx/operators` package, the operator MUST be used in the nested `.pipe()` 
because otherwise it will complete (shut down) the effect stream after first handled error which is always wrong.

```ts
loadItems = createEffect(() => {
  return this.#events.pipe(
    ofType(<Key>Events.loadItemsTriggered),
    switchMap(() => this.someService.getItems().pipe(
      mapResponse({
        next: products => ProductApiEvents.productsLoadedSuccess({ products }),
        error: (error: HttpErrorResponse) => ProductApiEvents.productLoadedFailure({ error: error.message })
      }),
    ))
  );
})


```

## Error handling

always in second pipoe / nested stream

## Deep linking

### Reflecting state to URL

### Consuming state from URL

## Navigation

## Retrieving additional state which was NOT delivered by an event payload

Effects are often triggered by events, and events have payloads, which are often sufficient for the effect execution,
but sometimes we need to retrieve some additional state from the state slices using selectors

Always use `concatLatestFrom()` operator from the `@ngrx/operators` package

Never select from multiple selectors, if you need to select from multiple selectors, create a new selector which combines the needed state from the multiple selectors and select from that single selector in the effect

```ts
someEffect = createEffect(() => {
  return this.#events.pipe(
    ofType(<Key>Events.someEvent),
    concatLatestFrom(() => this.#store.select(selectAllNecessaryStateForEffectExecution)),
    concatMap(([event, necessaryState]) => {
      // implement logic here using event and someStateA
    }) 
});
```

## Effects triggered by selectors

### Selector data change as an event

### Feature independent reloading of data based on path params
