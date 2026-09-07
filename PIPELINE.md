# lab-thrust pipeline

**Status: PARKED.** Docs-only PRs are OK. No new gameplay, feel tuning, playtests, deploys, or staff feature work until Nye or Nyborg reopen this track.

| Role | Who |
| --- | --- |
| Owner | Crucible |
| Lead | Forge |
| CoS | Nyborg |
| Merge | Nye |

Crucible owns the Phaser track. Nye merges.

## Stack

Phaser 4 + Vite + TypeScript + Vercel (static `dist` from `npm run build`). Arcade physics. Graphics are generated at runtime — no image assets.

Verified in this repo: `phaser` `^4.2.1`, Vite `^7.1.5`, TypeScript `^5.9.2`. Config: `vite.config.ts`, `tsconfig.json`, `vercel.json`.

## Primary GitHub

https://github.com/NyeGuy/lab-thrust

This is the only public remote for this POC. Do not invent other remotes.

## Active restore

The playable POC lives on **PR #1** (`cursor/mobile-ship-feel-bba3` → `main`):

https://github.com/NyeGuy/lab-thrust/pull/1

Stack docs and follow-up work on that restore branch so they land with the active POC. `main` is still the initial commit until Nye merges PR #1.

## SSO preview

https://lab-thrust-protostar1.vercel.app

Vercel Authentication / SSO may gate this URL. Treat a login wall or 403 as expected, not as a missing deploy.

## Local run / build

```bash
npm install
npm run dev      # typically http://localhost:5173 (Vite; host: true, LAN URL printed)
npm run build    # tsc --noEmit, then Vite → dist/
npm run preview
```

A phone on the same network can use the LAN URL Vite lists.

## Feel tunables

All v0 feel knobs live in **`src/feel.ts`** (`FEEL`). Do not scatter magic numbers into scenes while this track is parked — and do not retune them until the track is reopened.

Related POC notes (not pipeline): `STORIES.md`.

## Cursor cloud-agent workflow

- Use Cursor cloud agents for repo PRs on https://github.com/NyeGuy/lab-thrust.
- Open stacked PRs against the active restore branch (`cursor/mobile-ship-feel-bba3`) unless Nye says otherwise.
- Nye merges. Agents do not merge.
- Crucible owns the Phaser track and reviews scope against this file and `AGENTS.md`.

## Park rules

**Both Protostar and lab-thrust stay parked unless Nye or Nyborg reopen.**

While parked:

- Docs-only PRs are OK (this file, `README.md`, `AGENTS.md`, similar markdown).
- No new gameplay features.
- No feel tuning or playtests.
- No deploys or staff feature work.
- No “just a small tweak” in `src/`.

When Nye or Nyborg reopen, follow this pipeline again; do not assume the park is lifted from a side conversation.

## Protostar local (no public remote)

The canon Protostar game lives with **Nye locally**. There is **no public GitHub remote** for it yet.

- Do **not** invent, guess, or link a `protostar-game` (or similar) GitHub repo.
- When Nye opens a remote, Crucible will wire it into this pipeline.
- Until then Protostar is **paused and local-only**.

## Out of scope

- Satellite Lab site
- Baseball / lab-hitting / lab-play
- Protostar characters, dialogue, trade, or menus (beyond this mobile ship-feel POC)
- A third planet, or anything that turns this stick+ship sandbox into a game shell
