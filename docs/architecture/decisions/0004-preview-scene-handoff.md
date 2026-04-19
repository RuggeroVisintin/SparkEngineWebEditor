# 4. Preview scene handoff between editor and preview tab

Date: 2026-04-18

## Status

Accepted

## Context

Issue [#365](https://github.com/RuggeroVisintin/SparkEngineWebEditor/issues/365) requires preview mode to start from the current scene selected in the editor.

Preview is opened in a separate browser tab/window. This means runtime state in the editor tab cannot be shared by reference with the preview tab.

For this first iteration, we want the simplest possible implementation with minimal moving parts.

### Evaluated options

1) `postMessage` handshake between opener and preview (selected)

- Description: open preview and exchange scene payload via `window.postMessage` after a ready/ack handshake.
- Why considered: simple cross-tab handoff without URL payloads or storage dependencies.
- Tradeoffs: requires small handshake logic and depends on opener availability.

2) `sessionStorage` transfer

- Description: store scene JSON in `sessionStorage` with a generated `transferId`, then open preview with the id.
- Why considered: straightforward handoff model and easy local debugging.
- Tradeoffs: constrained by storage quota and tied to browser session behavior.

3) IndexedDB snapshot fallback (or primary)

- Description: persist scene snapshots in IndexedDB and pass only a transfer key in the preview URL.
- Why considered: more robust for larger payloads and opener-unavailable scenarios.
- Tradeoffs: higher complexity due to persistence lifecycle, cleanup policy, and additional abstraction.

4) URL payload transfer

- Description: serialize scene JSON to string and pass it in the preview URL payload.
- Why considered: very simple to wire and easy to debug.
- Tradeoffs: constrained by URL length limits and can expose scene data in browser history.

For this ADR, option 1 is intentionally selected as a V1 strategy to optimize for delivery speed and reduced implementation risk.

## Decision

We will use a naive transport strategy for scene handoff by serializing the scene into a json string

### Guardrails for this iteration

1) Store only scene JSON payloads (never class instances)

2) Keep message payload to scene JSON string only

3) Validate `origin` and payload before scene startup

## Consequences

👍 Very low implementation complexity and fast delivery

👍 Minimal code surface and low initial maintenance cost

👍 Easy to reason about during early validation

👎 Handshake can fail when opener is unavailable (direct open/refresh)

👎 Can still be sensitive to very large payload performance

👎 Will likely require a follow-up evolution to a more robust transport when scale increases
