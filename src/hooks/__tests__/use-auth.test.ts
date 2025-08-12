import { renderHook, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useAuth } from "../use-auth";
import { signIn as signInAction, signUp as signUpAction } from "@/actions";
import { getAnonWorkData, clearAnonWork } from "@/lib/anon-work-tracker";
import { getProjects } from "@/actions/get-projects";
import { createProject } from "@/actions/create-project";

// Mock the dependencies
vi.mock("next/navigation");
vi.mock("@/actions");
vi.mock("@/lib/anon-work-tracker");
vi.mock("@/actions/get-projects");
vi.mock("@/actions/create-project");

const mockPush = vi.fn();
const mockUseRouter = vi.mocked(useRouter);
const mockSignInAction = vi.mocked(signInAction);
const mockSignUpAction = vi.mocked(signUpAction);
const mockGetAnonWorkData = vi.mocked(getAnonWorkData);
const mockClearAnonWork = vi.mocked(clearAnonWork);
const mockGetProjects = vi.mocked(getProjects);
const mockCreateProject = vi.mocked(createProject);

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initialization", () => {
    it("should return the correct initial state", () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current).toEqual({
        signIn: expect.any(Function),
        signUp: expect.any(Function),
        isLoading: false,
      });
    });
  });

  describe("signIn - happy path", () => {
    it("should successfully sign in and handle post sign in with anonymous work", async () => {
      const mockProject = { id: "project-123" };
      const mockAnonWork = {
        messages: [{ id: "1", content: "Hello" }],
        fileSystemData: { "/test.tsx": "test content" },
      };

      mockSignInAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(mockAnonWork);
      mockCreateProject.mockResolvedValue(mockProject as any);

      const { result } = renderHook(() => useAuth());

      const signInResult = await result.current.signIn("test@example.com", "password123");

      expect(mockSignInAction).toHaveBeenCalledWith("test@example.com", "password123");
      expect(mockGetAnonWorkData).toHaveBeenCalled();
      expect(mockCreateProject).toHaveBeenCalledWith({
        name: expect.stringMatching(/^Design from \d{1,2}:\d{2}:\d{2}/),
        messages: mockAnonWork.messages,
        data: mockAnonWork.fileSystemData,
      });
      expect(mockClearAnonWork).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/project-123");
      expect(signInResult).toEqual({ success: true });
    });

    it("should successfully sign in and navigate to most recent project when no anonymous work", async () => {
      const mockProjects = [{ id: "project-456" }, { id: "project-789" }];

      mockSignInAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue(mockProjects as any);

      const { result } = renderHook(() => useAuth());

      const signInResult = await result.current.signIn("test@example.com", "password123");

      expect(mockGetProjects).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/project-456");
      expect(signInResult).toEqual({ success: true });
    });

    it("should successfully sign in and create new project when no projects exist", async () => {
      const mockNewProject = { id: "project-new" };

      mockSignInAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue([]);
      mockCreateProject.mockResolvedValue(mockNewProject as any);

      const { result } = renderHook(() => useAuth());

      const signInResult = await result.current.signIn("test@example.com", "password123");

      expect(mockCreateProject).toHaveBeenCalledWith({
        name: expect.stringMatching(/^New Design #\d+$/),
        messages: [],
        data: {},
      });
      expect(mockPush).toHaveBeenCalledWith("/project-new");
      expect(signInResult).toEqual({ success: true });
    });

    it("should handle anonymous work with empty messages correctly", async () => {
      const mockAnonWork = {
        messages: [],
        fileSystemData: { "/": {} },
      };
      const mockProjects = [{ id: "project-existing" }];

      mockSignInAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(mockAnonWork);
      mockGetProjects.mockResolvedValue(mockProjects as any);

      const { result } = renderHook(() => useAuth());

      await result.current.signIn("test@example.com", "password123");

      expect(mockCreateProject).not.toHaveBeenCalled();
      expect(mockGetProjects).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/project-existing");
    });
  });

  describe("signUp - happy path", () => {
    it("should successfully sign up and handle post sign in flow", async () => {
      const mockProject = { id: "project-signup" };

      mockSignUpAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue([]);
      mockCreateProject.mockResolvedValue(mockProject as any);

      const { result } = renderHook(() => useAuth());

      const signUpResult = await result.current.signUp("new@example.com", "password123");

      expect(mockSignUpAction).toHaveBeenCalledWith("new@example.com", "password123");
      expect(mockCreateProject).toHaveBeenCalledWith({
        name: expect.stringMatching(/^New Design #\d+$/),
        messages: [],
        data: {},
      });
      expect(mockPush).toHaveBeenCalledWith("/project-signup");
      expect(signUpResult).toEqual({ success: true });
    });
  });

  describe("loading state management", () => {
    it("should set isLoading to true during signIn and reset on success", async () => {
      mockSignInAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue([{ id: "project-123" }] as any);

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);

      const signInPromise = result.current.signIn("test@example.com", "password123");

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await signInPromise;

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it("should set isLoading to true during signUp and reset on success", async () => {
      mockSignUpAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue([]);
      mockCreateProject.mockResolvedValue({ id: "project-123" } as any);

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);

      const signUpPromise = result.current.signUp("new@example.com", "password123");

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await signUpPromise;

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("error handling", () => {
    it("should handle signIn failure and reset loading state", async () => {
      const errorResult = { success: false, error: "Invalid credentials" };
      mockSignInAction.mockResolvedValue(errorResult);

      const { result } = renderHook(() => useAuth());

      const signInResult = await result.current.signIn("test@example.com", "wrongpassword");

      expect(result.current.isLoading).toBe(false);
      expect(signInResult).toEqual(errorResult);
      expect(mockGetAnonWorkData).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("should handle signUp failure and reset loading state", async () => {
      const errorResult = { success: false, error: "Email already exists" };
      mockSignUpAction.mockResolvedValue(errorResult);

      const { result } = renderHook(() => useAuth());

      const signUpResult = await result.current.signUp("existing@example.com", "password123");

      expect(result.current.isLoading).toBe(false);
      expect(signUpResult).toEqual(errorResult);
      expect(mockGetAnonWorkData).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("should reset loading state even when signIn action throws", async () => {
      mockSignInAction.mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useAuth());

      await expect(result.current.signIn("test@example.com", "password123")).rejects.toThrow("Network error");

      expect(result.current.isLoading).toBe(false);
    });

    it("should reset loading state even when signUp action throws", async () => {
      mockSignUpAction.mockRejectedValue(new Error("Database error"));

      const { result } = renderHook(() => useAuth());

      await expect(result.current.signUp("test@example.com", "password123")).rejects.toThrow("Database error");

      expect(result.current.isLoading).toBe(false);
    });

    it("should handle errors in handlePostSignIn gracefully", async () => {
      mockSignInAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockRejectedValue(new Error("Database connection failed"));

      const { result } = renderHook(() => useAuth());

      await expect(result.current.signIn("test@example.com", "password123")).rejects.toThrow("Database connection failed");

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle concurrent signIn calls correctly", async () => {
      mockSignInAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue([{ id: "project-123" }] as any);

      const { result } = renderHook(() => useAuth());

      // Start two concurrent signIn calls
      const promise1 = result.current.signIn("test1@example.com", "password123");
      const promise2 = result.current.signIn("test2@example.com", "password456");

      await Promise.all([promise1, promise2]);

      // Both should have been called
      expect(mockSignInAction).toHaveBeenCalledTimes(2);
      expect(mockSignInAction).toHaveBeenCalledWith("test1@example.com", "password123");
      expect(mockSignInAction).toHaveBeenCalledWith("test2@example.com", "password456");
    });

    it("should handle anonymous work data parsing errors", async () => {
      mockSignInAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(null); // Simulates parsing error in anon-work-tracker
      mockGetProjects.mockResolvedValue([{ id: "project-fallback" }] as any);

      const { result } = renderHook(() => useAuth());

      await result.current.signIn("test@example.com", "password123");

      expect(mockGetProjects).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/project-fallback");
    });

    it("should handle project creation failure during anonymous work migration", async () => {
      const mockAnonWork = {
        messages: [{ id: "1", content: "Hello" }],
        fileSystemData: { "/test.tsx": "test content" },
      };

      mockSignInAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(mockAnonWork);
      mockCreateProject.mockRejectedValue(new Error("Failed to create project"));

      const { result } = renderHook(() => useAuth());

      await expect(result.current.signIn("test@example.com", "password123")).rejects.toThrow("Failed to create project");

      expect(mockCreateProject).toHaveBeenCalledWith({
        name: expect.stringMatching(/^Design from \d{1,2}:\d{2}:\d{2}/),
        messages: mockAnonWork.messages,
        data: mockAnonWork.fileSystemData,
      });
      expect(result.current.isLoading).toBe(false);
    });

    it("should generate unique project names for new designs", async () => {
      mockSignInAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue([]);
      mockCreateProject.mockResolvedValue({ id: "project-123" } as any);

      // Mock Math.random to return a consistent value
      const originalMathRandom = Math.random;
      Math.random = vi.fn().mockReturnValue(0.12345);

      const { result } = renderHook(() => useAuth());

      await result.current.signIn("test@example.com", "password123");

      expect(mockCreateProject).toHaveBeenCalledWith({
        name: "New Design #12345",
        messages: [],
        data: {},
      });

      // Restore Math.random
      Math.random = originalMathRandom;
    });

    it("should handle router navigation failure", async () => {
      mockSignInAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue([{ id: "project-123" }] as any);
      mockPush.mockImplementation(() => {
        throw new Error("Navigation failed");
      });

      const { result } = renderHook(() => useAuth());

      await expect(result.current.signIn("test@example.com", "password123")).rejects.toThrow("Navigation failed");

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("integration scenarios", () => {
    it("should handle the complete flow from anonymous user to authenticated with project creation", async () => {
      const mockAnonWork = {
        messages: [
          { id: "1", content: "Create a button component" },
          { id: "2", content: "Make it blue" },
        ],
        fileSystemData: {
          "/": {},
          "/Button.tsx": "export default function Button() { return <button>Click me</button>; }",
        },
      };
      const mockProject = { id: "migrated-project-123" };

      mockSignInAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(mockAnonWork);
      mockCreateProject.mockResolvedValue(mockProject as any);

      const { result } = renderHook(() => useAuth());

      const signInResult = await result.current.signIn("user@example.com", "securepassword");

      // Verify the complete flow
      expect(mockSignInAction).toHaveBeenCalledWith("user@example.com", "securepassword");
      expect(mockGetAnonWorkData).toHaveBeenCalled();
      expect(mockCreateProject).toHaveBeenCalledWith({
        name: expect.stringMatching(/^Design from \d{1,2}:\d{2}:\d{2}/),
        messages: mockAnonWork.messages,
        data: mockAnonWork.fileSystemData,
      });
      expect(mockClearAnonWork).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/migrated-project-123");
      expect(signInResult).toEqual({ success: true });
      expect(result.current.isLoading).toBe(false);
    });

    it("should handle sign up for new user with no existing projects", async () => {
      const mockNewProject = { id: "first-project-456" };

      mockSignUpAction.mockResolvedValue({ success: true });
      mockGetAnonWorkData.mockReturnValue(null);
      mockGetProjects.mockResolvedValue([]);
      mockCreateProject.mockResolvedValue(mockNewProject as any);

      const { result } = renderHook(() => useAuth());

      const signUpResult = await result.current.signUp("newuser@example.com", "strongpassword123");

      expect(mockSignUpAction).toHaveBeenCalledWith("newuser@example.com", "strongpassword123");
      expect(mockGetAnonWorkData).toHaveBeenCalled();
      expect(mockGetProjects).toHaveBeenCalled();
      expect(mockCreateProject).toHaveBeenCalledWith({
        name: expect.stringMatching(/^New Design #\d+$/),
        messages: [],
        data: {},
      });
      expect(mockPush).toHaveBeenCalledWith("/first-project-456");
      expect(signUpResult).toEqual({ success: true });
      expect(result.current.isLoading).toBe(false);
    });
  });
});