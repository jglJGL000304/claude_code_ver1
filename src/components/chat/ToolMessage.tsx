"use client";

import { Loader2, FileText, FilePlus, FileEdit, Trash2 } from "lucide-react";

interface ToolInvocation {
  toolName: string;
  state: string;
  result?: any;
  args?: any;
}

interface ToolMessageProps {
  toolInvocation: ToolInvocation;
}

const getToolMessage = (toolName: string, args?: any): { icon: React.ReactNode; message: string } => {
  const fileName = args?.path ? args.path.split('/').pop() : null;
  
  switch (toolName) {
    case "str_replace_editor":
      return {
        icon: <FileEdit className="w-3 h-3" />,
        message: fileName ? `Editing ${fileName}...` : "Editing file..."
      };
    case "file_manager":
      if (args?.operation === "create") {
        return {
          icon: <FilePlus className="w-3 h-3" />,
          message: fileName ? `Creating ${fileName}...` : "Creating file..."
        };
      } else if (args?.operation === "delete") {
        return {
          icon: <Trash2 className="w-3 h-3" />,
          message: fileName ? `Deleting ${fileName}...` : "Deleting file..."
        };
      } else if (args?.operation === "read") {
        return {
          icon: <FileText className="w-3 h-3" />,
          message: fileName ? `Reading ${fileName}...` : "Reading file..."
        };
      }
      return {
        icon: <FileText className="w-3 h-3" />,
        message: "Managing files..."
      };
    default:
      return {
        icon: <FileText className="w-3 h-3" />,
        message: "Processing..."
      };
  }
};

const getCompletedMessage = (toolName: string, args?: any): string => {
  const fileName = args?.path ? args.path.split('/').pop() : null;
  
  switch (toolName) {
    case "str_replace_editor":
      return fileName ? `Edited ${fileName}` : "File edited";
    case "file_manager":
      if (args?.operation === "create") {
        return fileName ? `Created ${fileName}` : "File created";
      } else if (args?.operation === "delete") {
        return fileName ? `Deleted ${fileName}` : "File deleted";
      } else if (args?.operation === "read") {
        return fileName ? `Read ${fileName}` : "File read";
      }
      return "Files managed";
    default:
      return "Completed";
  }
};

export function ToolMessage({ toolInvocation }: ToolMessageProps) {
  const isCompleted = toolInvocation.state === "result" && toolInvocation.result;
  const { icon, message } = getToolMessage(toolInvocation.toolName, toolInvocation.args);
  const completedMessage = getCompletedMessage(toolInvocation.toolName, toolInvocation.args);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isCompleted ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-neutral-700">{completedMessage}</span>
        </>
      ) : (
        <>
          <div className="text-blue-600 animate-spin">
            <Loader2 className="w-3 h-3" />
          </div>
          <span className="text-neutral-700">{message}</span>
        </>
      )}
    </div>
  );
}