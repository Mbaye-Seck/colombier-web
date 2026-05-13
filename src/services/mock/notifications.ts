export type Notification = {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

export function getMockNotifications(): Notification[] {
  return [
    {
      id: "1",
      title: "Ponte enregistrée",
      body: "Couple C-014 — œufs visibles.",
      time: "Il y a 2 h",
      unread: true,
    },
    {
      id: "2",
      title: "Cage libérée",
      body: "La cage B07 est maintenant disponible.",
      time: "Hier",
      unread: true,
    },
    {
      id: "3",
      title: "Synchronisation",
      body: "Données locales à jour.",
      time: "12/03/2026",
      unread: false,
    },
  ];
}
