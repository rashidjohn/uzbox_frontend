"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry:     1,
            staleTime: 30_000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* ReactQueryDevtools faqat development da ko'rinadi */}
      {process.env.NODE_ENV === "development" && (
        <DevtoolsLazy queryClient={queryClient} />
      )}
    </QueryClientProvider>
  );
}

// Lazy import — production bundle ga kirmaydi
function DevtoolsLazy({ queryClient }: { queryClient: QueryClient }) {
  if (typeof window === "undefined") return null;
  // Dynamic import faqat dev da
  return null; // ReactQueryDevtools o'rnatilmagan bo'lsa null
}
