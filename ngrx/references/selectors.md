# Selectors

Try to minimize the number of selectors in the application, state slice already exposes its full state based on the state slice boilerplate and
it might be possible to add derived state to the state slice selectors if necessary.

## Derived state

Derived state that can be derived from existing state slices should always be derived in some sector instead of storing it in the state.

## Dedicated selector for container components

Container components often need to access state from more than one state slice and also often need derived state that it's specific to the given container component.

The selector should live next to the component so when we have component called `SomeComponent` in the `some.component.ts` file ( or sometimes just `some.ts` ) 
create a selector file called `some.selectors.ts` and put the selector there.

```ts
import { createSelector } from '@ngrx/store';

export const selectSomeView = createSelector(
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


Container component should consume state using `selectSignal()` method of the store

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
