# Effects

NgRx effects are a dedicated place (and cocnept) for implementing EVERY type of side effect in our application, for example:

- Backend requests (HTTP, WebSocket, etc)
- Deep linking (reflecting state to URL, consuming state from URL)
- Navigation (eg as a result of some processing, save data then navigate, ...)
- Synchronization of state into browser storage (local storage, session storage, etc)
- Opening of new browser windows or tabs
- Programmatic scrolling


## Effect architecture

Effects should contain as LITTLE logic as possible, try to move as much logic into services and selectors and keep effects focused purely on the orchestration

```ts
@Injectbale()
export class <Key>Effects {
  #events = inject(Actions);
  
  // effects which dispatch result events
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

### Loading of data (read)
switchamp vs exhaust map

### Saving data (create, update, delete)

### Handling result of async operations which can fail (eg HTTP requests)

Always use `mapResponse()` method from the `@ngrx/operators` package

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

## Deep linking

### Reflecting state to URL

### Consuming state from URL

## Navigation

## Retrieving additional state which was NOT delivered by an event payload

Effects are often triggered by events and events have payload, which is often sufficient for the effect execution, 
but sometimes we need to retrieve some additional state from the state slices using selectors

Always use `concatLatestFrom()` operator from  `@ngrx/operators` package

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