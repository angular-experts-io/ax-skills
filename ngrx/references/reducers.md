# Reducers

## Multiple events with same payload and state change

When multiple events have the same payload and state change, they can be handled in a single reducer handler.

A typical example of this is handling multiple failure events which deliver an error message (or other error as a value).

```ts
const someReducer = createReducer(
  initialState,
  on(someEventA, someEventB, someEventC, (state, { error }) => ({
    ...state,
    error
  }))
);
```

## Testing

When testing reducers, we can always fall back to `initialState` as the base mock state and override only relevant properties.
Then mock actual events with the full payload and assert only the relevant properties of the resulting state.

```ts
describe('someReducer', () => {
  it('updates state in a specific way when someEventA is dispatched', () => {
    const event = SomeEvents.someEventA({ payload: 'some value' });
    const result = someReducer({
      ...initialState,
      someOverriddenProp: 'some value'
    }, event);
    expect(result.changedPropA).toBe('some expected value');
  });
});
```
