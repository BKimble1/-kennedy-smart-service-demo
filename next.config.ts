import type { NextConfig } from "next";

/**
 * Two build modes:
 *
 *  1. `npm run build`         → full Next.js server build. Supports the optional
 *                               live-AI route handler at `src/app/api/ai/route.node.ts`.
 *  2. `npm run build:static`  → STATIC_EXPORT=1, emits a fully static `out/` folder
 *                               (GitHub Pages, S3, Netlify drop, any static host).
 *                               The `node.ts` page extension is dropped, so the
 *                               server-only AI route is simply not part of the build.
 *
 * The demo is 100% functional in either mode — live AI is strictly an upgrade path.
 */
const isStatic = process.env.STATIC_EXPORT === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  pageExtensions: isStatic ? ["tsx", "ts", "jsx", "js"] : ["tsx", "ts", "jsx", "js", "node.ts"],
  ...(isStatic ? { output: "export" as const, images: { unoptimized: true } } : {}),
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  trailingSlash: isStatic,
  typedRoutes: false,
};

export default nextConfig;
