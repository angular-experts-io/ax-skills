# Selectors

Try to minimize the number of selectors in the application. The state slice already exposes its full state based on the state slice boilerplate and
it might be possible to add derived state to the state slice selectors if necessary.

DO NOT introduce unnecessary pluck selectors that just pluck a single property from the state slice
to compose it with other selectors, prefer composing with the base state slice selector instead!

## Derived state

Derived state that can be derived from existing state slices should always be derived in some selector instead of storing it in the state.

## Dedicated selector for container components

Container components often need to access state from more than one state slice and also often need derived state that is specific to the given container component.

Create a dedicated selector for the container view model. Do not derive NgRx-backed view state in the component with local `computed()`; use local `computed()` only for "local UI" (component-local) signal state.

The selector should live next to the component, so when we have a component called `SomeComponent` in the `some.component.ts` file (or sometimes just `some.ts`),
create a selector file called `some.selectors.ts` and put the selector there.

```ts
import { createSelector } from '@ngrx/store';

export const selectSomeContainerView = createSelector(
  selectSomeStateA,
  selectSomeStateB,
  (stateA, stateB) => ({
    ...stateA,
    ...stateB,
    someDerivedProp: someHelper(stateA, stateB),
    // ....
  })
)
```
## Consuming state in the container component


Container components should consume state using `selectSignal()` method of the store

```ts
@Component({
  selector: 'prefix-some-container',
  template: '@let v = view(); <div>{{v.prop}}</div>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SomeContainerComponent {
  #store = inject(Store);
  view = this.#store.selectSignal(selectSomeContainerView);
}
```

## Testing

When testing selectors, use minimal mocks and assert only the output of actual logic, e.g. derived state calculations.

```ts
describe('selectSomeContainerView', () => {
  it('should calculate someDerivedProp correctly', () => {
    const stateA = { /* ... */ };
    const stateB = { /* ... */ };
    const result = selectSomeContainerView.projector(stateA, stateB);
    expect(result.someDerivedProp).toEqual(/* expected value based on stateA and stateB */);
  });
});
```
