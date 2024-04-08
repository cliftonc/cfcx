import { env, createExecutionContext, waitOnExecutionContext, SELF } from "cloudflare:test";
import { describe, it, expect } from "vitest";
import worker from "../src";

describe("Hello World worker", () => {
  it("responds with Hello World! (unit style)", async () => {
    const request = new Request("http://localhost:8787");
    // Create an empty context to pass to `worker.fetch()`.
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, env, ctx);
    // Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
    await waitOnExecutionContext(ctx);
    const responseText = await response.text()    
    console.log(responseText)
    expect(responseText).toContain(`HELLO WORLD!`);
  });

  it("adds via request (integration style)", async () => {
    const response = await SELF.fetch("http://localhost:8787/");
    const responseText = await response.text()    
    expect(responseText).toContain(`HELLO WORLD!`);
  });
});
