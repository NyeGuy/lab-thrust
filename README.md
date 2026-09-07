# lab-thrust

| Owner | Lead | CoS | Merge |
| --- | --- | --- | --- |
| **Crucible** | **Forge** | **Nyborg** | **Nye** |

**PARKED** — docs-only until Nye or Nyborg reopen. Pipeline, park rules, and remotes: **[PIPELINE.md](./PIPELINE.md)**. Agent rules: **[AGENTS.md](./AGENTS.md)**.

Mobile ship-feel POC. Open it, drag the stick, close it. Feel is the product for v0.

One ship, one virtual joystick, a sun with two large orbiting planets, dock/undock, and an energy bar that rations burns. No menus, no characters, no trading.

## Run locally

```bash
npm install
npm run dev
```

Dev server: `http://localhost:5173` (or the port Vite prints). Phone on the same network can use the LAN URL Vite lists.

```bash
npm run build
npm run preview
```

`npm run build` typechecks, then writes a static Vite bundle to `dist/` for Vercel.

## Stack

- Phaser 4 (`phaser` ^4.2)
- Vite + TypeScript
- Arcade physics (no Matter)
- Static `dist` deploy on Vercel

Graphics are generated at runtime. No image assets.

Primary GitHub: https://github.com/NyeGuy/lab-thrust. Active restore: [PR #1](https://github.com/NyeGuy/lab-thrust/pull/1) (`cursor/mobile-ship-feel-bba3`). SSO preview: https://lab-thrust-protostar1.vercel.app (Vercel Authentication / SSO may gate it).

Canon Protostar is Nye-local — there is no public GitHub remote yet. Do not invent one. See `PIPELINE.md`.

## Feel notes

Tunables live in `src/feel.ts`. After playtest (softer vacuum + energy + a rotating system):

- **Thrust accel** `340` px/s² at full stick (was `580`). Direction is the stick; a burn is a nudge, not a snap.
- **Max speed** `300` px/s (was `340`).
- **Drag** `14` px/s² linear (was `42`). Release and you still coast, so you can adjust mid-path.
- **Stick deadzone** `0.18` (was `0.14`), exponent `1.4` (was `1.12`). Ring `70` px + `28` px grab pad, bottom-left above the safe-area inset.
- **Facing** snaps to the stick while thrusting, then **locks**. Coasting does not ease the nose toward velocity — the dart drifts with a frozen heading.
- **Camera** lerp `0.07`, look-ahead `88` px, zoom `0.76`.
- **Sun** at the origin, radius `118`. Soft gravity mass `5.2e6`, cap `52` px/s², range `1400`.
- **Two planets** (clay radius `170`, ice `146`) orbit at `560` / `900` px, `0.07` / `0.042` rad/s. Bounce `0.68`. Planet gravity mass `2.2e6`, cap `70`, range `520`.
- **Energy** tank `1`. Full stick drains `0.4` /s (~2.5s empty). Regen `0.155` /s while not burning (~6.5s full), including while docked. Empty = stick still moves, no burn. Top bar flashes if you push on an empty tank.
- **Thrust VFX** is a soft spherical puff cloud (particle emitter) behind the ship, only while burning.
- **Minimap** upper-left, notch-safe: sun, two moving planets, ship.
- **Dock** when the ship is within `130` px of a planet surface (pulsing halo + **dock** circle to the right of the stick). Spawn matches the inner planet's orbital velocity so you ride with it; while coasting in range the ship gently keeps that world's speed. Button stays offered `2.4` s after you slide just out of range. Tap the button, the planet, or anywhere that is not the stick. Parked: no free physics, ship rides that surface as the planet orbits. **Undock** restores Arcade flight and kicks you out at `110` px/s. `0.55` s before a new dock is offered. Milestone: dock clay, undock, dock ice while they orbit.

Touch is first. Mouse drag on the same circle works for desktop.

## Out of scope (v0)

Menus, dialogue, characters, trading, a third planet, Satellite Lab, baseball / lab-hitting / lab-play, or Protostar canon beyond this mobile ship-feel POC.
