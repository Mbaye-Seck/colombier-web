import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";

export function AppProviders({ client, children }: { client: QueryClient; children: ReactNode }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </Provider>
  );
}
