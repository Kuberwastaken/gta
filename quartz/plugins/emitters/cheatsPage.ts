import { QuartzEmitterPlugin } from "../types"
import { write } from "./helpers"
import { FullSlug } from "../../util/path"
import cheats from "../../util/cheats.json"

const escape = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

/** Deliberately standalone: this route contains only the requested cheat table. */
export const CheatsPage: QuartzEmitterPlugin = () => ({
  name: "CheatsPage",
  async *emit(ctx) {
    const rows = cheats.map(({ name, cheat, effect }) => `<tr><th scope="row">${escape(name)}</th><td class="code${cheat === "Unknown" ? " unknown" : ""}">${escape(cheat)}</td><td>${escape(effect)}</td></tr>`).join("\n")
    const content = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GTA 6 Cheats</title><link rel="canonical" href="https://gta.kuber.studio/cheats"><style>
@font-face{font-family:Jost;src:url(/static/fonts/92zatBhPNqw73oTd4g.woff2) format("woff2");font-weight:100 900;font-display:swap}@font-face{font-family:"Big Shoulders Display";src:url(/static/fonts/fC1_PZJEZG-e9gHhdI4-NBbfd2ys3SjJCx1czNDu.woff2) format("woff2");font-weight:100 900;font-display:swap}
*{box-sizing:border-box}html{color-scheme:light;--bg:#fff6ef;--panel:#fffaf6;--text:#4a3550;--strong:#1e0f26;--line:#f0dfd8;--pink:#d1145a;--gold:#a94b00;--muted:#8a6f80;--wash:rgba(209,20,90,.035)}html[saved-theme=dark]{color-scheme:dark;--bg:#000;--panel:#0b0b0e;--text:#b4b4bb;--strong:#f5f5f7;--line:#26232a;--pink:#ff4d8d;--gold:#ff9a3c;--muted:#85858d;--wash:rgba(255,77,141,.035)}body{margin:0;padding:32px 24px;color:var(--text);background:radial-gradient(ellipse at 85% 0%,rgba(209,20,90,.08),transparent 45%),var(--bg);font:17px/1.55 Jost,system-ui,sans-serif}table{width:100%;max-width:1180px;margin:0 auto;border:1px solid var(--line);border-spacing:0;border-radius:16px;overflow:hidden;table-layout:fixed;background:var(--panel);box-shadow:0 12px 40px rgba(30,15,38,.06)}th,td{text-align:left;vertical-align:top;padding:16px 20px;border-bottom:1px solid var(--line);overflow-wrap:anywhere}thead th{font:800 24px/1.2 "Big Shoulders Display",sans-serif;color:var(--pink);letter-spacing:.025em;border-top:3px solid var(--pink);background:var(--wash)}tbody th{font-weight:600;color:var(--strong)}tbody tr:nth-child(even){background:var(--wash)}tbody tr:last-child>*{border-bottom:0}th:nth-child(1){width:26%}th:nth-child(2){width:36%}.code{font:20px/1.6 ui-monospace,monospace;color:var(--gold);overflow-wrap:normal;word-break:normal}.unknown{font:400 16px/2 Jost,system-ui,sans-serif;color:var(--muted)}@media(max-width:600px){body{padding:16px 10px;font-size:14px}table{border-radius:12px}th,td{padding:13px 8px}thead th{font-size:20px;padding-top:15px;padding-bottom:15px}th:nth-child(1){width:32%}th:nth-child(2){width:32%}.code{font-size:18px;line-height:1.65}.unknown{font-size:14px;line-height:1.65}}

</style><script>try{document.documentElement.setAttribute("saved-theme",localStorage.getItem("theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"))}catch{}</script></head><body><table aria-label="GTA 6 cheats"><thead><tr><th scope="col">Name</th><th scope="col">Cheat</th><th scope="col">What it does</th></tr></thead><tbody>${rows}</tbody></table></body></html>`
    yield write({ ctx, slug: "cheats" as FullSlug, ext: ".html", content })
  },
})
