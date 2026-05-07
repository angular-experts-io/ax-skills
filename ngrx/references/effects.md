# Effects

## Effect architecture


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

## Retrieving additional state from state slices

Effects are often triggered by events and events have payload, which is often sufficient for the effect execution, 
but sometimes we need to retrieve some additional state from the state slices using selectors

TODO concatLatestFrom

## Effects triggered by selectors

### Selector data change as an event

### Feature independent reloading of data based on path params