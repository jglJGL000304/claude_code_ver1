import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolMessage } from "../ToolMessage";

afterEach(() => {
  cleanup();
});

describe("ToolMessage", () => {
  describe("str_replace_editor tool", () => {
    it("should display editing message when in progress", () => {
      const toolInvocation = {
        toolName: "str_replace_editor",
        state: "pending",
      };

      render(<ToolMessage toolInvocation={toolInvocation} />);
      
      expect(screen.getByText("Editing file...")).toBeDefined();
    });

    it("should display completed message when finished", () => {
      const toolInvocation = {
        toolName: "str_replace_editor",
        state: "result",
        result: true,
      };

      render(<ToolMessage toolInvocation={toolInvocation} />);
      
      expect(screen.getByText("File edited")).toBeDefined();
    });
  });

  describe("file_manager tool", () => {
    it("should display create message for create operation", () => {
      const toolInvocation = {
        toolName: "file_manager",
        state: "pending",
        args: {
          operation: "create",
          path: "Component.jsx",
        },
      };

      render(<ToolMessage toolInvocation={toolInvocation} />);
      
      expect(screen.getByText("Creating Component.jsx...")).toBeDefined();
    });

    it("should display delete message for delete operation", () => {
      const toolInvocation = {
        toolName: "file_manager",
        state: "pending",
        args: {
          operation: "delete",
          path: "OldComponent.jsx",
        },
      };

      render(<ToolMessage toolInvocation={toolInvocation} />);
      
      expect(screen.getByText("Deleting OldComponent.jsx...")).toBeDefined();
    });

    it("should display read message for read operation", () => {
      const toolInvocation = {
        toolName: "file_manager",
        state: "pending",
        args: {
          operation: "read",
          path: "config.json",
        },
      };

      render(<ToolMessage toolInvocation={toolInvocation} />);
      
      expect(screen.getByText("Reading config.json...")).toBeDefined();
    });

    it("should display completed create message", () => {
      const toolInvocation = {
        toolName: "file_manager",
        state: "result",
        result: true,
        args: {
          operation: "create",
          path: "NewFile.tsx",
        },
      };

      render(<ToolMessage toolInvocation={toolInvocation} />);
      
      expect(screen.getByText("Created NewFile.tsx")).toBeDefined();
    });
  });

  describe("unknown tool", () => {
    it("should display generic message for unknown tools", () => {
      const toolInvocation = {
        toolName: "unknown_tool",
        state: "pending",
      };

      render(<ToolMessage toolInvocation={toolInvocation} />);
      
      expect(screen.getByText("Processing...")).toBeDefined();
    });

    it("should display generic completed message for unknown tools", () => {
      const toolInvocation = {
        toolName: "unknown_tool",
        state: "result",
        result: true,
      };

      render(<ToolMessage toolInvocation={toolInvocation} />);
      
      expect(screen.getByText("Completed")).toBeDefined();
    });
  });

  describe("visual indicators", () => {
    it("should show spinning loader when in progress", () => {
      const toolInvocation = {
        toolName: "str_replace_editor",
        state: "pending",
      };

      const { container } = render(<ToolMessage toolInvocation={toolInvocation} />);
      
      const loader = container.querySelector(".animate-spin");
      expect(loader).toBeDefined();
    });

    it("should show green dot when completed", () => {
      const toolInvocation = {
        toolName: "str_replace_editor",
        state: "result",
        result: true,
      };

      const { container } = render(<ToolMessage toolInvocation={toolInvocation} />);
      
      const successDot = container.querySelector(".bg-emerald-500");
      expect(successDot).toBeDefined();
    });
  });
});