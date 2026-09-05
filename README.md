# lab-thrust

Mobile ship-feel POC. Open it, drag the stick, close it. Feel is the whole product for v0.

One ship, one virtual joystick (direction = thrust, how hard you push = how hard you thrust), two or three planets as scenery. No menus, no sun, no characters, no trading.

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

Tunables live in `src/feel.ts`. Current v0:

- **Thrust accel** `580` px/s² at full stick. Direction matches the stick; magnitude is remapped after the deadzone.
- **Max speed** `340` px/s. Caps the rush without killing a hard push.
- **Drag** `42` px/s² linear. Release and you still coast for a few seconds; not ice-rink, not brakes.
- **Stick deadzone** `0.14`, then a light `1.12` exponent so the first third of the pad is finer. Ring radius `70` px plus `28` px grab pad, parked in the bottom-left above the safe-area inset.
- **Facing** turns toward thrust at `10` rad/s while you push, then eases toward velocity at `3.6` rad/s when you let go (only if you are still moving).
- **Camera** follow lerp `0.09`, plus up to `72` px of look-ahead along velocity.
- **Planets** are circle bodies with bounce `0.72` and a cheap inverse-square tug (mass `2.4e6`, cap `88` px/s², range `520`). The stick always wins.

Touch is first. Mouse drag on the same circle works for desktop.

## Out of scope (v0)

Menus, dialogue, characters, trading, a sun, or anything from lab-hitting / lab-play.
