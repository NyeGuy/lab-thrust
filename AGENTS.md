# Agent guidance — lab-thrust

Cursor agents working this repo: read this file and `PIPELINE.md` before changing anything.

## Park (current)

**This track is PARKED.** Both **lab-thrust** and **Protostar** stay parked unless **Nye** or **Nyborg** reopen.

While parked:

- **Docs-only.** Markdown updates are OK. No `src/` gameplay, no feel tuning, no playtests, no deploys, no staff feature work.
- Do not “fix” or retune the POC unless the reopen is explicit in the task.
- If a prompt asks for features, playtests, or deploys, stop and say the track is parked.

## Ownership

| Role | Who |
| --- | --- |
| Owner | Crucible |
| Lead | Forge |
| CoS | Nyborg |
| Merge | Nye |

Crucible owns the Phaser track. **Nye merges.** Agents open PRs; they do not merge.

## Stack

Phaser 4 + Vite + TypeScript + Vercel. Primary GitHub: https://github.com/NyeGuy/lab-thrust. Active restore: PR #1, branch `cursor/mobile-ship-feel-bba3`.

Local: `npm install`, `npm run dev` (typically `http://localhost:5173`), `npm run build`, `npm run preview`.

## Feel tunables

v0 knobs live in **`src/feel.ts`**. Do not retune them while parked. Do not invent a second tunables file.

## Do not touch

- Satellite Lab site
- Baseball / lab-hitting / lab-play
- Protostar characters, dialogue, trade, menus, or canon (this repo is a mobile ship-feel POC only)

## Protostar remotes

The canon Protostar game is **Nye-local**. There is **no public GitHub remote** yet. **Do not invent or link fake Protostar repos.** When Nye opens a remote, Crucible will wire it.

## PRs

- Stack on `cursor/mobile-ship-feel-bba3` so work lands with the active POC.
- Title and body must say **docs-only** and **parked** when that is the work.
- Verify paths against the repo. Do not invent files or remotes.
