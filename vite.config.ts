// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
/** Set automatically on Vercel builds — enables Nitro Vercel output. */
const deployVercel = Boolean(process.env.VERCEL);

export default defineConfig({
  // Cloudflare plugin output is not compatible with Vercel — disable on Vercel builds.
  cloudflare: deployVercel ? false : undefined,
  tanstackStart: {
    server: { entry: "server" },
  },
  plugins: deployVercel
    ? [
        nitro({
          preset: "vercel",
        }),
      ]
    : [],
});
