// Image imports (`import logo from "@/assets/channels/x.png"`) for a plain `tsc`: next-env.d.ts declares them,
// but it is git-ignored and only written by `next dev`/`next build`, so the agent-merge typecheck failed on
// the channel logos (2026-11-19, the dashboard agent's merge was blocked).
/// <reference types="next/image-types/global" />
