# lab-thrust

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
- Static `dist` deploy

Graphics are generated at runtime. No image assets.

## Feel notes

Tunables live in `src/feel.ts`. After playtest (softer vacuum + energy + a rotating system):

- **Thrust accel** `340` px/s² at full stick (was `580`). Direction is the stick; a burn is a nudge, not a snap.
- **Max speed** `300` px/s (was `340`).
- **Drag** `14` px/s² linear (was `42`). Release and you still coast, so you can adjust mid-path.
- **Stick deadzone** `0.18` (was `0.14`), exponent `1.4` (was `1.12`). Ring `70` px + `28` px grab pad, bottom-left above the safe-area inset.
- **Facing** toward thrust at `6.8` rad/s, then toward velocity at `2.4` rad/s while coasting.
- **Camera** lerp `0.07`, look-ahead `88` px, zoom `0.76`.
- **Sun** at the origin, radius `118`. Soft gravity mass `5.2e6`, cap `52` px/s², range `1400`.
- **Two planets** (clay radius `170`, ice `146`) orbit at `560` / `900` px, `0.07` / `0.042` rad/s. Bounce `0.68`. Planet gravity mass `2.2e6`, cap `70`, range `520`.
- **Energy** tank `1`. Full stick drains `0.4` /s (~2.5s empty). Regen `0.155` /s while not burning (~6.5s full), including while docked. Empty = stick still moves, no burn. Top bar flashes if you push on an empty tank.
- **Dock** when the ship is within `88` px of a planet surface. Tap **dock** (circle to the right of the stick). Parked: no free physics, ship rides that surface as the planet orbits. **Undock** restores Arcade flight and kicks you out at `110` px/s. `0.55` s before a new dock is offered.

Touch is first. Mouse drag on the same circle works for desktop.

## Out of scope (v0)

Menus, dialogue, characters, trading, a third planet, or anything from lab-hitting / lab-play / Protostar canon.
