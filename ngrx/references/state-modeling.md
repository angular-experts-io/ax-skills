# State modeling

## Serializability

Must be serializable, so no Date, Map, Set, etc. but rather use string, number, boolean, arrays and objects...
If UI component needs non-serializable state, e.g. Date, it should be stored in the state as a serializable value and converted into the non-serializable value in the selector, e.g. store date as ISO string and convert it to Date in the selector.

## State types

### Persistent state - serializable

Subset of server (backend) state that is loaded by the client,usually a collection of entities or sometimes just a single entity (eg current user)

```ts
products: Product[];
loading: boolean;
error: UiError;  // error as a value (eg message and maybe more code, details, etc.)
```

### Client state - serializable

State that is relevant only for the client, e.g. filters, sorting, pagination, etc. and which is managed by the NgRx
store instead of just by the components because it is often synchronized into URL. and/or shared between multiple components.

```ts
filters: {...}
searchQuery: string;
currentPage: number;
pageSize: number;
sorting: 'asc' | 'desc';
```

### Transient state

State that is stored in browser storages like local storage or session storage, e.g. user preferences, theme, etc. and which is managed by the NgRx state slices and effects

```ts
theme: 'light' | 'dark';
appSidebarCollapsed: boolean;
density: 'comfortable' | 'compact';
```

### Local UI state

State that is managed by individual component instances, highlighted button, open/close state of a dropdown, overlay, expander,...
Will not be stored in the NgRx store, but rather managed by the component itself using `signal()`


## Error modeling

JavaScript `Error` objects are not serializable, so we should not store them in the state, but rather store error as a value, e.g. an object with message and maybe more code, details, etc.

A good start could be `export type UiError = string`; to store an error message as a string,
then it can easily evolve into a more complex type if necessary, e.g.

```ts
export interface UiError {
  message: string;
  code?: string;
  details?: any;
}
```

