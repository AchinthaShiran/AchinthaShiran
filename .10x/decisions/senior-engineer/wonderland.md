# Senior Engineer - wonderland implementation approach

- **Collision (T3):** surfaces `disc {cx,cz,r,y}` / `strip {ax,az,bx,bz,halfWidth,ay,by}`. `groundAt(x,z,y)` returns
  the highest surface height ≤ y + stepUp, or `null` if none / blocked by a higher containing surface.
  Obstacles: circle / oriented box with y0..y1; three push-out iterations.
- **Nav (T3):** nodes with world positions; bidirectional edges; A* with a Euclidean heuristic; `nearestNode()`.
- **World (T5):** zone-local → world transform; bridges from zone links with endpoints on the rims; landmark approach
  point = landmark position moved toward its nav link by footprint radius + clearance; one obstacle per footprint;
  decor via seeded RNG avoiding landmark and bridge corridors.
- **Player (T8):** intent from keyboard/joystick relative to camera yaw; acceleration smoothing; facing interpolation;
  procedural limb animation driven by speed; auto-walk path follow with a stuck timer.
- **Camera (T8):** spherical offset (yaw, pitch, distance), damped follow; pointer drag rotates; wheel zooms; intro
  mode flies a scripted curve.
- **Tricky parts:** drag vs click disambiguation (shared drag flag), panel focus management, Achievement Peak
  tiers/ramps, lazy chunk + WebGL fallback.
