import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv, type Plugin } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

const DEFAULT_S3_CATEGORY_BASE =
  "https://skillance-public.s3.af-south-1.amazonaws.com/category-images"

/**
 * Dev-only: fetch S3 JSON via the Vite server so the browser does not need CORS for localhost.
 * Must allow the same URL prefix as resolveLottieJsonFetchUrl in src/lib/s3CategoryLottie.ts.
 */
function devS3PublicJsonProxy(allowedPrefix: string): Plugin {
  const normalized = allowedPrefix.replace(/\/+$/, "")
  return {
    name: "dev-s3-public-json-proxy",
    configureServer(server) {
      server.middlewares.use("/__dev/s3-public-json", async (req, res) => {
        if (req.method !== "GET" && req.method !== "HEAD") {
          res.statusCode = 405
          res.end()
          return
        }
        try {
          const reqUrl = new URL(req.url || "", "http://localhost")
          const target = reqUrl.searchParams.get("url")
          if (!target) {
            res.statusCode = 400
            res.end("Missing url")
            return
          }
          let decoded: string
          try {
            decoded = decodeURIComponent(target)
          } catch {
            res.statusCode = 400
            res.end("Bad url")
            return
          }
          if (!decoded.startsWith(`${normalized}/`) && decoded !== normalized) {
            res.statusCode = 403
            res.end("URL not allowed")
            return
          }
          const upstream = await fetch(decoded, { headers: { Accept: "application/json,*/*" } })
          if (!upstream.ok) {
            res.statusCode = upstream.status
            res.end()
            return
          }
          const body = await upstream.text()
          const ct = upstream.headers.get("content-type") || "application/json"
          res.setHeader("Content-Type", ct)
          res.statusCode = 200
          res.end(body)
        } catch {
          res.statusCode = 502
          res.end("Bad gateway")
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const s3CategoryBase =
    (env.VITE_PUBLIC_S3_CATEGORY_BASE || DEFAULT_S3_CATEGORY_BASE).replace(/\/+$/, "")

  return {
    base: "/",
    build: {
      sourcemap: true,
    },
    plugins: [devS3PublicJsonProxy(s3CategoryBase), inspectAttr(), react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})
