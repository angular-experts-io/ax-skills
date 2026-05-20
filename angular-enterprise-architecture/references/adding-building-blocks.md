# Adding Architecture Building Blocks

Add an architecture building block only when existing building blocks cannot express a stable role.

Use `architecture building block` for the concept, `folder` for its implementation location, and `ESLint boundary type` for the matching enforcement entry.

## Definition Checklist

Define:

- `name`: short building block name.
- `folder`: where it lives in the project.
- `ESLint boundary type`: exact `boundaries/elements` pattern and captures.
- `contents`: what belongs there.
- `consumers`: which existing building blocks may import it.
- `dependencies`: what the new building block may import.
- `migration rule`: how code moves into or out of the building block.

Then update:

- `boundaries/elements` with the new matcher.
- `boundaries/element-types` with both incoming and outgoing rules.
- [building-blocks.md](building-blocks.md) if the block becomes part of the standard architecture.

## Example: `model`

Use `model` for reusable type-only contracts only when the project has a real cross-cutting model-sharing need, such as generated API DTOs or frontend/backend shared types.

| Field | Value |
| --- | --- |
| Building block | `model` |
| Folder | `projects/<app>/src/app/model/` or a dedicated library public API |
| ESLint boundary type | `model` |
| Contents | `.model.ts`, generated DTOs, pure type guards |
| May consume | Nothing app-specific |
| May be consumed by | All app building blocks |
| Migration rule | Keep services, selectors, stores, mappers, and runtime orchestration out unless this becomes a different building block. |
