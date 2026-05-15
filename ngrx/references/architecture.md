# Architecture

Keep the application state model small and predictable:

- read application state with selectors
- change state by dispatching events
- run side effects from events in effects
- expose external observable/signal data as state slices when it must compose with application state
- keep UI components on inputs/outputs and component-local UI state

**Selectors are the read API. Events are the write API.**

For application state, components consume selector-backed view models and dispatch events. Use services, observables, route APIs, and local computed state only behind selectors/effects or for component-local UI state.

## Building blocks

- Container components: access the Store, read with selectors, dispatch events.
- UI components: pure inputs/outputs and component-local UI state. Never read from the Store. Exceptionally dispatch events directly when bubbling outputs would cross 3+ levels.
- Editor UI components: isolate form logic. Input state from a container, output explicit submissions instead of on-change mutations, never know about the Store.
- Patterns: drop-in feature building blocks used in lazy feature templates. They are not routed, can include containers, and are often lazy loaded with `@defer`.
- Effects: event -> side effect -> event or nothing. Pure orchestration.
- Services and utilities: keep stateful/stateless logic in services and plain utility functions.
