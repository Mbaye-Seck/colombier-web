import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Bird,
  X,
  History,
  UserPlus,
  Users,
  Trash2,
  Filter,
  LayoutGrid,
  List,
  Loader2,
} from "lucide-react";
import { Badge, Button } from "@/components/domain";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CAGE_STATUS_LABELS } from "@/types/cage";
import type { AviaryId, CageView, CageStatus } from "@/types/cage";
import { AVIARY_IDS } from "@/types/cage";
import {
  useGetCagesQuery,
  useGetCagesByAviaryQuery,
  useAssignPigeonMutation,
  useAssignCoupleMutation,
  useReleaseCageMutation,
} from "@/store/api/cageApi";
import { useGetPigeonsQuery } from "@/store/api/pigeonApi";
import { useGetCouplesQuery } from "@/store/api/coupleApi";

export function CageGrid() {
  const [aviary, setAviary] = useState<AviaryId>("A");
  const [filter, setFilter] = useState<"all" | CageStatus>("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<CageView | null>(null);

  const { data: allCages = [], isLoading } = useGetCagesByAviaryQuery(aviary);
  // Pre-fetch all cages at mount so the assign dialogs hit the cache immediately
  // (aviary query only covers one volière; dialogs need cross-volière occupancy data)
  useGetCagesQuery();

  const cages = useMemo(
    () => allCages.filter((c) => (filter === "all" ? true : c.status === filter)),
    [allCages, filter],
  );

  const counts = useMemo(
    () => ({
      empty: allCages.filter((x) => x.status === "empty").length,
      single: allCages.filter((x) => x.status === "single").length,
      couple: allCages.filter((x) => x.status === "couple").length,
      total: allCages.length,
    }),
    [allCages],
  );

  const selectedLive = useMemo(
    () => (selected ? (allCages.find((c) => c.id === selected.id) ?? selected) : null),
    [allCages, selected],
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
      <div className="rounded-2xl border bg-card p-5">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight">Volière {aviary}</h2>
            <span className="text-xs text-muted-foreground">{counts.total} cages</span>
          </div>

          <div className="flex items-center gap-3 ml-auto flex-wrap">
            <div className="hidden md:flex items-center gap-3 text-[11px] text-muted-foreground mr-2">
              <LegendDot tone="empty" /> Libre ({counts.empty})
              <LegendDot tone="single" /> 1 pigeon ({counts.single})
              <LegendDot tone="couple" /> Couple ({counts.couple})
            </div>

            <select
              value={aviary}
              onChange={(e) => setAviary(e.target.value as AviaryId)}
              className="h-9 rounded-lg border bg-background px-3 text-sm"
            >
              {AVIARY_IDS.map((a) => (
                <option key={a} value={a}>
                  Volière {a}
                </option>
              ))}
            </select>

            <div className="inline-flex h-9 rounded-lg border bg-background overflow-hidden">
              {(["all", "empty", "single", "couple"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-3 text-xs font-medium transition-colors flex items-center gap-1.5",
                    filter === f
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/60",
                  )}
                >
                  {f === "all" && <Filter className="size-3" />}
                  {f === "all" ? "Tous" : CAGE_STATUS_LABELS[f]}
                </button>
              ))}
            </div>

            <div className="inline-flex h-9 rounded-lg border bg-background overflow-hidden">
              <button
                type="button"
                onClick={() => setView("grid")}
                className={cn("px-2.5", view === "grid" ? "bg-muted" : "hover:bg-muted/60")}
                aria-label="Vue grille"
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className={cn("px-2.5", view === "list" ? "bg-muted" : "hover:bg-muted/60")}
                aria-label="Vue liste"
              >
                <List className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
            <Loader2 className="size-5 animate-spin" />
            <span className="text-sm">Chargement des cages…</span>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {cages.map((cage) => (
              <CageTile
                key={cage.id}
                cage={cage}
                active={selectedLive?.id === cage.id}
                onClick={() => setSelected(cage)}
              />
            ))}
          </div>
        ) : (
          <div className="divide-y border rounded-xl overflow-hidden">
            {cages.map((cage) => (
              <button
                key={cage.id}
                type="button"
                onClick={() => setSelected(cage)}
                className="w-full flex items-center gap-4 px-4 py-3 hover:bg-muted/50 text-left"
              >
                <span className="font-mono font-semibold w-12">{cage.code}</span>
                <Badge tone={cage.status}>{CAGE_STATUS_LABELS[cage.status]}</Badge>
                <span className="text-sm text-muted-foreground ml-auto">
                  {cage.occupants.length
                    ? cage.occupants.map((o) => o.ring).join(" · ")
                    : "Aucun occupant"}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <CageDetailsPanel
        cage={selectedLive}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

function LegendDot({ tone }: { tone: CageStatus }) {
  const cls = {
    empty: "bg-cage-empty",
    single: "bg-cage-single",
    couple: "bg-cage-couple",
  }[tone];
  return <span className={cn("inline-block size-2 rounded-full", cls)} />;
}

function CageTile({ cage, active, onClick }: { cage: CageView; active: boolean; onClick: () => void }) {
  const styles = {
    empty:
      "bg-cage-empty-soft border-cage-empty-border text-cage-empty hover:shadow-md hover:-translate-y-0.5",
    single:
      "bg-cage-single-soft border-cage-single-border text-cage-single hover:shadow-md hover:-translate-y-0.5",
    couple:
      "bg-cage-couple-soft border-cage-couple-border text-cage-couple hover:shadow-md hover:-translate-y-0.5",
  }[cage.status];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative aspect-4/3 rounded-xl border-2 p-3 flex flex-col transition-all duration-200 text-left",
        styles,
        active &&
          "ring-2 ring-primary ring-offset-2 ring-offset-background -translate-y-0.5 shadow-md",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-bold text-sm tracking-tight">{cage.code}</span>
        <span className="size-1.5 rounded-full bg-current opacity-60" />
      </div>
      <div className="flex-1 grid place-items-center">
        {cage.status === "empty" ? (
          <Bird className="size-7 opacity-30" strokeWidth={1.5} />
        ) : cage.status === "single" ? (
          <Bird className="size-7" strokeWidth={1.8} />
        ) : (
          <div className="flex -space-x-1.5">
            <Bird className="size-7" strokeWidth={1.8} />
            <Bird className="size-7" strokeWidth={1.8} />
          </div>
        )}
      </div>
      <div className="text-[11px] font-medium text-center opacity-80">
        {cage.status === "empty" ? "Libre" : cage.status === "single" ? "1 pigeon" : "2 pigeons"}
      </div>
    </button>
  );
}

function CageDetailsPanel({ cage, onClose }: { cage: CageView | null; onClose: () => void }) {
  const [assignPigeonOpen, setAssignPigeonOpen] = useState(false);
  const [assignCoupleOpen, setAssignCoupleOpen] = useState(false);

  if (!cage) {
    return (
      <div className="hidden xl:flex rounded-2xl border bg-card p-8 items-center justify-center text-center text-sm text-muted-foreground min-h-100">
        <div>
          <Grid3xPlaceholder />
          <p className="mt-3">Sélectionnez une cage pour voir ses détails.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AssignPigeonDialog
        open={assignPigeonOpen}
        cage={cage}
        onClose={() => setAssignPigeonOpen(false)}
      />
      <AssignCoupleDialog
        open={assignCoupleOpen}
        cage={cage}
        onClose={() => setAssignCoupleOpen(false)}
      />

      <div
        className="fixed inset-0 z-40 bg-foreground/40 xl:hidden"
        onClick={onClose}
        aria-hidden
      />
      <aside className="fixed xl:static inset-y-0 right-0 z-50 w-full max-w-md xl:max-w-none xl:w-auto bg-card xl:rounded-2xl border-l xl:border xl:h-fit overflow-y-auto">
        <div className="p-5 sticky top-0 bg-card border-b flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Cage</div>
            <div className="text-lg font-semibold tracking-tight">{cage.code}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 grid place-items-center rounded-lg hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <Badge tone={cage.status}>
            {cage.status === "empty"
              ? "Cage libre"
              : cage.status === "single"
                ? "Occupée par un pigeon"
                : "Occupée par un couple"}
          </Badge>
          <div className="pt-1">
            <Link
              to="/cages/$code"
              params={{ code: String(cage.backendId) }}
              className="text-sm font-medium text-primary hover:underline"
            >
              Ouvrir la fiche en pleine page
            </Link>
          </div>

          {cage.occupants.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Pigeons
              </h3>
              <div className="space-y-2.5">
                {cage.occupants.map((o) => (
                  <div key={o.ring} className="flex gap-3 p-3 rounded-xl border bg-background">
                    <div
                      className={cn(
                        "size-12 rounded-lg grid place-items-center shrink-0",
                        o.sex === "M"
                          ? "bg-blue-500/10 text-blue-600"
                          : "bg-pink-500/10 text-pink-600",
                      )}
                    >
                      <Bird className="size-6" />
                    </div>
                    <div className="min-w-0 text-sm">
                      <div
                        className={cn(
                          "font-semibold",
                          o.sex === "M" ? "text-blue-600" : "text-pink-600",
                        )}
                      >
                        {o.sex === "M" ? "Mâle" : "Femelle"}
                      </div>
                      <div className="text-xs text-muted-foreground">Matricule : {o.ring}</div>
                      <div className="text-xs text-muted-foreground">Race : {o.race}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {cage.history.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Historique
              </h3>
              <ul className="space-y-2">
                {cage.history.map((h, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <History className="size-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">{h.date} :</span>
                    <span>{h.label}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Actions
            </h3>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-center"
                onClick={() => setAssignPigeonOpen(true)}
              >
                <UserPlus className="size-4" /> Affecter un pigeon
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-center text-cage-couple! border-cage-couple-border! hover:bg-cage-couple-soft!"
                onClick={() => setAssignCoupleOpen(true)}
              >
                <Users className="size-4" /> Affecter un couple
              </Button>
              {cage.status !== "empty" && cage.affectationId != null && (
                <ReleaseCageButton affectationId={cage.affectationId} code={cage.code} />
              )}
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}

function ReleaseCageButton({ affectationId, code }: { affectationId: number; code: string }) {
  const [releaseCage, { isLoading }] = useReleaseCageMutation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <ConfirmDialog
        open={open}
        onOpenChange={(o) => !o && setOpen(false)}
        title="Libérer cette cage ?"
        description="Les pigeons occupants seront retirés. L'action est reflétée immédiatement."
        confirmLabel="Libérer"
        onConfirm={async () => {
          setOpen(false);
          try {
            await releaseCage(affectationId).unwrap();
            toast.success(`Cage ${code} libérée.`);
          } catch {
            toast.error("Impossible de libérer la cage.");
          }
        }}
      />
      <Button
        type="button"
        variant="outline"
        className="w-full justify-center text-destructive! border-destructive/30! hover:bg-destructive/5!"
        onClick={() => setOpen(true)}
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
        Libérer la cage
      </Button>
    </>
  );
}

function AssignPigeonDialog({
  open,
  cage,
  onClose,
}: {
  open: boolean;
  cage: CageView;
  onClose: () => void;
}) {
  const { data: pigeons = [] } = useGetPigeonsQuery();
  const { data: allCages = [], isLoading: isLoadingCages } = useGetCagesQuery();
  const [assignPigeon, { isLoading }] = useAssignPigeonMutation();
  const [selectedPigeonId, setSelectedPigeonId] = useState("");

  // Pigeons already housed in any cage
  const occupiedPigeonIds = new Set(
    allCages.flatMap((c) => c.occupants.map((o) => o.pigeonId)),
  );

  const available = pigeons.filter(
    (p) => p.statut === "actif" && !occupiedPigeonIds.has(p.id),
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const pigeon = available.find((p) => p.id === Number(selectedPigeonId));
    if (!pigeon) return;
    try {
      await assignPigeon({ backendId: cage.backendId, pigeon_id: pigeon.id }).unwrap();
      toast.success(`Pigeon ${pigeon.code_bague} affecté à la cage ${cage.code}.`);
      setSelectedPigeonId("");
      onClose();
    } catch (err) {
      const data = (err as { data?: { errors?: Record<string, string[]>; message?: string } })?.data;
      const msg =
        data?.errors?.pigeon_id?.[0] ??
        data?.errors?.cage_id?.[0] ??
        data?.message ??
        "Impossible d'affecter le pigeon.";
      toast.error(msg);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Affecter un pigeon</DialogTitle>
          <DialogDescription>
            Cage {cage.code} — sélectionnez un pigeon disponible.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground" htmlFor="assign-pigeon">
              Pigeon
            </label>
            <select
              id="assign-pigeon"
              value={selectedPigeonId}
              onChange={(e) => setSelectedPigeonId(e.target.value)}
              className="mt-1.5 w-full h-9 rounded-lg border bg-background px-3 text-sm"
              disabled={isLoadingCages}
              required
            >
              <option value="">
                {isLoadingCages ? "Chargement…" : "Sélectionner un pigeon…"}
              </option>
              {!isLoadingCages && available.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code_bague} — {p.sexe === "male" ? "Mâle" : "Femelle"}{p.race ? ` · ${p.race}` : ""}
                </option>
              ))}
            </select>
            {!isLoadingCages && available.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Aucun pigeon actif disponible (tous déjà affectés).
              </p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || isLoadingCages || !selectedPigeonId}>
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Affecter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AssignCoupleDialog({
  open,
  cage,
  onClose,
}: {
  open: boolean;
  cage: CageView;
  onClose: () => void;
}) {
  const { data: couples = [] } = useGetCouplesQuery();
  const { data: allCages = [], isLoading: isLoadingCages } = useGetCagesQuery();
  const [assignCouple, { isLoading }] = useAssignCoupleMutation();
  const [selectedCoupleId, setSelectedCoupleId] = useState("");

  // Couples already assigned to any cage (across all aviaries)
  const occupiedCoupleIds = new Set(
    allCages.map((c) => c.coupleId).filter((id): id is number => id !== null),
  );

  const availableCouples = couples.filter(
    (c) => c.statut === "actif" && !occupiedCoupleIds.has(c.id),
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const couple = availableCouples.find((c) => c.id === Number(selectedCoupleId));
    if (!couple) return;
    try {
      await assignCouple({ backendId: cage.backendId, couple_id: couple.id }).unwrap();
      toast.success(`Couple #${couple.id} affecté à la cage ${cage.code}.`);
      setSelectedCoupleId("");
      onClose();
    } catch (err) {
      const data = (err as { data?: { errors?: Record<string, string[]>; message?: string } })?.data;
      const msg =
        data?.errors?.couple_id?.[0] ??
        data?.errors?.cage_id?.[0] ??
        data?.message ??
        "Impossible d'affecter le couple.";
      toast.error(msg);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Affecter un couple</DialogTitle>
          <DialogDescription>
            Cage {cage.code} — sélectionnez un couple actif sans cage.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground" htmlFor="assign-couple">
              Couple
            </label>
            <select
              id="assign-couple"
              value={selectedCoupleId}
              onChange={(e) => setSelectedCoupleId(e.target.value)}
              className="mt-1.5 w-full h-9 rounded-lg border bg-background px-3 text-sm"
              disabled={isLoadingCages}
              required
            >
              <option value="">
                {isLoadingCages ? "Chargement…" : "Sélectionner un couple…"}
              </option>
              {!isLoadingCages && availableCouples.map((c) => (
                <option key={c.id} value={c.id}>
                  #{c.id} — {c.male?.code_bague ?? `ID ${c.male_id}`} × {c.femelle?.code_bague ?? `ID ${c.femelle_id}`}
                </option>
              ))}
            </select>
            {!isLoadingCages && availableCouples.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Aucun couple actif disponible (tous déjà affectés à une cage).
              </p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || isLoadingCages || !selectedCoupleId}>
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Affecter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Grid3xPlaceholder() {
  return (
    <div className="mx-auto grid grid-cols-3 gap-1.5 w-fit opacity-40">
      {Array.from({ length: 9 }).map((_, i) => (
        <span key={i} className="size-5 rounded-md border-2 border-dashed" />
      ))}
    </div>
  );
}
