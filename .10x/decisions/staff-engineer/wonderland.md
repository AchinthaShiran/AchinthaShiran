# Staff Engineer - wonderland

- Naming: camelCase TS modules, PascalCase components, kebab-case string ids.
- Per-frame code: no allocations in hot loops (reuse vectors), no React state updates per frame.
- Shared materials via the `material(color, opts)` cache; models memoized per key + props.
- Ambient animation contract: `object.userData.tick(t, dt)`; `Model` collects and runs ticks unless reduced motion.
- Accessibility: every interactive DOM control is a `<button>`/`<a>` with a label; panels are `role="dialog"`,
  focus moves in on open and is restored on close; Esc closes.
- Error handling only at boundaries: storage adapter, WebGL detection, model error boundary.
- Styling: CSS custom properties (design tokens) in `src/styles/tokens.css`; BEM-ish global classes.
