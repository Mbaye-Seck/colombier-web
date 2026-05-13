import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tsConfigPaths from "vite-tsconfig-paths";
import {
  defineConfig,
  loadEnv,
  mergeConfig,
  type ConfigEnv,
  type Plugin,
  type UserConfig,
} from "vite";

/** Logs erreurs des server functions en dev (équivalent utile du preset précédent). */
function devServerFnErrorLogger(): Plugin {
  const HMR_SEND_KEY = "__TANSTACK_SERVER_FN_HMR_SEND__";
  return {
    name: "dev-server-fn-error-logger",
    apply: "serve",
    enforce: "pre",
    configureServer(server) {
      (globalThis as Record<string, unknown>)[HMR_SEND_KEY] = (data: unknown) => {
        server.ws.send({
          type: "custom",
          event: "server-fn-error",
          data,
        });
      };
    },
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, "/");
      const isTargetModule =
        normalizedId.includes("/@tanstack/start-server-core/src/server-functions-handler.ts") ||
        normalizedId.includes("/@tanstack/start-server-core/dist/esm/server-functions-handler.js");
      if (!isTargetModule) return null;
      const needle = "const unwrapped = res.result || res.error";
      if (!code.includes(needle)) return null;
      return code.replace(
        needle,
        `${needle}

      if (res?.error) {
        const err = res.error
        const payload = {
          source: 'tanstack',
          type: 'server-fn-error',
          method: request.method,
          url: request.url,
          name: err?.name ?? 'Error',
          message: err?.message ?? String(err),
          stack: typeof err?.stack === 'string' ? err.stack : undefined,
        }
        globalThis.${HMR_SEND_KEY}?.(payload)
      }`,
      );
    },
  };
}

type ColombierViteUserOptions = {
  tanstackStart?: Parameters<typeof tanstackStart>[0];
  /** Désactiver le plugin Cloudflare sur `vite build` si besoin. */
  cloudflare?: false | Record<string, unknown>;
  /** Désactiver l’injection explicite des variables `VITE_*` (défaut : activé). */
  envDefine?: false;
  /** Désactiver le plugin de log des erreurs server-fn en dev. */
  serverFnErrorLogger?: false;
  plugins?: Plugin[];
  vite?: UserConfig;
};

function colombierDefineConfig(user: ColombierViteUserOptions = {}) {
  return async (env: ConfigEnv): Promise<UserConfig> => {
    const { command, mode } = env;
    const plugins: Plugin[] = [];

    plugins.push(tailwindcss());
    plugins.push(tsConfigPaths({ projects: ["./tsconfig.json"] }));

    if (user.serverFnErrorLogger !== false) {
      plugins.push(devServerFnErrorLogger());
    }

    if (user.cloudflare !== false && command === "build") {
      try {
        const { cloudflare } = await import("@cloudflare/vite-plugin");
        const cfOptions =
          typeof user.cloudflare === "object" && user.cloudflare
            ? user.cloudflare
            : { viteEnvironment: { name: "ssr" } };
        plugins.push(cloudflare(cfOptions as Parameters<typeof cloudflare>[0]));
      } catch {
        /* build sans plugin Cloudflare si le module n’est pas résolu */
      }
    }

    const tanstackStartDefaults = {
      importProtection: {
        behavior: "error" as const,
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
    };
    plugins.push(tanstackStart(mergeConfig(tanstackStartDefaults, user.tanstackStart ?? {})));
    plugins.push(react());
    if (user.plugins?.length) plugins.push(...user.plugins);

    const envDefine: Record<string, string> = {};
    if (user.envDefine !== false) {
      const loadedEnv = loadEnv(mode, process.cwd(), "VITE_");
      for (const [key, value] of Object.entries(loadedEnv)) {
        envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
      }
    }

    let config: UserConfig = {
      define: envDefine,
      resolve: {
        alias: {
          "@": path.resolve(process.cwd(), "src"),
        },
        dedupe: [
          "react",
          "react-dom",
          "react/jsx-runtime",
          "react/jsx-dev-runtime",
          "@tanstack/react-query",
          "@tanstack/query-core",
        ],
      },
      plugins,
    };

    if (user.vite) {
      config = mergeConfig(config, user.vite);
    }

    return mergeConfig(
      {
        server: {
          host: "::",
          port: 8080,
        },
      },
      config,
    );
  };
}

export default defineConfig(
  colombierDefineConfig({
    tanstackStart: {
      server: { entry: "server" },
    },
  }),
);
