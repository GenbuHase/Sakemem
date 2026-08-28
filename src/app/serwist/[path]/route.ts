import { spawnSync } from "node:child_process";
import { createSerwistRoute } from "@serwist/turbopack";

const revision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() ||
  crypto.randomUUID();
const supabaseOrigin = new URL(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
).origin;

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    additionalPrecacheEntries: [{ url: "/~offline", revision }],
    esbuildOptions: {
      define: {
        __SUPABASE_ORIGIN__: JSON.stringify(supabaseOrigin),
      },
    },
    swSrc: "src/app/sw.ts",
    useNativeEsbuild: true,
  });
