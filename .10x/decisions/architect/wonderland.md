# Architect — wonderland

## Components & boundaries
- `content/`: pure data, imports nothing from other layers.
- `world/buildWorld()`: pure → `World` { zones, landmarks, bridges, surfaces, obstacles, nav, interactables, seeds }.
- `engine/`: pure TS. `collision` (surfaces/obstacles), `nav` (graph + A*), `playerState` (mutable singleton updated
  per frame, NOT React state), `input` (keyboard/touch/joystick → movement intent).
- `scene/`: R3F. Renders `World`, owns the game loop (`Player` useFrame), pushes coarse events (zone change, nearby
  interactable) to stores.
- `ui/`: DOM. Reads stores + content; never touches three objects. Minimap reads `playerState` in its own rAF.
- `state/`: `ui` (panel stack, overlays, destination, nearby), `settings` (persisted: muted, reducedMotion, quality,
  introSeen), `progress` (persisted: visited zones, collected seeds).

## Data flow
input → Player loop → collision → playerState → (on change) stores → UI.
UI actions (travel / guide / open) → stores → scene reacts.

## Failure modes
- WebGL missing → Classic mode + notice.
- localStorage unavailable → stores fall back to memory (try/catch storage adapter).
- Model factory throws → error boundary renders a placeholder (world keeps working).
- Player off all surfaces (bad data) → snap to zone hub; below the kill height → respawn at Home.
