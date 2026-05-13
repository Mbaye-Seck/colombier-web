export const DASHBOARD_CHART_BARS = [40, 60, 45, 80, 65, 90, 70, 85, 75, 95, 88, 100] as const;

export const DASHBOARD_RECENT_REPRODUCTIONS = [
  { code: "C-014", date: "12/03/2026", jeunes: 2 },
  { code: "C-007", date: "08/03/2026", jeunes: 1 },
  { code: "C-022", date: "01/03/2026", jeunes: 2 },
  { code: "C-003", date: "21/02/2026", jeunes: 3 },
] as const;

export const DASHBOARD_ACTIVITY = [
  { time: "Il y a 2h", title: "Cage A03 affectée à un couple", tone: "couple" as const },
  { time: "Il y a 5h", title: "Pigeon SN-2024-014 ajouté", tone: "default" as const },
  { time: "Hier", title: "Reproduction C-014 — 2 jeunes éclos", tone: "couple" as const },
  { time: "12/03", title: "Vente : pigeon SN-2023-088", tone: "single" as const },
  { time: "10/03", title: "Cage B07 libérée", tone: "empty" as const },
] as const;
