import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { parseOmpLine } from "../../src/agents/omp.mjs";

const filePath = "/h/.omp/agent/sessions/-proj/2026-10-14T14-16-24-046Z_01a13ac5-7eee-716d-8f2c-dccb9db20b86.jsonl";
const parse = (obj) => parseOmpLine({ line: JSON.stringify(obj), filePath });

describe("parseOmpLine — oh-my-pi session format", () => {
    it("tags the session line and exposes cwd as raw.cwd", () => {
        const r = parse({ type: "session", id: "01a13ac5-7eee-716d-8f2c-dccb9db20b86", cwd: "/work/app", timestamp: "2026-10-14T14:16:24.046Z" });
        assert.equal(r.eventType, "omp.session");
        assert.equal(r.sessionId, "01a13ac5-7eee-716d-8f2c-dccb9db20b86");
        assert.equal(r.raw.cwd, "/work/app");
    });

    it("keeps one sessionId for entry lines (entry ids must not leak in)", () => {
        const r = parse({ type: "message", id: "8e819d41", message: { role: "user", content: [{ type: "text", text: "oi" }] } });
        assert.equal(r.eventType, "omp.user");
        assert.equal(r.kind, "user");
        assert.equal(r.sessionId, "01a13ac5-7eee-716d-8f2c-dccb9db20b86");
    });

    it("drops per-tool custom events and unknown entry types", () => {
        assert.equal(parse({ type: "custom", customType: "tool_execution_start", data: {} }), null);
        assert.equal(parse({ type: "model_usage", id: "x" }), null);
    });
});
