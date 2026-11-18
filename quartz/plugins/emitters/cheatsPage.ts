import { QuartzEmitterPlugin } from "../types"
import { write } from "./helpers"
import { FullSlug } from "../../util/path"
import cheats from "../../util/cheats.json"

const escape = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

/** Deliberately standalone: this route contains only the requested cheat table. */
export const CheatsPage: QuartzEmitterPlugin = () => ({
  name: "CheatsPage",
  async *emit(ctx) {
    const rows = cheats.map(({ name, cheat, effect }) => `<tr><th scope="row">${escape(name)}</th><td class="code">${escape(cheat)}</td><td>${escape(effect)}</td></tr>`).join("\n")
    const content = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GTA 6 Cheats</title><link rel="canonical" href="https://gta.kuber.studio/cheats"><style>
*{box-sizing:border-box}html{color-scheme:light}body{margin:0;padding:20px;color:#111;background:#fff;font:16px/1.5 system-ui,sans-serif}table{width:100%;max-width:1200px;margin:0 auto;border-collapse:collapse;table-layout:fixed}th,td{text-align:left;vertical-align:top;padding:12px 14px;border-bottom:1px solid #ddd;overflow-wrap:anywhere}thead th{font-weight:700;border-bottom:2px solid #111}tbody th{font-weight:600}th:nth-child(1){width:26%}th:nth-child(2){width:36%}.code{font:20px/1.6 ui-monospace,monospace;overflow-wrap:normal;word-break:normal}@media(max-width:600px){body{padding:8px;font-size:14px}th,td{padding:12px 6px}th:nth-child(1){width:32%}th:nth-child(2){width:32%}.code{font-size:18px;line-height:1.65}}
</style></head><body><table aria-label="GTA 6 cheats"><thead><tr><th scope="col">Name</th><th scope="col">Cheat</th><th scope="col">What it does</th></tr></thead><tbody>${rows}</tbody></table></body></html>`
    yield write({ ctx, slug: "cheats" as FullSlug, ext: ".html", content })
  },
})
