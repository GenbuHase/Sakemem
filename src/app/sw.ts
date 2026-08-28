/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { NetworkOnly, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;
declare const __SUPABASE_ORIGIN__: string;

const PRIVATE_RESPONSE_CACHES = [
  "pages",
  "pages-rsc",
  "pages-rsc-prefetch",
  "cross-origin",
  "others",
  "sakemem-cache-migration-v2",
  "sakemem-cache-migration-v3",
];
const CACHE_MIGRATION = "sakemem-cache-migration-v4";
const CACHE_MIGRATION_MARKER = "/__sakemem_cache_migration_v4__";
const SUPABASE_NETWORK_ONLY_PATHS = [
  "/auth/v1/",
  "/rest/v1/",
  "/graphql/v1",
  "/functions/v1/",
];
const PRIVATE_APP_PATHS = [
  "/records",
  "/settings",
  "/onboarding",
  "/auth/callback",
];

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const migrationCache = await caches.open(CACHE_MIGRATION);
      if (await migrationCache.match(CACHE_MIGRATION_MARKER)) return;

      await Promise.all(
        PRIVATE_RESPONSE_CACHES.map((cacheName) => caches.delete(cacheName)),
      );
      await migrationCache.put(
        CACHE_MIGRATION_MARKER,
        new Response("complete"),
      );
    })(),
  );
});

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ url }) =>
        url.origin === __SUPABASE_ORIGIN__ &&
        SUPABASE_NETWORK_ONLY_PATHS.some((path) =>
          url.pathname.startsWith(path),
        ),
      method: "GET",
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ sameOrigin, url }) =>
        sameOrigin &&
        PRIVATE_APP_PATHS.some(
          (path) =>
            url.pathname === path || url.pathname.startsWith(`${path}/`),
        ),
      method: "GET",
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ sameOrigin, url }) =>
        sameOrigin && url.pathname.startsWith("/api/"),
      method: "GET",
      handler: new NetworkOnly(),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
