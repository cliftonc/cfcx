import { env, createExecutionContext, waitOnExecutionContext, SELF } from "cloudflare:test";
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import worker from "../src";
import { fetchMock } from "cloudflare:test";

describe("Hello World worker", () => {
  
  beforeEach(() => {
    fetchMock.activate();
    fetchMock.disableNetConnect();
    fetchMock
      .get("http://localhost:8787")
      .intercept({ path: "/example/backend" })
      .reply(200, "<h1>HELLO WORLD!</h1>");
  });
  afterAll(() => fetchMock.assertNoPendingInterceptors());

  it("responds with Hello World! (unit style)", async () => {
    const request = new Request("http://localhost:8787");
    // Create an empty context to pass to `worker.fetch()`.
    const ctx = createExecutionContext();
    const response = await worker.fetch(request, env, ctx);
    // Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
    await waitOnExecutionContext(ctx);
    const responseText = await response.text()    
    expect(responseText).toContain(`HELLO WORLD!`);
  });

  it("adds via request (integration style)", async () => {
    const response = await SELF.fetch("http://localhost:8787/");
    const responseText = await response.text()        
    expect(responseText).toContain(`HELLO WORLD!`);
  });
});
