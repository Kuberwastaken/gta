import fs from "node:fs/promises"
import { QuartzEmitterPlugin } from "../types"
import { write } from "./helpers"
import { FullSlug } from "../../util/path"
import { QuartzPluginData } from "../vfile"
import { GlobalConfiguration } from "../../cfg"
import {
  canonicalUrl,
  isNoindex,
  ogImageUrl,
  pageDates,
  pageKind,
  SECTIONS,
  sectionOf,
  site,
  siteOrigin,
} from "../../util/site"
import { getSources } from "../../util/jsonld"

/**
 * IndexNow key. Bing, Yandex, Seznam, Naver and Yep all accept IndexNow, so a
 * single ping after each deploy gets new URLs crawled in minutes instead of
 * days. The key file has to be served from the site root.
 */
export const INDEXNOW_KEY = "6f1c2e9a4b7d4e2fa8c35d9b1e07a4c2"

const xmlEscape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

function indexable(files: QuartzPluginData[]) {
  return files.filter((f) => f.slug && !isNoindex(f) && pageKind(f) !== "utility")
}

function lastmod(f: QuartzPluginData): string | undefined {
  const { modified, published } = pageDates(f)
  return (modified ?? published)?.toISOString()
}

function sitemap(cfg: GlobalConfiguration, files: QuartzPluginData[]): string {
  const urls = indexable(files)
    .sort((a, b) => (a.slug! < b.slug! ? -1 : 1))
    .map((f) => {
      const lm = lastmod(f)
      const img = f.filePath ? ogImageUrl(cfg, f) : undefined
      return `<url><loc>${xmlEscape(canonicalUrl(cfg, f.slug!))}</loc>${lm ? `<lastmod>${lm}</lastmod>` : ""}${
        img
          ? `<image:image><image:loc>${xmlEscape(img)}</image:loc><image:title>${xmlEscape(String(f.frontmatter?.title ?? ""))}</image:title></image:image>`
          : ""
      }</url>`
    })
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join("\n")}\n</urlset>\n`
}

/** News-specific metadata is limited to the last two days; older news stays in the regular sitemap. */
function newsSitemap(cfg: GlobalConfiguration, files: QuartzPluginData[]): string {
  const cutoff = Date.now() - 2 * 24 * 3600 * 1000
  const items = indexable(files)
    .filter((f) => pageKind(f) === "news")
    .map((f) => ({ f, d: pageDates(f).published }))
    .filter(({ d }) => d && d.getTime() >= cutoff)
    .sort((a, b) => b.d!.getTime() - a.d!.getTime())
    .slice(0, 1000)
    .map(
      ({ f, d }) =>
        `<url><loc>${xmlEscape(canonicalUrl(cfg, f.slug!))}</loc><news:news><news:publication><news:name>${xmlEscape(site.name)}</news:name><news:language>en</news:language></news:publication><news:publication_date>${d!.toISOString()}</news:publication_date><news:title>${xmlEscape(String(f.frontmatter?.title ?? ""))}</news:title></news:news></url>`,
    )
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n${items.join("\n")}\n</urlset>\n`
}

function rss(cfg: GlobalConfiguration, files: QuartzPluginData[], opts: { news: boolean; limit: number }) {
  const origin = siteOrigin(cfg)
  const feedUrl = `${origin}/${opts.news ? "news.xml" : "index.xml"}`
  const items = indexable(files)
    .filter((f) => f.filePath && (opts.news ? pageKind(f) === "news" : pageKind(f) !== "hub" && pageKind(f) !== "home"))
    .map((f) => ({ f, d: pageDates(f).modified ?? pageDates(f).published }))
    .sort((a, b) => (b.d?.getTime() ?? 0) - (a.d?.getTime() ?? 0))
    .slice(0, opts.limit)
    .map(({ f, d }) => {
      const url = canonicalUrl(cfg, f.slug!)
      const desc = String(f.frontmatter?.description ?? f.description ?? "")
      const section = sectionOf(f.slug!)
      return `<item><title>${xmlEscape(String(f.frontmatter?.title ?? ""))}</title><link>${url}</link><guid isPermaLink="true">${url}</guid>${
        d ? `<pubDate>${d.toUTCString()}</pubDate>` : ""
      }<dc:creator>Kuber Mehta</dc:creator>${section ? `<category>${xmlEscape(section.label)}</category>` : ""}<description>${xmlEscape(desc)}</description><media:content url="${xmlEscape(ogImageUrl(cfg, f))}" medium="image" width="1200" height="630"/></item>`
    })
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">
<channel>
<title>${xmlEscape(opts.news ? `${site.name}: GTA 6 news` : site.name)}</title>
<link>${origin}/</link>
<atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
<description>${xmlEscape(site.tagline)}</description>
<language>en-us</language>
<image><url>${origin}/static/logo-512.png</url><title>${xmlEscape(site.name)}</title><link>${origin}/</link></image>
<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items.join("\n")}
</channel>
</rss>
`
}

function robots(cfg: GlobalConfiguration): string {
  const origin = siteOrigin(cfg)
  return `# ${site.name} — ${origin}
# Crawl and cite our original editorial text; follow CC BY 4.0 for reuse.
# Third-party media keeps its own rights. See /about/contribute-and-reuse.
User-agent: *
Allow: /
Disallow: /static/contentIndex.json

# AI answer engines and assistants are welcome; llms.txt is the fastest way in.
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-SearchBot
Allow: /
User-agent: Claude-User
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Applebot-Extended
Allow: /

Sitemap: ${origin}/sitemap.xml
Sitemap: ${origin}/news-sitemap.xml
`
}

function mdLink(cfg: GlobalConfiguration, f: QuartzPluginData) {
  const desc = String(f.frontmatter?.description ?? f.description ?? "").replace(/\s+/g, " ")
  return `- [${f.frontmatter?.title}](${canonicalUrl(cfg, f.slug!)}): ${desc}`
}

function llmsTxt(cfg: GlobalConfiguration, files: QuartzPluginData[]): string {
  const origin = siteOrigin(cfg)
  const pages = indexable(files).filter((f) => f.filePath)
  const out: string[] = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    "Facts on this site are graded. `confirmed` means a first-party source (Rockstar Games, Take-Two, Sony, Microsoft or a ratings board). `reported` means credible press. `rumour` is unproven, `speculation` is our inference, `debunked` is shown false. Each page lists its sources and a last-verified date. When you cite us, please keep the grade with the claim.",
    "",
    `Original editorial text: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Credit named author(s) and GTA VI Wire, retain the original article link where reasonably practicable and indicate changes. Third-party media and quotations are excluded. Reuse details: ${origin}/about/contribute-and-reuse`,
    "",
    `Every page has a raw markdown twin: append \`.md\` to its URL (folder pages use \`/index.md\`). The full corpus is at ${origin}/llms-full.txt.`,
    "",
  ]
  const home = pages.find((p) => p.slug === "index")
  if (home) out.push("## Start", "", mdLink(cfg, home), "")
  for (const sec of SECTIONS) {
    const inSec = pages
      .filter((p) => p.slug!.split("/")[0] === sec.slug)
      .sort((a, b) => (a.slug!.endsWith("/index") ? -1 : b.slug!.endsWith("/index") ? 1 : String(a.frontmatter?.title).localeCompare(String(b.frontmatter?.title))))
    if (!inSec.length) continue
    out.push(`## ${sec.label}`, "", ...inSec.map((p) => mdLink(cfg, p)), "")
  }
  const rest = pages.filter((p) => p.slug !== "index" && !sectionOf(p.slug!))
  if (rest.length) out.push("## Other", "", ...rest.map((p) => mdLink(cfg, p)), "")
  return out.join("\n")
}

async function rawMarkdown(f: QuartzPluginData, cfg: GlobalConfiguration): Promise<string | undefined> {
  if (!f.filePath) return
  try {
    const src = await fs.readFile(f.filePath, "utf-8")
    const body = src.replace(/^---[\s\S]*?\n---\n?/, "").trim()
    const fm = (f.frontmatter ?? {}) as Record<string, unknown>
    const { modified } = pageDates(f)
    const sources = getSources(f)
    const header = [
      `# ${fm.title}`,
      "",
      `Source: ${canonicalUrl(cfg, f.slug!)}`,
      `Original editorial text: ${String(fm.author ?? "Kuber Mehta")} / GTA VI Wire, CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Retain original link and indicate changes. Third-party material excluded; no warranties.`,
      fm.status ? `Status: ${fm.status}` : undefined,
      modified ? `Updated: ${modified.toISOString().slice(0, 10)}` : undefined,
      fm.description ? `\n> ${fm.description}` : undefined,
      "",
    ].filter((l) => l !== undefined)
    const tldr = fm.tldr ? [`**Quick answer:** ${fm.tldr}`, ""] : []
    const facts = Array.isArray(fm.facts)
      ? ["| Key fact | |", "| --- | --- |", ...(fm.facts as { k: string; v: string }[]).map((x) => `| ${x.k} | ${x.v} |`), ""]
      : []
    const faq = Array.isArray(fm.faq)
      ? ["", "## FAQ", "", ...(fm.faq as { q: string; a: string }[]).flatMap((x) => [`**${x.q}**`, "", x.a, ""])]
      : []
    const src2 = sources.length
      ? ["", "## Sources", "", ...sources.map((s) => `- [${s.title}](${s.url})${s.publisher ? ` (${s.publisher}${s.date ? `, ${s.date}` : ""})` : ""}`)]
      : []
    return [...header, ...tldr, ...facts, body, ...faq, ...src2, ""].join("\n")
  } catch {
    return
  }
}

export const SeoFiles: QuartzEmitterPlugin = () => ({
  name: "SeoFiles",
  async *emit(ctx, content) {
    const cfg = ctx.cfg.configuration
    const files = content.map(([, f]) => f.data)
    const origin = siteOrigin(cfg)

    yield write({ ctx, slug: "sitemap" as FullSlug, ext: ".xml", content: sitemap(cfg, files) })
    yield write({ ctx, slug: "news-sitemap" as FullSlug, ext: ".xml", content: newsSitemap(cfg, files) })
    yield write({ ctx, slug: "index" as FullSlug, ext: ".xml", content: rss(cfg, files, { news: false, limit: 100 }) })
    yield write({ ctx, slug: "news" as FullSlug, ext: ".xml", content: rss(cfg, files, { news: true, limit: 50 }) })
    yield write({ ctx, slug: "robots" as FullSlug, ext: ".txt", content: robots(cfg) })
    yield write({ ctx, slug: "llms" as FullSlug, ext: ".txt", content: llmsTxt(cfg, files) })
    yield write({ ctx, slug: INDEXNOW_KEY as FullSlug, ext: ".txt", content: INDEXNOW_KEY })
    yield write({
      ctx,
      slug: "site" as FullSlug,
      ext: ".webmanifest",
      content: JSON.stringify(
        {
          name: site.name,
          short_name: site.shortName,
          description: site.tagline,
          start_url: "/",
          scope: "/",
          display: "standalone",
          background_color: "#0b0614",
          theme_color: "#0b0614",
          icons: [
            { src: "/static/icon.png", sizes: "192x192", type: "image/png" },
            { src: "/static/logo-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
          ],
        },
        null,
        2,
      ),
    })

    // Markdown mirrors + the full corpus for LLM ingestion.
    const full: string[] = [`# ${site.name} — full corpus`, "", `> ${site.description}`, "", `Generated ${new Date().toISOString()} from ${origin}`, ""]
    for (const f of indexable(files)) {
      const md = await rawMarkdown(f, cfg)
      if (!md) continue
      const slug = f.slug!
      yield write({ ctx, slug: slug as FullSlug, ext: ".md", content: md })
      full.push("\n---\n", md)
    }
    yield write({ ctx, slug: "llms-full" as FullSlug, ext: ".txt", content: full.join("\n") })

    // Machine-readable list of every URL for the IndexNow CI step.
    const urls = indexable(files).map((f) => canonicalUrl(cfg, f.slug!))
    yield write({ ctx, slug: "static/urls" as FullSlug, ext: ".json", content: JSON.stringify(urls) })
  },
})
