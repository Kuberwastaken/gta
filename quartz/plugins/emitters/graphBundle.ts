import esbuild from "esbuild"
import path from "node:path"
import { QuartzEmitterPlugin } from "../types"
import { write } from "./helpers"
import { FullSlug, QUARTZ } from "../../util/path"

/** Bundles the topic-graph module to /static/graph.js so it can be lazy-loaded. */
export const GraphBundle: QuartzEmitterPlugin = () => ({
  name: "GraphBundle",
  async *emit(ctx) {
    const result = await esbuild.build({
      entryPoints: [path.join(QUARTZ, "components", "scripts", "graphModule.ts")],
      bundle: true,
      minify: true,
      format: "esm",
      platform: "browser",
      target: "es2020",
      write: false,
      legalComments: "none",
    })
    yield write({ ctx, slug: "static/graph" as FullSlug, ext: ".js", content: result.outputFiles[0].text })
  },
})
