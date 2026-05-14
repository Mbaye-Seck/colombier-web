import { baseApi } from "@/store/baseApi";
import type { Notification } from "@/services/mock/notifications";
import { getMockNotifications } from "@/services/mock/notifications";

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getNotifications: build.query<Notification[], void>({
      queryFn: () => ({ data: getMockNotifications() }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Notification" as const, id })),
              { type: "Notification", id: "LIST" },
            ]
          : [{ type: "Notification", id: "LIST" }],
    }),

    markNotificationRead: build.mutation<void, string>({
      queryFn: () => ({ data: undefined }),
      invalidatesTags: (_, __, id) => [{ type: "Notification", id }],
    }),

    markAllRead: build.mutation<void, void>({
      queryFn: () => ({ data: undefined }),
      invalidatesTags: [{ type: "Notification", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllReadMutation,
} = notificationApi;
