import { parseOpenClawLine } from "./openclaw.mjs";

// oh-my-pi (omp / omp-dev) writes pi-format session JSONL, the same shape OpenClaw uses
// (session / message / compaction / branch_summary). Reuse that parser, retag the events,
// and drop `custom` lines: omp emits one per tool execution, which is pure noise here.
export function parseOmpLine({ line, filePath }) {
    const event = parseOpenClawLine({ line, filePath });
    if (!event || event.eventType.startsWith("openclaw.custom.")) return null;
    // the daemon reads the project path from raw.cwd; OpenClaw's raw nests it under raw.session
    const cwd = event.raw?.session?.cwd;
    return {
        ...event,
        eventType: event.eventType.replace(/^openclaw\./, "omp."),
        ...(cwd ? { raw: { ...event.raw, cwd } } : {}),
    };
}
