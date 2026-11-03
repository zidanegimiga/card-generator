// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

import { pullBrand } from "@/lib/brand-pull/pull-brand";

import { GET } from "./route";

vi.mock("@/lib/brand-pull/pull-brand", () => ({ pullBrand: vi.fn() }));

const mockPull = vi.mocked(pullBrand);

function get(query: string) {
  return GET(new Request(`http://localhost/api/brand${query}`));
}

describe("GET /api/brand", () => {
  beforeEach(() => mockPull.mockReset());

  it("rejects a missing url", async () => {
    const response = await get("");

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Enter a website address.",
    });
    expect(mockPull).not.toHaveBeenCalled();
  });

  it("rejects an absurdly long url before doing any work", async () => {
    const response = await get(`?url=${"a".repeat(3000)}.com`);

    expect(response.status).toBe(400);
    expect(mockPull).not.toHaveBeenCalled();
  });

  it("returns the brand with a CDN cache header", async () => {
    const brand = { name: "Linear", domain: "linear.app", primary: "#5e6ad2" };
    mockPull.mockResolvedValue({ ok: true, brand });

    const response = await get("?url=linear.app");

    expect(mockPull).toHaveBeenCalledWith("linear.app");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(brand);
    expect(response.headers.get("cache-control")).toContain("s-maxage=86400");
  });

  it("passes refusals through with their status", async () => {
    mockPull.mockResolvedValue({
      ok: false,
      status: 422,
      error: "That address isn't a public website.",
    });

    const response = await get("?url=127.0.0.1");

    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({
      error: "That address isn't a public website.",
    });
    expect(response.headers.get("cache-control")).toBeNull();
  });
});
