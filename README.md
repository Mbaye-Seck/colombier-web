# Colombier Web

Interface utilisateur de l'application Colombier. Application React 19 développée avec TanStack Start, TypeScript, Redux Toolkit et Tailwind CSS.

L'API backend est documentée dans [colombier-api/README.md](../colombier-api/README.md).

## Prérequis

- Node.js 20 ou supérieur
- npm

## Installation

```bash
cp .env.example .env
# Vérifier que VITE_API_URL pointe vers l'API backend

npm install
npm run dev
```

Le serveur de développement démarre sur `http://localhost:8080`.

## Variable d'environnement

| Variable | Valeur par défaut | Description |
|----------|-------------------|-------------|
| `VITE_API_URL` | `http://localhost:8001` | URL de base de l'API Colombier |

Cette variable est obligatoire. L'application lève une erreur au démarrage si elle est absente.

## Build de production

```bash
npm run build
```

Les artefacts sont générés dans le dossier `.output/`.

## Architecture

### Framework et routage

L'application repose sur **TanStack Start**, un méta-framework React avec support SSR. Le routage est géré par **TanStack Router** selon une convention de nommage par fichiers : chaque fichier dans `src/routes/` correspond à une route.

```
src/routes/
├── __root.tsx                   # Racine (layout global, favicon, balises meta)
├── index.tsx                    # Page d'accueil / redirection
├── login.tsx                    # Connexion
├── forgot-password.tsx          # Récupération de mot de passe
├── pigeons.tsx                  # Layout du module pigeons
├── pigeons.index.tsx            # Liste des pigeons
├── pigeons.$ring.tsx            # Détail d'un pigeon (paramètre : code_bague)
├── cages.tsx / cages.index.tsx / cages.$code.tsx
├── couples.tsx / couples.index.tsx / couples.$id.tsx
├── reproductions.tsx / reproductions.index.tsx / reproductions.$id.tsx
├── exits.tsx / exits.index.tsx / exits.$id.tsx
├── profil.tsx
├── parametres.tsx
└── notifications.tsx
```

### Gestion d'état

L'état applicatif est géré par **Redux Toolkit**, structuré en deux couches.

**Slices Redux** (`src/store/slices/`) :

| Slice | Contenu |
|-------|---------|
| `authSlice` | Token Sanctum, données utilisateur, état de connexion |
| `themeSlice` | Préférence clair/sombre |
| `uiSlice` | État d'interface (modales, panneaux) |

**RTK Query** (`src/store/api/`) — un slice par entité :

| Slice | Endpoints |
|-------|-----------|
| `authApi` | login, logout, me |
| `pigeonApi` | CRUD, upload photo, ancêtres, enfants |
| `coupleApi` | CRUD couples |
| `reproductionApi` | CRUD reproductions, création de jeunes |
| `cageApi` | CRUD cages |
| `exitApi` | CRUD sorties |
| `notificationApi` | Notifications |

### Cycle d'authentification

1. `POST /api/auth/login` → le token Sanctum est stocké dans `authSlice` et persisté en localStorage via `redux-persist`
2. `baseApi.ts` injecte automatiquement l'en-tête `Authorization: Bearer {token}` sur chaque requête RTK Query
3. Une réponse `401` déclenche la déconnexion et redirige vers `/login`

### Invalidation du cache RTK Query

Chaque mutation invalide les tags des ressources concernées, forçant le rechargement des listes et détails associés. Par exemple, la mise à jour d'un pigeon invalide `{ type: 'Pigeon', id }` et `{ type: 'Pigeon', id: 'LIST' }`.

## Structure du code

```
src/
├── features/
│   ├── cages/
│   │   └── cage-grid.tsx        # Grille de cages groupée par volière
│   └── genealogy/
│       └── genealogy-tree.tsx   # Arbre généalogique et descendants
├── layouts/
│   └── app-shell.tsx            # Shell : sidebar desktop, navigation mobile
├── lib/
│   ├── schemas/                 # Schémas Zod pour la validation des formulaires
│   └── utils.ts                 # Utilitaires partagés
├── pages/                       # Composants de page (un par route)
├── routes/                      # Définitions de routes TanStack Router
├── store/
│   ├── api/                     # Slices RTK Query
│   ├── slices/                  # Slices Redux classiques
│   ├── baseApi.ts               # Configuration RTK Query (baseUrl, headers)
│   └── index.ts                 # Export du store Redux
└── types/                       # Types TypeScript partagés
```

## Fonctionnalités clés

### Arbre généalogique

Composant `GenealogyTree` (`src/features/genealogy/genealogy-tree.tsx`) — accessible depuis la page de détail d'un pigeon :

- Visualisation horizontale par génération en React pur, sans bibliothèque de graphes
- Récursion sur le type `AncestorNode { pigeon, pere, mere }` jusqu'à 3 niveaux
- Carte par pigeon avec bordure colorée selon le sexe (bleu = mâle, rose = femelle)
- Chaque carte est un lien cliquable vers la page de détail du pigeon concerné
- Espace réservé « Inconnu » pour les ascendants non renseignés
- Composant `ChildrenList` : descendants directs avec indication du rôle (via père / via mère)

### Grille de cages

Composant `CageGrid` (`src/features/cages/cage-grid.tsx`) :

- Regroupement des cages par volière selon la première lettre du numéro (`A`, `B`, `C`)
- Affichage du type, de la superficie et de l'occupation courante
- Navigation vers la page de détail de chaque cage

### Upload de photos

Les formulaires de création et d'édition de pigeon transmettent la photo via `multipart/form-data` (champ `photo`). La prévisualisation s'effectue côté client avant envoi. L'URL publique retournée par l'API est affichée dans la fiche pigeon.

### Sélection des parents

Les formulaires de création et d'édition exposent deux sélecteurs de parent (`pere_id`, `mere_id`) filtrés par sexe. Les options proviennent de la liste des pigeons actifs de l'utilisateur et excluent le pigeon en cours d'édition.

## Composants UI

L'interface repose sur **Radix UI** pour les primitives d'accessibilité (Dialog, DropdownMenu, Select, Accordion…) et **Tailwind CSS 4** pour le style. Aucune bibliothèque de composants préconçus n'est utilisée ; chaque composant est composé localement.

Les formulaires utilisent **React Hook Form** avec validation **Zod** via le résolveur `@hookform/resolvers/zod`.
