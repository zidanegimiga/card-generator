import { describe, expect, it, vi } from "vitest";

import { requestBrandPull } from "./client";

function respond(status: number, body: unknown) {
  return vi.fn(
    async () =>
      new Response(typeof body === "string" ? body : JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" },
      }),
  ) as unknown as typeof fetch;
}

describe("requestBrandPull", () => {
  it("encodes the site into the query string", async () => {
    const fetchImpl = respond(200, { name: "Linear", domain: "linear.app" });

    await requestBrandPull("https://linear.app/?a=1&b=2", fetchImpl);

    expect(fetchImpl).toHaveBeenCalledWith(
      "/api/brand?url=https%3A%2F%2Flinear.app%2F%3Fa%3D1%26b%3D2",
    );
  });

  it("returns a validated brand and normalises its colour", async () => {
    const result = await requestBrandPull(
      "linear.app",
      respond(200, {
        name: "Linear",
        domain: "linear.app",
        primary: "#5E6AD2",
      }),
    );

    expect(result).toEqual({
      ok: true,
      brand: { name: "Linear", domain: "linear.app", primary: "#5e6ad2" },
    });
  });

  it("passes the server's error message through", async () => {
    const result = await requestBrandPull(
      "127.0.0.1",
      respond(422, { error: "That address isn't a public website." }),
    );

    expect(result).toEqual({
      ok: false,
      error: "That address isn't a public website.",
    });
  });

  it("rejects a success response with an unsafe logo URL", async () => {
    const result = await requestBrandPull(
      "x.com",
      respond(200, {
        name: "X",
        domain: "x.com",
        logoUrl: "javascript:alert(1)",
      }),
    );

    expect(result).toEqual({
      ok: false,
      error: "That brand couldn't be pulled.",
    });
  });

  it("handles a non-JSON error page", async () => {
    const result = await requestBrandPull(
      "x.com",
      respond(500, "<html>oops</html>"),
    );

    expect(result).toEqual({
      ok: false,
      error: "That brand couldn't be pulled.",
    });
  });

  it("handles being offline", async () => {
    const offline = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    }) as unknown as typeof fetch;

    expect(await requestBrandPull("x.com", offline)).toEqual({
      ok: false,
      error: "You seem to be offline. Try again.",
    });
  });
});
