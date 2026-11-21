# WONDERLAND — Interactive 3D Portfolio

_A world of ideas, built one adventure at a time._

WONDERLAND is the portfolio of **Achintha Bandara**, presented as a small low-poly adventure game: a hub island
surrounded by six themed islands and two islets, connected by bridges. Visitors explore with keyboard, mouse or
touch. Every section is also one click away through the Explore menu, the world map and a classic page.

Built with **Vite · TypeScript · React Three Fiber · three.js · Zustand**, deployed to **GitHub Pages**.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run check      # lint + typecheck + tests + production build
npm run preview    # serve the production build locally
```

Node 20 or newer is required.

| Script           | Purpose                                                    |
| ---------------- | ---------------------------------------------------------- |
| `npm run dev`    | Dev server with hot reload                                 |
| `npm run build`  | Typecheck and build to `dist/`                             |
| `npm test`       | Unit tests (content, collision, navigation, world, stores) |
| `npm run lint`   | ESLint                                                     |
| `npm run format` | Prettier (write)                                           |

## The world

| Zone             | Purpose                                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| Home Island      | Welcome, About Me, interests, current role, growth timeline, mailbox                                      |
| Career City      | One tower per organization, one floor and plaque per role, timeline monument                              |
| Innovation Lab   | SAGE — Sysco Agentic Ecosystem, explained across six landmarks                                            |
| Project Park     | Hub for every project: an exhibit per Sysco LABS project and a gateway to each personal island            |
| Tala Workshop    | Personal project Tala — a local AI assistant driven by YAML tool packs (Makers' Row)                      |
| Skill Up Academy | Personal project Skill Up — an AI study planner (Makers' Row)                                             |
| MySpend Market   | Personal project MySpend — an Android expense tracker (Makers' Row)                                       |
| Unity Arcade     | Personal project OpenAI-Unity — a Unity package for the OpenAI API (Makers' Row)                          |
| Skill Forest     | One crystal per skill, clustered and colour-coded by category                                             |
| Achievement Peak | Trophies along a winding trail to the summit castle                                                       |
| Horizon Island   | Contact: lighthouse, message in a bottle, phone booth, CV board, telescope                                |
| University Grove | Education                                                                                                 |
| Splat Arena      | Optional paintball play: shooting gallery, bot arena, target hunt, challenge badges (linked to Home only) |
| Mentor Pavilion  | Mentoring, leadership and professional qualities                                                          |

**How the projects connect.** The Innovation Lab (SAGE) is bridged to Career City (Sysco LABS) and to Project Park,
forming the Sysco LABS district in the west. Project Park is the hub for every project: its exhibits cover the Sysco
LABS work, and a gateway for each personal project opens it. Every project panel has a **Find it in the world**
section with _Guide me_ and _Travel_ buttons to the island that explains it. The personal islands form Makers' Row
along the south, linked to the Innovation Lab, Project Park and Horizon Island.

**Finding your way.** Sandy paths connect every landmark. Signposts point to neighbouring islands, and each bridge
head names its destination. The minimap shows the area around you; press `M` for the world map. **Guide me** lights
a trail to any destination and shows a compass with the distance.

**Controls.** `WASD`/arrows to move, `Shift` to run, `Space` to jump, `E` to interact, `M` for the map, `F`
for the optional paintball gun. **Mouse look (desktop):** click the world to capture the mouse, then just move it to
look around, like a third-person game; `Esc` releases it, and it lets go by itself whenever a panel or menu opens.
Turn it off in Settings to use drag-to-look, click-to-walk and click-to-visit instead. On touch devices: joystick,
Jump and an interact button; drag to look and tap the ground to walk. The controls are shown on the intro and in the
opening tips.

**Paintball (optional, ADR-007).** Press `F` for the gun. With the mouse captured the camera moves over your
shoulder and the centre crosshair is where shots go; otherwise click or tap where you want to shoot. Shooting an
exhibit opens it. The **Splat Arena** (a bridge from Home, off every route to portfolio content) hosts a shooting
gallery, a bot arena (paint-bots exist only while that game runs; five paint hits send you back to the arena gate)
and an island target hunt, plus a challenge board with badges. Best scores and badges are saved in the browser only.

**Accessibility.** The classic portfolio at `#/classic` holds all the content as a regular page. It is also shown
automatically when WebGL is unavailable. Settings include reduced motion (on by default when the OS asks for it),
sound (off by default) and graphics quality.

## Updating content

Every fact lives in [`src/content/`](src/content) as typed data. Unknown values are `null` and the UI hides them.
Tests check that every cross-reference resolves.

| To…                                  | Edit                                                                                              |
| ------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Change bio, headline or welcome text | [`profile.ts`](src/content/profile.ts)                                                            |
| Add a role                           | [`experience.ts`](src/content/experience.ts) — Career City adds a floor and a plaque              |
| Add a corporate project              | [`projects.ts`](src/content/projects.ts) (`category: 'corporate'`) — Project Park adds an exhibit |
| Add a personal project               | See "Adding a personal project" below                                                             |
| Add a skill                          | [`skills.ts`](src/content/skills.ts) — Skill Forest adds a crystal in its category                |
| Add an award                         | [`awards.ts`](src/content/awards.ts) — Achievement Peak adds a trophy                             |
| Mentoring, education, Idea Seeds     | `mentoring.ts`, `education.ts`, `seeds.ts`                                                        |
| LinkedIn / GitHub links              | [`contact.ts`](src/content/contact.ts) — set `href`                                               |

**Enable the CV download.** Put the PDF at `public/cv/Achintha_Bandara_CV.pdf`, then set
`cv.path = 'cv/Achintha_Bandara_CV.pdf'` in [`contact.ts`](src/content/contact.ts).

**Project media and links.** Fill `media`, `liveUrl`, `repoUrl` and `demoVideoUrl` on a project. Only `https://`
links are accepted (the tests enforce this), and empty fields stay hidden.

Run `npm test` after editing; it catches broken references, overlapping landmarks and unreachable objects.

## Replacing models

All models go through [`src/assets/manifest.ts`](src/assets/manifest.ts). They are procedural low-poly by
default. To use a real model:

1. Put the file at `public/models/cozy-house.glb`.
2. Change the entry's source:
   ```ts
   cozyHouse: { source: { kind: 'gltf', url: 'models/cozy-house.glb', scale: 1 }, footprint: rect(5.4, 4.6), height: 6.5 },
   ```

The collision footprint and label height stay in the manifest, so walking and interaction keep working.

## Architecture

```
src/
  content/   typed portfolio facts (single source of truth)
  world/     zone config, content-driven layout generators, buildWorld() → World
  engine/    pure TS: walkable-surface collision, A* nav graph, input, per-frame player state
  assets/    manifest, procedural model factories, shared materials, baking
  scene/     React Three Fiber: terrain, landmarks, player, camera, guide trail
  ui/        HUD, panels, minimap, world map, menus, intro, classic mode
  state/     Zustand stores (ui, persisted settings and progress)
  game/      actions shared by scene and UI (walk, travel, guide, interact)
```

Design records live in [`.10x/`](.10x). The ADRs cover typed content (001), the data-driven world and asset
manifest (002), custom 2.5D collision instead of a physics engine (003), and Classic mode with a lazy-loaded 3D
world (004).

**Adding a personal project** (ADR-005). Facts come from the project's public sources; unknown values stay empty.

1. Add the project to [`projects.ts`](src/content/projects.ts) with `category: 'personal'`, its `topics` (one per
   explainable feature) and public `links`. Leave `repoUrl` `null` for private repositories.
2. Add a `ZoneDef` in [`zones.ts`](src/world/zones.ts): a central landmark opening `{ kind: 'project', id }`, one
   station per topic opening `{ kind: 'project-topic', project, id }`, and `projects: [id]`. Set it as
   `primaryLandmark`, then link it in `zoneLinks`.
3. Models come from [`makers.ts`](src/assets/models/makers.ts) and the [manifest](src/assets/manifest.ts) — reuse
   one or add new ones.
4. Project Park adds a gateway automatically (it has four slots; add more in `parkLandmarks()`), and the Explore
   menu and Classic page list the project. Add an idea seed in `seeds.ts` and place it on the island.

`npm test` checks that every topic has a station, every project has an island and everything is reachable.

**Adding an island.** Add a `ZoneDef` to [`src/world/zones.ts`](src/world/zones.ts), link it in `zoneLinks`, and
optionally add a section in [`sections.ts`](src/world/sections.ts). Bridges, paths, nav graph, minimap and map
entries are generated automatically.

## Deployment

Pushes to `main` run [CI](.github/workflows/ci.yml): format, lint, typecheck, test and build, then deploy to
GitHub Pages. One-time setup: **Settings → Pages → Source: GitHub Actions**. The build uses relative asset paths
and hash routing, so it works under any repository name.

## Conventions

- Conventional commits (`feat:`, `fix:`, `docs:`, `chore:`, …). Feature branches are merged into `main` with `--no-ff`.
- TypeScript strict, ESLint and Prettier. Tests sit next to the code as `*.test.ts`.
- Content accuracy: only verified facts. Never invent links, metrics or responsibilities.
