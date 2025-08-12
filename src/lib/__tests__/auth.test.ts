import { test, expect, describe, beforeEach, vi } from "vitest";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

vi.mock("server-only", () => ({}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("jose", () => ({
  SignJWT: vi.fn(),
}));

import { createSession } from "@/lib/auth";

describe("createSession", () => {
  let mockCookieStore: {
    set: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockCookieStore = {
      set: vi.fn(),
    };
    
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);
  });

  test("creates a session with valid JWT token", async () => {
    const mockToken = "mock-jwt-token";
    const mockSign = vi.fn().mockResolvedValue(mockToken);
    const mockSetExpirationTime = vi.fn().mockReturnThis();
    const mockSetIssuedAt = vi.fn().mockReturnThis();
    const mockSetProtectedHeader = vi.fn().mockReturnThis();
    
    vi.mocked(SignJWT).mockImplementation(() => ({
      setProtectedHeader: mockSetProtectedHeader,
      setExpirationTime: mockSetExpirationTime,
      setIssuedAt: mockSetIssuedAt,
      sign: mockSign,
    } as any));

    const userId = "user-123";
    const email = "test@example.com";
    
    await createSession(userId, email);

    expect(SignJWT).toHaveBeenCalledWith(
      expect.objectContaining({
        userId,
        email,
        expiresAt: expect.any(Date),
      })
    );
    
    expect(mockSetProtectedHeader).toHaveBeenCalledWith({ alg: "HS256" });
    expect(mockSetExpirationTime).toHaveBeenCalledWith("7d");
    expect(mockSetIssuedAt).toHaveBeenCalled();
    expect(mockSign).toHaveBeenCalled();
  });

  test("sets cookie with correct options", async () => {
    const mockToken = "test-token";
    vi.mocked(SignJWT).mockImplementation(() => ({
      setProtectedHeader: vi.fn().mockReturnThis(),
      setExpirationTime: vi.fn().mockReturnThis(),
      setIssuedAt: vi.fn().mockReturnThis(),
      sign: vi.fn().mockResolvedValue(mockToken),
    } as any));

    await createSession("user-123", "test@example.com");

    expect(mockCookieStore.set).toHaveBeenCalledWith(
      "auth-token",
      mockToken,
      expect.objectContaining({
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        expires: expect.any(Date),
        path: "/",
      })
    );
  });

  test("sets secure cookie in production environment", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    
    vi.mocked(SignJWT).mockImplementation(() => ({
      setProtectedHeader: vi.fn().mockReturnThis(),
      setExpirationTime: vi.fn().mockReturnThis(),
      setIssuedAt: vi.fn().mockReturnThis(),
      sign: vi.fn().mockResolvedValue("token"),
    } as any));

    await createSession("user-123", "test@example.com");

    expect(mockCookieStore.set).toHaveBeenCalledWith(
      "auth-token",
      expect.any(String),
      expect.objectContaining({
        secure: true,
      })
    );
    
    process.env.NODE_ENV = originalEnv;
  });

  test("sets cookie expiration to 7 days from now", async () => {
    vi.mocked(SignJWT).mockImplementation(() => ({
      setProtectedHeader: vi.fn().mockReturnThis(),
      setExpirationTime: vi.fn().mockReturnThis(),
      setIssuedAt: vi.fn().mockReturnThis(),
      sign: vi.fn().mockResolvedValue("token"),
    } as any));

    const beforeTime = Date.now();
    await createSession("user-123", "test@example.com");
    const afterTime = Date.now();

    const [[, , cookieOptions]] = mockCookieStore.set.mock.calls;
    const expiresTime = cookieOptions.expires.getTime();
    
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    const expectedMinExpiration = beforeTime + sevenDaysInMs - 1000;
    const expectedMaxExpiration = afterTime + sevenDaysInMs + 1000;
    
    expect(expiresTime).toBeGreaterThanOrEqual(expectedMinExpiration);
    expect(expiresTime).toBeLessThanOrEqual(expectedMaxExpiration);
  });

  test("includes session payload in JWT", async () => {
    let capturedPayload: any;
    
    vi.mocked(SignJWT).mockImplementation((payload) => {
      capturedPayload = payload;
      return {
        setProtectedHeader: vi.fn().mockReturnThis(),
        setExpirationTime: vi.fn().mockReturnThis(),
        setIssuedAt: vi.fn().mockReturnThis(),
        sign: vi.fn().mockResolvedValue("token"),
      } as any;
    });

    const userId = "test-user-id";
    const email = "user@test.com";
    
    await createSession(userId, email);

    expect(capturedPayload).toMatchObject({
      userId,
      email,
      expiresAt: expect.any(Date),
    });
    
    const expiresAtTime = capturedPayload.expiresAt.getTime();
    const sevenDaysFromNow = Date.now() + (7 * 24 * 60 * 60 * 1000);
    expect(Math.abs(expiresAtTime - sevenDaysFromNow)).toBeLessThan(2000);
  });
});