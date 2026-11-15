import { GlobalConfiguration } from "../cfg"
import { QuartzPluginData } from "../plugins/vfile"
import { FullSlug, joinSegments, simplifySlug } from "./path"

/**
 * Single source of truth for the site's identity. Head tags, JSON-LD, RSS,
 * sitemaps, llms.txt and the OG images all read from here so every surface
 * describes the same entities.
 */
export const site = {
  name: "GTA VI Wire",
  alternateName: "GTA 6 Wire",
  shortName: "VI Wire",
  tagline: "The GTA 6 field guide: sourced facts, guides, map, characters and a graded leaks ledger.",
  description:
    "GTA VI Wire is an independent, sourced reference for Grand Theft Auto VI: release times, editions, characters, the Leonida map, vehicles, music, trailers and a graded leaks ledger. Every claim is labelled confirmed, reported or rumour.",
  themeColor: "#0b0614",
  locale: "en_US",
  twitter: "Kuberwastaken",
  repo: "https://github.com/Kuberwastaken/gta",
  // The subject of the whole site.
  game: {
    name: "Grand Theft Auto VI",
    alternateName: ["GTA 6", "GTA VI", "Grand Theft Auto 6"],
    releaseDate: "2026-11-19",
    developer: "Rockstar Games",
    publisher: "Rockstar Games",
    parent: "Take-Two Interactive",
    platforms: ["PlayStation 5", "Xbox Series X", "Xbox Series S"],
    genre: ["Action-adventure", "Open world"],
    url: "https://www.rockstargames.com/VI",
    sameAs: [
      "https://www.rockstargames.com/VI",
      "https://en.wikipedia.org/wiki/Grand_Theft_Auto_VI",
    ],
  },
}

export const author = {
  name: "Kuber Mehta",
  alternateName: "kuberwastaken",
  url: "https://kuber.studio/",
  id: "https://kuber.studio/#person",
  image: "https://kuber.studio/embed-image.png",
  jobTitle: "Developer and writer",
  sameAs: [
    "https://kuber.studio/",
    "https://kuber.studio/blog/",
    "https://github.com/Kuberwastaken",
    "https://x.com/Kuberwastaken",
    "https://www.linkedin.com/in/kubermehta/",
    "https://www.youtube.com/@Kuberwastaken",
  ],
}

/** Origin of the deployed site, no trailing slash. */
export function siteOrigin(cfg: GlobalConfiguration): string {
  return `https://${cfg.baseUrl ?? "example.com"}`
}

/**
 * Canonical absolute URL for a slug. Folder and root index pages collapse to
 * the directory URL (`/guides/`) that every internal link uses, so link equity
 * is never split between `/guides/index` and `/guides/`.
 */
export function canonicalUrl(cfg: GlobalConfiguration, slug: FullSlug | string): string {
  const simple = simplifySlug(slug as FullSlug)
  if (simple === "/" || simple === "") return `${siteOrigin(cfg)}/`
  return `https://${joinSegments(cfg.baseUrl ?? "", encodeURI(simple))}`
}

export type PageKind = "home" | "hub" | "article" | "news" | "tag" | "listing" | "utility"

/** Classifies what a rendered page is, which drives schema, robots and sitemap choices. */
export function pageKind(fd: QuartzPluginData): PageKind {
  const slug = (fd.slug ?? "") as string
  if (slug === "index") return "home"
  if (slug === "404") return "utility"
  if (slug.startsWith("tags/") || slug === "tags") return "tag"
  if (slug.endsWith("/index")) return fd.filePath ? "hub" : "listing"
  if (!fd.filePath) return "listing"
  if (slug.startsWith("news/")) return "news"
  const fm = fd.frontmatter as Record<string, unknown> | undefined
  if (fm?.pageType === "utility") return "utility"
  return "article"
}

/**
 * Pages that should stay out of the index: the 404, generated listings with no
 * authored copy, explicit `noindex: true`, and drafts. Tag pages are indexable
 * only when they have an authored intro (content/tags/<tag>.md), otherwise
 * they are thin auto-generated lists that compete with the real hubs.
 */
export function isNoindex(fd: QuartzPluginData): boolean {
  const fm = (fd.frontmatter ?? {}) as Record<string, unknown>
  if (fm.noindex === true || fm.noindex === "true") return true
  const kind = pageKind(fd)
  if (kind === "utility" && fd.slug === "404") return true
  if (kind === "tag") return !(fd.filePath && (fd.text ?? "").trim().length > 200)
  if (kind === "listing") return true
  return false
}

function parseDate(raw: unknown): Date | undefined {
  if (raw === undefined || raw === null || raw === "") return undefined
  const d = raw instanceof Date ? raw : new Date(String(raw))
  return isNaN(d.getTime()) ? undefined : d
}

/**
 * Only frontmatter dates are trusted. Filesystem mtimes in CI are checkout
 * times; advertising them as `dateModified` would claim every page was
 * rewritten on every deploy.
 */
export function pageDates(fd: QuartzPluginData): { published?: Date; modified?: Date } {
  const fm = (fd.frontmatter ?? {}) as Record<string, unknown>
  const published = parseDate(fm.published ?? fm.date ?? fm.created)
  const modified = parseDate(fm.updated ?? fm.modified ?? fm.lastmod) ?? published
  return { published, modified }
}

/** `<title>` text. Frontmatter `seoTitle` wins; the brand is appended when it fits. */
export function documentTitle(fd: QuartzPluginData): string {
  const fm = (fd.frontmatter ?? {}) as Record<string, unknown>
  const base = String(fm.seoTitle ?? fm.title ?? site.name)
  if (fd.slug === "index") return base
  const suffix = ` | ${site.name}`
  // Google truncates around 60 characters; keep the keyword-bearing part intact.
  return base.length + suffix.length <= 65 ? base + suffix : base
}

export function ogImageUrl(cfg: GlobalConfiguration, fd: QuartzPluginData): string {
  const fm = (fd.frontmatter ?? {}) as Record<string, unknown>
  const custom = fm.socialImage as string | undefined
  if (custom) {
    return /^https?:\/\//.test(custom) ? custom : `${siteOrigin(cfg)}/static/${custom}`
  }
  if (fd.filePath && fd.slug !== "404") return `${siteOrigin(cfg)}/${fd.slug}-og-image.jpg`
  return `${siteOrigin(cfg)}/static/og-image.jpg`
}

export const SECTIONS: { slug: string; label: string; nav: string; color: string; blurb: string }[] =
  [
    { slug: "release", label: "Release & Buying", nav: "Release", color: "#ff4fa3", blurb: "Unlock times, preload, editions, prices and platforms." },
    { slug: "guides", label: "Guides", nav: "Guides", color: "#ff9f43", blurb: "Day-one checklists, how-tos and what to do first." },
    { slug: "characters", label: "Characters", nav: "Characters", color: "#22d3ee", blurb: "Jason, Lucia and everyone they run into." },
    { slug: "world", label: "World & Map", nav: "Map", color: "#34d399", blurb: "Leonida, Vice City and the real Florida behind it." },
    { slug: "gameplay", label: "Gameplay", nav: "Gameplay", color: "#a78bfa", blurb: "Mechanics, vehicles, weapons, activities and systems." },
    { slug: "music", label: "Music & Radio", nav: "Music", color: "#f472b6", blurb: "Every confirmed song, trailer track and station." },
    { slug: "media", label: "Trailers & Media", nav: "Trailers", color: "#facc15", blurb: "Trailers, screenshots and every frame analysed." },
    { slug: "timeline", label: "Timeline", nav: "Timeline", color: "#60a5fa", blurb: "From the 2022 leak to launch day, dated and sourced." },
    { slug: "leaks", label: "Leaks Ledger", nav: "Leaks", color: "#f87171", blurb: "Every rumour graded: confirmed, debunked or still open." },
    { slug: "news", label: "News", nav: "News", color: "#e879f9", blurb: "What changed, when, and what it means." },
    { slug: "about", label: "About", nav: "About", color: "#94a3b8", blurb: "Who runs this, how we grade, corrections." },
  ]

export function sectionOf(slug: string) {
  const first = slug.split("/")[0]
  return SECTIONS.find((s) => s.slug === first)
}

export const STATUS = {
  confirmed: { label: "Confirmed", hint: "First-party source: Rockstar, Take-Two, a platform holder or a ratings board." },
  reported: { label: "Reported", hint: "Credible outlets, not yet first-party." },
  rumour: { label: "Rumour", hint: "Unproven. Treat with caution." },
  speculation: { label: "Speculation", hint: "Our own inference from the evidence." },
  debunked: { label: "Debunked", hint: "Shown false or outdated." },
  mixed: { label: "Mixed", hint: "This page mixes confirmed facts and open claims; each is labelled inline." },
} as const

export type StatusKey = keyof typeof STATUS
