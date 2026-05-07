# How to register and configure NgRx global store

The global store is registered only once in the Angular root injector

This is often in the `core.ts` in the `providers: []` array; if not found, then register in the following locations ordered by preference

1. `core.ts`
2. `core.module.ts`
3. `app.module.ts`
4. `main.ts`


## Registering the store

Always register the store WITHOUT reducers


```ts
// core.ts
export function provideCore() {
  return [
    
    // angular providers...
    
    // ngrx store
    provideStore({}, {
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true,
        strictActionSerializability: true,
        strictStateSerializability: true,
        strictActionTypeUniqueness: true,

        // ONLY for apps which use zone-based change detection (else skip)
        // check for zone.js import in polyfills.ts, angular.json or main.ts
        strictActionWithinNgZone: true
      }
    }),
    
    // every app should use router store, and it has to be registered in the root injector
    provideState('router', routerReducer),
    provideRouterStore(),
    
    provideState(sliceAFeature),
    provideState(sliceBFeature),
    // ...
    
    provideEffects([SliceAEffects, SliceBEffects, ...])
  ]
}
```
