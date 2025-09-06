import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Dialog } from "@radix-ui/react-dialog";
import { ChevronDown, ExternalLink } from "lucide-react";
import React, { useEffect, useState } from "react";

type SyncError = {
  error: string;
  stack: string;
  filename: string;
  lineno: number;
  colno: number;
};

type AsyncError = {
  error: string;
  stack: string;
};

type GenericError = SyncError | AsyncError;

async function reportErrorToVly(errorData: {
  error: string;
  stackTrace?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
}) {
  if (!import.meta.env.VITE_VLY_APP_ID) {
    return;
  }

  try {
    await fetch(import.meta.env.VITE_VLY_MONITORING_URL, {
      method: "POST",
      body: JSON.stringify({
        ...errorData,
        url: window.location.href,
        projectSemanticIdentifier: import.meta.env.VITE_VLY_APP_ID,
      }),
    });
  } catch (error) {
    console.error("Failed to report error to Vly:", error);
  }
}

const shouldShowOverlay =
  Boolean(import.meta.env.VITE_VLY_APP_ID) ||
  (import.meta.env.VITE_ENABLE_VLY_TOOLBAR as string) === "true";

function ErrorDialog({
  error,
  setError,
}: {
  error: GenericError;
  setError: (error: GenericError | null) => void;
}) {
  return (
    <Dialog
      defaultOpen={true}
      onOpenChange={() => {
        setError(null);
      }}
    >
      <DialogContent className="bg-red-700 text-white max-w-4xl">
        <DialogHeader>
          <DialogTitle>Runtime Error</DialogTitle>
        </DialogHeader>
        A runtime error occurred. Open the vly editor to automatically debug the
        error.
        <div className="mt-4">
          <Collapsible>
            <CollapsibleTrigger>
              <div className="flex items-center font-bold cursor-pointer">
                See error details <ChevronDown />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="max-w-[460px]">
              <div className="mt-2 p-3 bg-neutral-800 rounded text-white text-sm overflow-x-auto max-h-60 max-w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <pre className="whitespace-pre">{error.stack}</pre>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <DialogFooter>
          <a
            href={`https://vly.ai/project/${import.meta.env.VITE_VLY_APP_ID}`}
            target="_blank"
          >
            <Button>
              <ExternalLink /> Open editor
            </Button>
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type ErrorBoundaryState = {
  hasError: boolean;
  error: GenericError | null;
};

class ErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
  },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError() {
    // Only mark as error when overlay is enabled; otherwise, allow UI to render
    return { hasError: shouldShowOverlay ? true : false };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Add verbose logs to surface the actual error in the console
    console.error("[ErrorBoundary] Runtime error caught:", error);
    console.error("[ErrorBoundary] Component stack:", info.componentStack);

    reportErrorToVly({
      error: error.message,
      stackTrace: error.stack,
    }).catch((e) => {
      console.error("[ErrorBoundary] Failed to report error to Vly:", e);
    });

    // Only set error state to show overlay when enabled; otherwise do NOT blank the UI
    if (shouldShowOverlay) {
      this.setState({
        hasError: true,
        error: {
          error: error.message,
          stack: info.componentStack ?? error.stack ?? "",
        },
      });
    } else {
      // Ensure boundary doesn't blank the screen when overlay is disabled
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError && shouldShowOverlay) {
      return (
        <ErrorDialog
          error={{
            error: "An error occurred",
            stack: this.state.error?.stack ?? "",
          }}
          setError={() => {}}
        />
      );
    }

    // In all other cases, keep the app visible
    return this.props.children;
  }
}

export function InstrumentationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [error, setError] = useState<GenericError | null>(null);

  useEffect(() => {
    const handleError = async (event: ErrorEvent) => {
      try {
        // Only hijack the browser default overlay when enabled
        if (shouldShowOverlay) {
          event.preventDefault();
        }
        setError({
          error: event.message,
          stack: event.error?.stack || "",
          filename: event.filename || "",
          lineno: event.lineno,
          colno: event.colno,
        });

        if (import.meta.env.VITE_VLY_APP_ID) {
          await reportErrorToVly({
            error: event.message,
            stackTrace: event.error?.stack,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          });
        }
      } catch (error) {
        console.error("Error in handleError:", error);
      }
    };

    const handleRejection = async (event: PromiseRejectionEvent) => {
      try {
        if (import.meta.env.VITE_VLY_APP_ID) {
          await reportErrorToVly({
            error: event.reason?.message ?? String(event.reason),
            stackTrace: event.reason?.stack,
          });
        }
        // Only show overlay when enabled
        if (shouldShowOverlay) {
          setError({
            error: event.reason?.message ?? "Unhandled promise rejection",
            stack: event.reason?.stack ?? "",
          });
        }
      } catch (error) {
        console.error("Error in handleRejection:", error);
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return (
    <>
      <ErrorBoundary>{children}</ErrorBoundary>
      {/* Only render the dialog when explicitly enabled */}
      {error && shouldShowOverlay && (
        <ErrorDialog error={error} setError={setError} />
      )}
    </>
  );
}