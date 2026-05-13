import { useState } from "react";
import { AppShell } from "@/layouts/app-shell";
import { PageHeader, Card, Badge, Button } from "@/components/domain";
import { LoadingSpinner, ErrorAlert, EmptyState } from "@/components/ui/query-states";
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllReadMutation,
} from "@/store/api/notificationApi";
import { Bell, CheckCheck } from "lucide-react";

export function NotificationsPage() {
  const { data: notifications = [], isLoading, isError, refetch } = useGetNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllReadMutation();
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  function handleMarkRead(id: string) {
    setReadIds((prev) => new Set([...prev, id]));
    void markRead(id);
  }

  function handleMarkAllRead() {
    setReadIds(new Set(notifications.map((n) => n.id)));
    void markAllRead();
  }

  const unreadCount = notifications.filter((n) => n.unread && !readIds.has(n.id)).length;

  return (
    <AppShell>
      <PageHeader
        title="Notifications"
        subtitle={
          unreadCount > 0
            ? `${unreadCount} message${unreadCount > 1 ? "s" : ""} non lu${unreadCount > 1 ? "s" : ""}`
            : "Tout est à jour."
        }
        actions={
          unreadCount > 0 ? (
            <Button type="button" variant="outline" onClick={handleMarkAllRead}>
              <CheckCheck className="size-4" /> Tout marquer comme lu
            </Button>
          ) : undefined
        }
      />

      {isLoading && <LoadingSpinner label="Chargement des notifications…" />}
      {isError && (
        <ErrorAlert
          message="Impossible de charger les notifications."
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && notifications.length === 0 && (
        <EmptyState
          title="Aucune notification."
          description="Vous serez alerté ici lors des événements importants de l'élevage."
        />
      )}

      {!isLoading && !isError && notifications.length > 0 && (
        <div className="max-w-2xl space-y-3">
          {notifications.map((n) => {
            const isUnread = n.unread && !readIds.has(n.id);
            return (
              <Card
                key={n.id}
                className={`flex gap-4 items-start transition-colors ${isUnread ? "border-primary/30 bg-primary/5" : ""}`}
              >
                <div
                  className={`size-10 rounded-xl grid place-items-center shrink-0 ${isUnread ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                >
                  <Bell className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{n.title}</span>
                    {isUnread && <Badge tone="couple">Nouveau</Badge>}
                    <span className="text-xs text-muted-foreground ml-auto">{n.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{n.body}</p>
                </div>
                {isUnread && (
                  <button
                    type="button"
                    onClick={() => handleMarkRead(n.id)}
                    className="shrink-0 text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
                  >
                    Lu
                  </button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
