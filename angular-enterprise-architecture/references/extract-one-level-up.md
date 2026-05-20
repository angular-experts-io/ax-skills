# Extract One Level Up

Use this rule whenever one lazy feature wants to import implementation from another lazy feature. Do not allow the sideways import because it breaks the one-way dependency graph, weakens lazy feature isolation, and can pull lazy code into the wrong bundle. Extract only the reusable part to the nearest shared owner.

## Rule

- Sibling first-level lazy features share through `core/`, `ui/`, or `pattern/`.
- Sibling lazy sub-features share through their parent feature folder.
- A whole reusable routed feature is shared through route config only.
- Extract only the reusable part. Keep feature-specific orchestration, mapping, and wrappers in the consuming feature.

## Destination

| Reusable Thing | Extract To | Keep Local |
| --- | --- | --- |
| Generic standalone component/directive/pipe | `ui/` | Feature-specific container/wrapper, data mapping, labels, permissions, commands. |
| Headless service, state slice, utility, guard, interceptor | `core/<domain>/` | Feature-specific facade, view model mapping, local filters, route-driven behavior. |
| Drop-in business UI with state/services | `pattern/<pattern-name>/` | Feature-specific placement, configuration, and context adapter. |
| Reusable child route flow | first-level `feature/<name>/` route config | Parent feature route wiring and context parameters. |
| Shared code between sibling sub-features | parent `feature/<parent>/` | Sub-feature-specific shell and route behavior. |

## Component Example

Initial state:

- `feature/checks/check-type/check-type.component.ts` renders a styled check type.
- `feature/results/` now needs the same visual treatment.
- Importing `../../checks/check-type/check-type.component` from `feature/results/` is forbidden.

Extraction:

1. Identify the generic visual part: badge style, icon, color, display label.
2. Move that generic standalone to `ui/check-type/check-type.component.ts`.
3. Keep checks-specific data loading, state selectors, commands, and route assumptions in `feature/checks/`.
4. If needed, keep a checks wrapper such as `feature/checks/check-type-field/check-type-field.component.ts` that maps `Check` entity data into the generic UI inputs.
5. Use the generic UI component from both features.

Shape:

```text
feature/checks/
  check-type-field/
    check-type-field.component.ts   # feature wrapper, knows Check entity/state

feature/results/
  result-list/
    result-list.component.ts        # maps result.checkType to UI inputs

ui/check-type/
  check-type.component.ts           # generic inputs/outputs only
```

The extracted `ui` component should not import `core`, `feature/checks`, selectors, services, or stores. Prefer primitive inputs or a UI-local interface that describes exactly what the component renders.

## Service Example

Initial state:

- `feature/orders/order.service.ts` handles order API calls.
- `feature/dashboard/` needs order data for dashboard stats.
- Importing `feature/orders/order.service.ts` from dashboard is forbidden.

Extraction:

1. Separate reusable domain logic from feature-specific behavior.
2. Move reusable API/data access/state logic to `core/order/`.
3. Keep order-feature-only view state, filters, selected row behavior, route param handling, and screen-specific commands in `feature/orders/`.
4. Let both features consume the core service or selectors.

Shape:

```text
core/order/
  order.service.ts                  # reusable order API/data logic
  state-order/                      # optional reusable state slice

feature/orders/
  order-list/
  state-order-list/                 # feature-only view state if needed

feature/dashboard/
  dashboard.component.ts            # consumes core/order data through its own VM
```

Do not move feature-specific assumptions into `core/`. If extraction makes `core/order/` depend on routes, components, or UI state from `feature/orders/`, the extraction is too broad.

## Pattern Example

Initial state:

- `feature/product/document/` manages documents for products.
- `feature/order/` now needs the same document manager for invoices and confirmations.

Extraction:

1. If the reusable thing is a complete drop-in business capability with UI, services, state, and actions, extract to `pattern/document-manager/`.
2. Keep feature-specific context adapters in each feature.
3. Pass configuration/context into the pattern root component.

Shape:

```text
pattern/document-manager/
  document-manager.component.ts
  document-manager.service.ts
  state-document/

feature/product/
  product-documents.component.ts    # passes product context/config

feature/order/
  order-documents.component.ts      # passes order context/config
```

## Smells

- A feature imports from `../other-feature/`.
- `ui/` imports a service, selector, store, route API, or feature model.
- `core/` imports a component, directive, pipe, route component, or feature file.
- Extraction moves everything instead of the reusable part.
- A shared component still knows one feature's entity, route, permissions, or state shape.
