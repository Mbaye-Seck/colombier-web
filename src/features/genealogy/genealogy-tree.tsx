import { Link } from "@tanstack/react-router";
import type { AncestorNode, ChildPigeon } from "@/types/pigeon";
import { Bird } from "lucide-react";

// ── Shared helpers ────────────────────────────────────────────────────────────

function pigeonDesc(node: AncestorNode["pigeon"]): string {
  return [node.race, node.couleur].filter(Boolean).join(" · ") || "—";
}

// ── Single pigeon card in the pedigree ───────────────────────────────────────

interface PedigreeCardProps {
  node: AncestorNode;
  depth?: number;
}

function PedigreeCard({ node, depth = 0 }: PedigreeCardProps) {
  const { pigeon } = node;
  const sexColor =
    pigeon.sexe === "male"
      ? "border-l-blue-400 dark:border-l-blue-500"
      : "border-l-pink-400 dark:border-l-pink-500";

  return (
    <div className="flex items-stretch gap-0">
      {/* connector lines drawn by parent */}
      <div
        className={`
          flex-1 min-w-0 rounded-lg border border-border border-l-2 ${sexColor}
          bg-card px-3 py-2 shadow-sm
          ${depth === 0 ? "ring-2 ring-primary/20" : ""}
        `}
      >
        <Link
          to="/pigeons/$ring"
          params={{ ring: String(pigeon.id) }}
          className="block group outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        >
          <p className="font-mono text-sm font-semibold group-hover:text-primary transition-colors truncate">
            {pigeon.code_bague}
          </p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{pigeonDesc(pigeon)}</p>
        </Link>
      </div>
    </div>
  );
}

// ── Recursive column (generation) ────────────────────────────────────────────

interface GenerationColumnProps {
  nodes: (AncestorNode | null)[];
  depth: number;
  maxDepth: number;
}

function GenerationColumn({ nodes, depth, maxDepth }: GenerationColumnProps) {
  if (depth > maxDepth) return null;

  const nextNodes: (AncestorNode | null)[] = nodes.flatMap((n) =>
    n ? [n.pere, n.mere] : [null, null],
  );
  const hasNextGen = nextNodes.some(Boolean);

  return (
    <div className="flex gap-3">
      {/* Next generation (ancestors go left-to-right) */}
      {hasNextGen && (
        <GenerationColumn nodes={nextNodes} depth={depth + 1} maxDepth={maxDepth} />
      )}

      {/* Current generation cards */}
      <div className="flex flex-col justify-around gap-2 min-w-40 max-w-50">
        {nodes.map((node, i) =>
          node ? (
            <PedigreeCard key={node.pigeon.id} node={node} depth={0} />
          ) : (
            <div
              key={i}
              className="rounded-lg border border-dashed border-border px-3 py-2 min-h-13 flex items-center gap-2 text-xs text-muted-foreground/50"
            >
              <Bird className="size-3.5 shrink-0" />
              <span>Inconnu</span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

// ── Main pedigree chart (desktop horizontal) ─────────────────────────────────

interface GenealogyTreeProps {
  tree: AncestorNode;
  maxDepth?: number;
}

export function GenealogyTree({ tree, maxDepth = 3 }: GenealogyTreeProps) {
  const hasAnyAncestor = tree.pere !== null || tree.mere !== null;

  if (!hasAnyAncestor) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
        <Bird className="size-8 opacity-30" />
        <p className="text-sm">Aucun ascendant enregistré.</p>
      </div>
    );
  }

  return (
    // Horizontal scroll on small screens; tree grows left
    <div className="overflow-x-auto">
      <div className="inline-flex items-center gap-3 min-w-max py-2 px-1">
        {/* Ancestors (generations 1–3) */}
        <GenerationColumn
          nodes={[tree.pere, tree.mere]}
          depth={1}
          maxDepth={maxDepth}
        />

        {/* Subject pigeon */}
        <div className="min-w-40 max-w-50">
          <PedigreeCard node={tree} depth={0} />
        </div>
      </div>
    </div>
  );
}

// ── Children list ─────────────────────────────────────────────────────────────

interface ChildrenListProps {
  children: ChildPigeon[];
}

export function ChildrenList({ children }: ChildrenListProps) {
  if (children.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
        <Bird className="size-7 opacity-30" />
        <p className="text-sm">Aucun descendant enregistré.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {children.map((child) => {
        const sexColor =
          child.sexe === "male"
            ? "border-l-blue-400 dark:border-l-blue-500"
            : "border-l-pink-400 dark:border-l-pink-500";
        const roleLabel = child.role === "pere" ? "Père" : "Mère";
        return (
          <li key={child.id}>
            <Link
              to="/pigeons/$ring"
              params={{ ring: String(child.id) }}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors border-l-2 ${sexColor} outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm font-medium truncate">{child.code_bague}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {[child.race, child.couleur].filter(Boolean).join(" · ") || "—"}
                </p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">via {roleLabel}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
