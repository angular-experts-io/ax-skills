---
name: ngrx
description: Use when implementing or modifying NgRx state management in Angular applications, especially state slices, events, reducers, effects, selectors, and store registration.
author: Tomas Trajan @tomastrajan
license: copyright 2026
---

# NgRx

Use this skill for NgRx state management work in Angular applications.

## General

- **immutable updates**: always update state immutably, always re-create objects and arrays when they change, never mutate them (for any level of nesting), prefer JavaScript `...` spread operator and immutable Array methods like `map()`, `filter()` and `reduce()`

## References

- Registering and configuring runtime checks for the global store, read [store.md](references/store.md).
- For creating state slices, sharing existing state slices between isolated lazy features (extract to core), and splitting state slices, read [state-slice.md](references/state-slice.md).
- For creating or changing selectors, consuming state in container components and testing read [selectors.md](references/selectors.md).
- For implementing reducers, handling events in isolation vs in single handler and testing reducers, read [reducers.md](references/reducers.md).
- For side effects like backend requests, navigation, deep linking (reflecting and consuming state from URL), scrolling, loading data based on URL path params, and testing read [effects.md](references/effects.md).
- For reading router state with NgRx router-store, registering router-store, or creating router selector factories, read [router-store.md](references/router-store.md).
- For consuming observable data sources (e.g. from services not in our control) and making the data available through selectors instead to be composable with the rest of the state in our application, read [consuming-observable-data-sources.md](references/consuming-observable-data-sources.md).
