import { QuartzPluginData } from "../plugins/vfile"
import { FullSlug, resolveRelative, simplifySlug } from "./path"
import { pageDates } from "./site"

export type Page = QuartzPluginData

export const fm = (p: Page) => (p.frontmatter ?? {}) as Record<string, any>

export function realPages(all: Page[]): Page[] {
  return all.filter((p) => p.filePath && p.slug && p.slug !== "404" && !fm(p).draft)
}

/** Pages directly inside a section (excluding its index), ordered by `weight` then freshness. */
export function sectionPages(all: Page[], section: string): Page[] {
  return realPages(all)
    .filter((p) => p.slug!.startsWith(section + "/") && !p.slug!.endsWith("/index"))
    .sort(byWeight)
}

export function byWeight(a: Page, b: Page): number {
  const wa = Number(fm(a).weight ?? 50)
  const wb = Number(fm(b).weight ?? 50)
  if (wa !== wb) return wa - wb
  return byFreshness(a, b)
}

export function byFreshness(a: Page, b: Page): number {
  const da = pageDates(a).modified?.getTime() ?? 0
  const db = pageDates(b).modified?.getTime() ?? 0
  return db - da
}

export function byPublished(a: Page, b: Page): number {
  const da = pageDates(a).published?.getTime() ?? 0
  const db = pageDates(b).published?.getTime() ?? 0
  return db - da
}

export function href(from: FullSlug | string, to: string): string {
  return resolveRelative(from as FullSlug, to as FullSlug)
}

export function title(p: Page): string {
  return String(fm(p).shortTitle ?? fm(p).title ?? p.slug)
}

/**
 * Related pages, computed at build time so the links are in the HTML that
 * crawlers see. Score = shared tags + direct links either way + same section,
 * plus any explicit `related:` slugs which always come first.
 */
export function relatedPages(cur: Page, all: Page[], limit = 6): Page[] {
  const pages = realPages(all).filter((p) => p.slug !== cur.slug && !p.slug!.endsWith("/index"))
  const curTags = new Set<string>((fm(cur).tags ?? []) as string[])
  const curLinks = new Set<string>((cur.links ?? []) as string[])
  const curSimple = simplifySlug(cur.slug as FullSlug)
  const curSection = cur.slug!.split("/")[0]
  const explicit = ((fm(cur).related ?? []) as string[]).map((s) => s.replace(/^\//, "").replace(/\.md$/, ""))

  const scored = pages.map((p) => {
    let score = 0
    for (const t of (fm(p).tags ?? []) as string[]) if (curTags.has(t)) score += 3
    if (curLinks.has(simplifySlug(p.slug as FullSlug))) score += 2
    if ((p.links ?? []).includes(curSimple)) score += 4
    if (p.slug!.split("/")[0] === curSection) score += 1
    const ex = explicit.indexOf(p.slug!)
    if (ex >= 0) score += 100 - ex
    return { p, score }
  })
  return scored
    .filter((s) => s.score > 1)
    .sort((a, b) => b.score - a.score || byFreshness(a.p, b.p))
    .slice(0, limit)
    .map((s) => s.p)
}
