import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AppShell } from "@/layouts/app-shell";
import { PageHeader, Badge, Button, Card } from "@/components/domain";
import { useGetPigeonsQuery, useCreatePigeonMutation } from "@/store/api/pigeonApi";
import { pigeonCreateSchema, type PigeonCreateValues } from "@/lib/schemas/pigeon";
import { LoadingSpinner, ErrorAlert, EmptyState } from "@/components/ui/query-states";
import { InputField, SelectField } from "@/components/ui/form-field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreHorizontal, Bird, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import type { PigeonStatut, PigeonSexe } from "@/types/pigeon";

const PAGE_SIZE = 10;

const STATUT_LABELS: Record<PigeonStatut, string> = {
  actif: "Actif",
  vendu: "Vendu",
  mort: "Mort",
  perdu: "Perdu",
};

type SexFilter = "all" | PigeonSexe;
type StatusFilter = "all" | PigeonStatut;

export function PigeonsPage() {
  const { data: pigeons = [], isLoading, isError, refetch } = useGetPigeonsQuery();
  const [createPigeon] = useCreatePigeonMutation();
  const [q, setQ] = useState("");
  const [sexFilter, setSexFilter] = useState<SexFilter>("all");
  const [raceFilter, setRaceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#nouveau") {
      setAddOpen(true);
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }
  }, []);

  useEffect(() => {
    setPage(1);
  }, [q, sexFilter, raceFilter, statusFilter]);

  const races = useMemo(
    () => Array.from(new Set(pigeons.map((p) => p.race).filter(Boolean))).sort() as string[],
    [pigeons],
  );

  const filtered = useMemo(
    () =>
      pigeons.filter((p) => {
        if (sexFilter !== "all" && p.sexe !== sexFilter) return false;
        if (raceFilter !== "all" && p.race !== raceFilter) return false;
        if (statusFilter !== "all" && p.statut !== statusFilter) return false;
        if (q) {
          const lq = q.toLowerCase();
          return [p.code_bague, p.race ?? "", p.couleur ?? ""].some((v) =>
            v.toLowerCase().includes(lq),
          );
        }
        return true;
      }),
    [pigeons, q, sexFilter, raceFilter, statusFilter],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const form = useForm<PigeonCreateValues>({
    resolver: zodResolver(pigeonCreateSchema),
    defaultValues: { code_bague: "", sexe: "male", race: "" },
  });

  const onAddSubmit = form.handleSubmit(async (values) => {
    await createPigeon(values).unwrap();
    toast.success(`Pigeon ${values.code_bague} enregistré.`);
    setAddOpen(false);
    form.reset({ code_bague: "", sexe: "male", race: "" });
  });

  return (
    <AppShell>
      <PageHeader
        title="Pigeons"
        subtitle={`${pigeons.length} pigeon${pigeons.length !== 1 ? "s" : ""} enregistré${pigeons.length !== 1 ? "s" : ""} dans votre élevage.`}
        actions={
          <Button type="button" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" /> Ajouter un pigeon
          </Button>
        }
      />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau pigeon</DialogTitle>
            <DialogDescription>
              Enregistrez un nouveau pigeon dans votre élevage.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onAddSubmit} className="space-y-4">
            <InputField
              id="p-code-bague"
              label="Matricule (code bague)"
              placeholder="ex : SN-2024-001"
              error={form.formState.errors.code_bague?.message}
              {...form.register("code_bague")}
            />
            <SelectField
              id="p-sexe"
              label="Sexe"
              error={form.formState.errors.sexe?.message}
              {...form.register("sexe")}
            >
              <option value="male">Mâle</option>
              <option value="femelle">Femelle</option>
            </SelectField>
            <InputField
              id="p-race"
              label="Race (optionnel)"
              placeholder="ex : Voyageur"
              error={form.formState.errors.race?.message}
              {...form.register("race")}
            />
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Enregistrer"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="p-0! overflow-hidden">
        <div className="p-4 border-b flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 h-9 rounded-lg bg-muted/60 flex-1 min-w-50 max-w-sm">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher matricule, race…"
              className="bg-transparent outline-none text-sm flex-1"
              aria-label="Rechercher un pigeon"
            />
          </div>
          <select
            value={sexFilter}
            onChange={(e) => setSexFilter(e.target.value as SexFilter)}
            className="h-9 rounded-lg border bg-background px-3 text-sm"
            aria-label="Filtrer par sexe"
          >
            <option value="all">Tous les sexes</option>
            <option value="male">Mâle</option>
            <option value="femelle">Femelle</option>
          </select>
          <select
            value={raceFilter}
            onChange={(e) => setRaceFilter(e.target.value)}
            className="h-9 rounded-lg border bg-background px-3 text-sm"
            aria-label="Filtrer par race"
          >
            <option value="all">Toutes les races</option>
            {races.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="h-9 rounded-lg border bg-background px-3 text-sm"
            aria-label="Filtrer par statut"
          >
            <option value="all">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="vendu">Vendu</option>
            <option value="mort">Mort</option>
            <option value="perdu">Perdu</option>
          </select>
        </div>

        {isLoading && <LoadingSpinner label="Chargement des pigeons…" />}
        {isError && (
          <ErrorAlert message="Impossible de charger les pigeons." onRetry={() => refetch()} />
        )}
        {!isLoading && !isError && filtered.length === 0 && (
          <EmptyState
            title={q || sexFilter !== "all" || raceFilter !== "all" || statusFilter !== "all"
              ? "Aucun pigeon ne correspond à vos filtres."
              : "Aucun pigeon enregistré."}
            description={
              q || sexFilter !== "all" || raceFilter !== "all" || statusFilter !== "all"
                ? "Modifiez vos critères de recherche."
                : "Ajoutez votre premier pigeon pour commencer."
            }
            action={
              !(q || sexFilter !== "all" || raceFilter !== "all" || statusFilter !== "all") ? (
                <Button type="button" onClick={() => setAddOpen(true)}>
                  Ajouter un pigeon
                </Button>
              ) : undefined
            }
          />
        )}

        {!isLoading && !isError && paginated.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground border-b bg-muted/30">
                  <th className="text-left font-medium px-4 py-3">Matricule</th>
                  <th className="text-left font-medium px-4 py-3">Sexe</th>
                  <th className="text-left font-medium px-4 py-3">Race</th>
                  <th className="text-left font-medium px-4 py-3">Couleur</th>
                  <th className="text-left font-medium px-4 py-3">Naissance</th>
                  <th className="text-left font-medium px-4 py-3">Statut</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        to="/pigeons/$ring"
                        params={{ ring: String(p.id) }}
                        className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                      >
                        <div
                          className={`size-8 rounded-lg grid place-items-center ${p.sexe === "male" ? "bg-blue-500/10 text-blue-600" : "bg-pink-500/10 text-pink-600"}`}
                        >
                          <Bird className="size-4" />
                        </div>
                        <span className="font-mono font-medium text-foreground hover:text-primary">
                          {p.code_bague}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={p.sexe === "male" ? "default" : "couple"}>
                        {p.sexe === "male" ? "Mâle" : "Femelle"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{p.race ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.couleur ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.date_naissance ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        tone={
                          p.statut === "actif"
                            ? "empty"
                            : p.statut === "vendu"
                              ? "muted"
                              : "single"
                        }
                      >
                        {STATUT_LABELS[p.statut]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="size-8 grid place-items-center rounded-lg hover:bg-muted"
                            aria-label="Actions"
                          >
                            <MoreHorizontal className="size-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to="/pigeons/$ring" params={{ ring: String(p.id) }}>
                              Voir la fiche
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div className="p-4 flex items-center justify-between border-t text-sm text-muted-foreground">
            <span>
              {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
              {totalPages > 1 && ` · page ${page} / ${totalPages}`}
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <Button
                    key={n}
                    variant={n === page ? "primary" : "outline"}
                    size="sm"
                    type="button"
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </AppShell>
  );
}
