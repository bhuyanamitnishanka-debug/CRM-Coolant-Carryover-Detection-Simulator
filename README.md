# CRM Coolant Carryover Detection Simulator

A browser-based concept simulator for exploring residual coolant carryover on high-speed cold-rolling lines. It models seven-zone SWIR and capacitive telemetry with simulated air-knife responses.

**Tata InnoVerse context:** An independent concept demonstration, not an official Tata product or endorsement.

## Live demo

[Open the live interactive simulator](https://bhuyanamitnishanka-debug.github.io/CRM-Coolant-Carryover-Detection-Simulator/)

## Run locally

Requires [Bun](https://bun.sh/).

```sh
bun install --frozen-lockfile
bun run dev
```

Vite serves the app at `http://localhost:3000`. To build the site, run `bun run build`; `bun run lint` checks TypeScript.

## Limitations

Telemetry and Edge-AI/closed-loop values are illustrative local simulations, not live sensor readings or actual inference. The app does not connect to mill equipment, PLCs, or MES systems and is not a certified control system.
