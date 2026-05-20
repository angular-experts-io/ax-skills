# Architecture And Folder Structure

Use the most local valid place first. Extract only when reuse or dependency direction requires it.

This reference explains where to implement code in the architecture folder structure. For exact dependency rules per architecture building block, read [building-blocks.md](building-blocks.md).

## Algorithm

1. Start with the most local valid place.
2. If used only by one lazy feature, keep it inside that feature.
3. If reused by sibling lazy sub-features, extract to their parent feature folder.
4. If reused by first-level lazy features:
   - headless logic goes to `core/<domain>/`
   - generic standalone UI goes to `ui/`
   - reusable drop-in business UI with its own state/services goes to `pattern/<pattern-name>/`
5. If a whole feature must be reused, expose it only through its route config as a lazy sub-route.

## Sharing

For sharing between lazy features, read [extract-one-level-up.md](extract-one-level-up.md). Do not import sideways between sibling features.

## Folder Shape

Prefer domain folders over technical folders when grouping related logic:

- Good: `core/order/`, `core/auth/`, `feature/order/state-order/`
- Avoid by default: `core/services/`, `core/reducers/`, `core/components/`

Technical folders are acceptable for cross-cutting infrastructure such as interceptors or generic utilities when no domain grouping fits.

## UI Placement

Put a standalone in `ui/` only when it is generic and used by more than one lazy feature, pattern, or layout. If it is used only by one feature, keep it in that feature. If it is used only by layout, keep it in `layout/`.

UI components, directives, and pipes communicate through inputs, outputs, and content projection. They do not inject app services, read stores/selectors, or import `core`.

For types needed by UI inputs, prefer local, UI-specific interfaces or primitive inputs.

## Feature Placement

Create features with `loadChildren()` pointing to the feature route config. Prefer `loadChildren()` over `loadComponent()` so every feature has the same extension path when it grows.

A lazy feature is a black box: it can contain local components, services, state, effects, forms, and nested lazy sub-features. Its internal shortcuts do not leak because sibling features cannot import it.

Nested lazy sub-features live under the parent feature folder and can share through the parent folder. If a nested sub-feature needs reuse outside that parent, promote it to a normal first-level lazy feature and consume it through route config only.
