# lab-thrust

Mobile ship-feel POC. Open it, drag the stick, close it. Feel is the whole product for v0.

One ship, one virtual joystick (direction = thrust, how hard you push = how hard you thrust), two or three planets as scenery, and an energy bar that rations burns. No menus, no sun, no characters, no trading.

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

Tunables live in `src/feel.ts`. After the first playtest (softer, more vacuum, energy rationing):

- **Thrust accel** `340` px/s² at full stick (was `580`). Same mapping — direction is the stick — but a burn is a nudge, not a snap.
- **Max speed** `300` px/s (was `340`).
- **Drag** `14` px/s² linear (was `42`). A release still coasts for a long while so you can adjust mid-path instead of holding the stick every frame.
- **Stick deadzone** `0.18` (was `0.14`), exponent `1.4` (was `1.12`) so light pressure stays fine. Ring radius `70` px plus `28` px grab pad, bottom-left above the safe-area inset.
- **Facing** turns toward thrust at `6.8` rad/s (was `10`), then eases toward velocity at `2.4` rad/s (was `3.6`) while coasting.
- **Camera** follow lerp `0.07` (was `0.09`), look-ahead `88` px (was `72`).
- **Planets** bounce `0.68`, gravity mass `2.2e6`, cap `70` px/s², range `520`.
- **Energy** full tank `1`. Full stick drains at `0.4` /s (~2.5s empty). Regen `0.155` /s while not burning (~6.5s full). Empty = stick still moves, no burn. Bar sits under the safe area at the top; it flashes if you push on an empty tank.

Touch is first. Mouse drag on the same circle works for desktop.

## Out of scope (v0)

Menus, dialogue, characters, trading, a sun, or anything from lab-hitting / lab-play.
