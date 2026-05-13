import { createRouter } from "@tanstack/react-router";
import { createQueryClient } from "@/app/query-client";
import { routeTree } from "./routeTree.gen";
import { store } from "@/store";
import { selectIsAuthenticated } from "@/store/slices/authSlice";

export type RouterContext = {
  queryClient: ReturnType<typeof createQueryClient>;
  isAuthenticated: boolean;
};

export const getRouter = () => {
  const queryClient = createQueryClient();

  const router = createRouter({
    routeTree,
    context: {
      queryClient,
      get isAuthenticated() {
        return selectIsAuthenticated(store.getState());
      },
    },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
