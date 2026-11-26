import { describe, it, expect, vi, beforeEach } from "vitest";
import api from "../api/axios";
import refreshAxios from "../api/refreshAxios";
import { tokenStore } from "../api/tokenStore";

vi.mock("../api/refreshAxios", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("Phase 6 — Axios Interceptor Refresh Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tokenStore.set(null);
  });

  it("attaches Authorization header when tokenStore has an access token", () => {
    tokenStore.set("initial-access-token");

    const requestHandler = api.interceptors.request.handlers[0].fulfilled;
    const config = requestHandler({ headers: {} });

    expect(config.headers.Authorization).toBe("Bearer initial-access-token");
  });

  it("refreshes token on 401, updates tokenStore, and retries original request", async () => {
    refreshAxios.post.mockResolvedValueOnce({
      data: { accessToken: "fresh-access-token" },
    });

    const mockAdapter = vi.fn().mockResolvedValueOnce({
      status: 200,
      data: { ok: true },
    });
    api.defaults.adapter = mockAdapter;

    const responseErrorHandler = api.interceptors.response.handlers[0].rejected;
    const originalRequest = {
      url: "/room",
      headers: {},
    };

    const result = await responseErrorHandler({
      response: { status: 401 },
      config: originalRequest,
    });

    expect(refreshAxios.post).toHaveBeenCalledWith("/auth/refresh");
    expect(tokenStore.get()).toBe("fresh-access-token");
    expect(originalRequest._retry).toBe(true);
    expect(originalRequest.headers.Authorization).toBe("Bearer fresh-access-token");
    expect(mockAdapter).toHaveBeenCalledTimes(1);
    expect(result.data).toEqual({ ok: true });
  });

  it("does not retry when _retry is already true or URL is /auth/login or /auth/refresh", async () => {
    const responseErrorHandler = api.interceptors.response.handlers[0].rejected;

    await expect(
      responseErrorHandler({
        response: { status: 401 },
        config: { url: "/room", _retry: true, headers: {} },
      })
    ).rejects.toBeDefined();

    await expect(
      responseErrorHandler({
        response: { status: 401 },
        config: { url: "/auth/login", headers: {} },
      })
    ).rejects.toBeDefined();

    await expect(
      responseErrorHandler({
        response: { status: 401 },
        config: { url: "/auth/refresh", headers: {} },
      })
    ).rejects.toBeDefined();

    expect(refreshAxios.post).not.toHaveBeenCalled();
  });

  it("clears tokenStore when refresh fails", async () => {
    tokenStore.set("stale-token");
    refreshAxios.post.mockRejectedValueOnce(new Error("Refresh expired"));

    const responseErrorHandler = api.interceptors.response.handlers[0].rejected;

    await expect(
      responseErrorHandler({
        response: { status: 401 },
        config: { url: "/room", headers: {} },
      })
    ).rejects.toThrow("Refresh expired");

    expect(tokenStore.get()).toBeNull();
  });
});

