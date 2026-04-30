import { lazy, Suspense, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

// Lazy/client-only loader — leaflet touches window at import time.
const LeakMapInner = lazy(() =>
  import("./LeakMap").then((m) => ({ default: m.LeakMap })),
);

export function LeakMapClient(props: React.ComponentProps<typeof LeakMapInner>) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      }
    >
      <LeakMapInner {...props} />
    </Suspense>
  );
}
