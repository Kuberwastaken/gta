import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { FullSlug, resolveRelative } from "../util/path"
import { canonicalUrl, pageDates, pageKind, SECTIONS, sectionOf, site, STATUS, StatusKey } from "../util/site"
import { getFaq, getSources, breadcrumbs } from "../util/jsonld"
import { inlineMd } from "../util/inlineMd"
import { byWeight, fm, href, realPages, relatedPages, sectionPages, title } from "../util/pages"
import { BANNERS, GLASS_MAP, HERO_ASCII } from "./ascii.generated"
import readingTime from "reading-time"
// @ts-ignore
import countdownScript from "./scripts/countdown.inline"
// @ts-ignore
import asciiScript from "./scripts/ascii.inline"

const iso = (d: Date) => d.toISOString().slice(0, 10)
const pad = (n: number) => String(n).padStart(2, "0")

/* ───────────── Brand ───────────── */
export function Mark({ size = 22 }: { size?: number }) {
  // Flat glyph: a setting sun cut by horizon lines, one solid colour.
  return (
    <svg class="mark" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 4a8 8 0 0 1 8 8H4a8 8 0 0 1 8-8Zm-8 9.5h16V15H4Zm1.5 3h13V18h-13Zm2.5 3h8V21H8Z" />
    </svg>
  )
}

function Wordmark() {
  return (
    <span class="wordmark">
      GTA VI <span>Wire</span>
    </span>
  )
}

/**
 * Liquid glass, after Kyant0/AndroidLiquidGlass: a lens displacement map
 * bends whatever is behind the element near its rim (refraction), plus blur
 * and saturation for the body, and a specular rim drawn in CSS. Chromium
 * honours `backdrop-filter: url()`; other engines fall back to plain frost.
 */
function GlassDefs() {
  return (
    <svg class="glass-defs" width="0" height="0" aria-hidden="true" focusable="false">
      <filter id="lg-refract" x="0" y="0" width="1" height="1" primitiveUnits="objectBoundingBox" color-interpolation-filters="sRGB">
        <feImage href={GLASS_MAP} x="0" y="0" width="1" height="1" preserveAspectRatio="none" result="map" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale="0.07" xChannelSelector="R" yChannelSelector="G" result="bent" />
        <feGaussianBlur in="bent" stdDeviation="0.004" />
      </filter>
    </svg>
  )
}

/* ───────────── Sidebar brand (Quartz page title slot) ───────────── */
export const SideBrand: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  const slug = fileData.slug as FullSlug
  return (
    <div class="side-brand">
      <GlassDefs />
      <a class="brand" href={resolveRelative(slug, "index" as FullSlug)} aria-label={`${site.name} home`}>
        <Mark />
        <Wordmark />
      </a>
    </div>
  )
}

/* ───────────── Countdown (liquid glass) ───────────── */
function CountdownInner({ compact }: { compact?: boolean }) {
  return (
    <div class={`cd-wrap ${compact ? "compact" : ""}`}>
      <CountdownCard compact={compact} />
    </div>
  )
}

function CountdownCard({ compact }: { compact?: boolean }) {
  return (
    <div class={`countdown glass ${compact ? "compact" : ""}`} data-release={site.game.releaseDate} aria-live="polite">
      <div class="cd-label">Launches in</div>
      <div class="cd-grid" hidden>
        <span><b data-u="d">--</b><i>days</i></span>
        <span><b data-u="h">--</b><i>hrs</i></span>
        <span><b data-u="m">--</b><i>min</i></span>
        <span><b data-u="s">--</b><i>sec</i></span>
      </div>
      <div class="cd-date">
        <time datetime={site.game.releaseDate}>Thursday, November 19, 2026</time>
      </div>
      <div class="cd-note">Midnight local store time, PS5 and Xbox Series X|S</div>
    </div>
  )
}

export const Countdown: QuartzComponentConstructor<{ compact?: boolean } | undefined> = (opts) => {
  const C: QuartzComponent = ({ fileData, displayClass }: QuartzComponentProps) => (
    <div class={displayClass}>
      <a class="countdown-link" href={resolveRelative(fileData.slug as FullSlug, "release/gta-6-release-time-by-country" as FullSlug)}>
        <CountdownInner compact={opts?.compact} />
      </a>
    </div>
  )
  C.afterDOMLoaded = countdownScript
  return C
}

/* ───────────── Home hero: the ASCII sunset is the one bright element ───────────── */
export const HomeHero: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  if (fileData.slug !== "index") return null
  return (
    <section class="hero" aria-label="Vice City at sunset, drawn in ASCII">
      <pre class="ascii ascii-scene" aria-hidden="true" data-ascii="scene">
        {HERO_ASCII}
      </pre>
    </section>
  )
}
HomeHero.afterDOMLoaded = countdownScript + "\n" + asciiScript

/* ───────────── Home: sections, with a wider lead cell ───────────── */
export const HomeSections: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
  if (fileData.slug !== "index") return null
  const slug = fileData.slug as FullSlug
  const tiles = SECTIONS.filter((s) => s.slug !== "about")
    .map((s) => ({ s, pages: sectionPages(allFiles, s.slug) }))
    .filter((t) => t.pages.length > 0)
  const total = tiles.reduce((a, t) => a + t.pages.length, 0)
  return (
    <section class="index-grid panel" aria-labelledby="idx-h">
      <div class="block-head">
        <h2 id="idx-h">Sections</h2>
        <span class="meta">{total} pages</span>
      </div>
      <div class="cells">
        {tiles.map(({ s, pages }, i) => {
          const limit = i === 0 ? 10 : 5
          return (
            <div class={`cell ${i === 0 ? "cell-lead" : ""}`}>
              <a class="cell-head" href={resolveRelative(slug, `${s.slug}/index` as FullSlug)}>
                <h3>{s.label}</h3>
                <span class="meta">{pages.length}</span>
              </a>
              <p class="cell-blurb">{s.blurb}</p>
              <ul>
                {pages.slice(0, limit).map((p) => (
                  <li>
                    <a href={href(slug, p.slug!)}>
                      <StatusDot status={fm(p).status} />
                      <span>{title(p)}</span>
                    </a>
                  </li>
                ))}
              </ul>
              {pages.length > limit && (
                <a class="cell-more" href={resolveRelative(slug, `${s.slug}/index` as FullSlug)}>
                  All {pages.length} pages
                </a>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export const HomeLatest: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
  if (fileData.slug !== "index") return null
  const slug = fileData.slug as FullSlug
  // Latest first: news by publish date, then everything else, newest edits on top.
  const pages = realPages(allFiles).filter(
    (p) => p.slug !== "index" && p.slug !== "graph" && !p.slug!.endsWith("/index") && !p.slug!.startsWith("about/"),
  )
  const ts = (p: (typeof pages)[number]) => pageDates(p).published?.getTime() ?? 0
  const news = pages.filter((p) => p.slug!.startsWith("news/")).sort((a, b) => ts(b) - ts(a))
  const rest = pages.filter((p) => !p.slug!.startsWith("news/")).sort((a, b) => ts(b) - ts(a) || byWeight(a, b))
  const [lead, ...others] = [...news, ...rest]
  const card = (p: (typeof pages)[number], big = false) => {
    const d = pageDates(p).published
    const sec = sectionOf(p.slug!)
    return (
      <a class={`post ${big ? "post-lead" : ""}`} href={href(slug, p.slug!)}>
        <span class="post-meta">
          <span class="post-sec">{sec?.label}</span>
          {d && <time datetime={d.toISOString()}>{d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}</time>}
          <StatusBadge status={fm(p).status} />
        </span>
        <span class="post-title">{String(fm(p).title ?? title(p))}</span>
        <span class="post-desc">{String(fm(p).description ?? "")}</span>
      </a>
    )
  }
  return (
    <section class="latest" aria-labelledby="latest-h">
      <div class="latest-head">
        <h1 id="latest-h">Latest on GTA 6</h1>
        <a href="/index.xml">RSS</a>
      </div>
      {lead && card(lead, true)}
      <div class="post-grid">{others.slice(0, 18).map((p) => card(p))}</div>
    </section>
  )
}

/* ───────────── Topic graph intro + legend: the second moment ───────────── */
export const GraphIntro: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
  if (fileData.slug !== "graph") return null
  const n = realPages(allFiles).length
  return (
    <div class="graph-intro">
      <div class="block-head">
        <h2>Topic graph</h2>
        <span class="meta">{n} pages</span>
      </div>
      <p class="graph-lede">
        Each page is a node and each link an edge; bigger nodes have more connections, hollow ones are tags. Hover to
        light up a topic's neighbours, scroll to zoom, drag to rearrange, click to open. Press <kbd>Ctrl</kbd>{" "}
        <kbd>K</kbd> to search, <kbd>Ctrl</kbd> <kbd>G</kbd> on any page for this map.
      </p>
    </div>
  )
}

/* ───────────── Section hub banner (figlet ASCII, neutral) ───────────── */
export const HubBanner: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  const slug = fileData.slug ?? ""
  const key = slug === "graph" ? "graph" : slug.endsWith("/index") ? slug.split("/")[0] : undefined
  if (!key || !BANNERS[key]) return null
  return (
    <div class="hub-banner" aria-hidden="true">
      <pre class="ascii">{BANNERS[key]}</pre>
    </div>
  )
}

/* ───────────── Grades: the signature ───────────── */
export function StatusDot({ status }: { status?: string }) {
  if (!status || !(status in STATUS)) return <span class="sdot" aria-hidden="true" />
  return <span class={`sdot s-${status}`} title={STATUS[status as StatusKey].label} aria-hidden="true" />
}

export function StatusBadge({ status }: { status?: string }) {
  if (!status || !(status in STATUS)) return null
  const s = STATUS[status as StatusKey]
  return (
    <span class={`badge s-${status}`} title={s.hint}>
      {s.label.toLowerCase()}
    </span>
  )
}

export const StatusLegend: QuartzComponent = () => (
  <ul class="legend">
    {(Object.keys(STATUS) as StatusKey[]).map((k) => (
      <li>
        <StatusBadge status={k} /> <span>{STATUS[k].hint}</span>
      </li>
    ))}
  </ul>
)

/* ───────────── Article meta ───────────── */
export const PageMeta: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  const kind = pageKind(fileData)
  if (kind === "home" || kind === "tag" || kind === "listing") return null
  const f = fm(fileData)
  const { published, modified } = pageDates(fileData)
  const verified = f.verified ? new Date(String(f.verified)) : undefined
  const mins = Math.max(1, Math.ceil(readingTime(fileData.text ?? "").minutes))
  return (
    <div class="pagemeta">
      <StatusBadge status={f.status} />
      {modified && (
        <span>
          Updated <time class="mono" datetime={modified.toISOString()}>{iso(modified)}</time>
        </span>
      )}
      {verified && !isNaN(verified.getTime()) && (
        <span>
          Verified <time class="mono" datetime={verified.toISOString()}>{iso(verified)}</time>
        </span>
      )}
      {published && kind === "news" && (
        <span>
          Published <time class="mono" datetime={published.toISOString()}>{iso(published)}</time>
        </span>
      )}
      <span>{mins} min read</span>
      <span>
        By <a href="https://kuber.studio/" rel="author">Kuber Mehta</a>
      </span>
    </div>
  )
}

/* ───────────── Quick answer + key facts ───────────── */
export const QuickAnswer: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  const f = fm(fileData)
  const facts = (Array.isArray(f.facts) ? f.facts : []) as { k: string; v: string }[]
  if (!f.tldr && facts.length === 0) return null
  const slug = fileData.slug as FullSlug
  return (
    <div class="answer">
      {f.tldr && (
        <div class="tldr panel">
          <div class="label">Quick answer</div>
          <p dangerouslySetInnerHTML={{ __html: inlineMd(f.tldr, slug) }} />
        </div>
      )}
      {facts.length > 0 && (
        <div class="factbox panel">
          <div class="label">Key facts</div>
          <dl>
            {facts.map((x) => (
              <>
                <dt>{x.k}</dt>
                <dd dangerouslySetInnerHTML={{ __html: inlineMd(String(x.v), slug) }} />
              </>
            ))}
          </dl>
        </div>
      )}
    </div>
  )
}

/* ───────────── FAQ + sources ───────────── */
export const FaqBlock: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  const faq = getFaq(fileData)
  if (!faq.length) return null
  const slug = fileData.slug as FullSlug
  return (
    <section class="faq panel" aria-labelledby="faq-h">
      <div class="block-head">
        <h2 id="faq-h">Frequently asked</h2>
        <span class="meta">{faq.length} questions</span>
      </div>
      {faq.map((x, i) => (
        <details open={i < 3}>
          <summary>
            <span class="mono q-no">{pad(i + 1)}</span>
            <h3>{x.q}</h3>
          </summary>
          <p dangerouslySetInnerHTML={{ __html: inlineMd(x.a, slug) }} />
        </details>
      ))}
    </section>
  )
}

export const SourcesBlock: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  const sources = getSources(fileData)
  const f = fm(fileData)
  if (!sources.length) return null
  const primary = sources.filter((s) => s.tier === "primary").length
  return (
    <section class="sources panel" aria-labelledby="src-h">
      <div class="block-head">
        <h2 id="src-h">Sources</h2>
        <span class="meta">
          {primary} first-party of {sources.length}
          {f.verified ? `, checked ${iso(new Date(String(f.verified)))}` : ""}
        </span>
      </div>
      <ol>
        {sources.map((s, i) => (
          <li>
            <span class="mono src-no">{pad(i + 1)}</span>
            <span class="src-body">
              <a class="external" href={s.url} rel="noopener" target="_blank">
                {s.title}
              </a>
              <span class="src-pub">
                {[s.publisher, s.date].filter(Boolean).join(", ")}
                {s.tier === "primary" && <span class="badge s-confirmed">first-party</span>}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}

/* ───────────── Related + prev/next ───────────── */
export const RelatedBlock: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
  const kind = pageKind(fileData)
  if (kind === "home" || kind === "tag" || kind === "listing" || kind === "utility") return null
  const rel = relatedPages(fileData, allFiles, 6)
  if (!rel.length) return null
  const slug = fileData.slug as FullSlug
  return (
    <section class="related panel" aria-labelledby="rel-h">
      <div class="block-head">
        <h2 id="rel-h">Keep reading</h2>
      </div>
      <div class="cells rel-cells">
        {rel.map((p) => (
          <a class="cell rel-card" href={href(slug, p.slug!)}>
            <span class="rel-sec">{sectionOf(p.slug!)?.label}</span>
            <span class="rel-title">{title(p)}</span>
            <span class="rel-desc">{String(fm(p).description ?? "").slice(0, 120)}</span>
          </a>
        ))}
      </div>
    </section>
  )
}

export const PrevNext: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
  if (pageKind(fileData) !== "article") return null
  const section = fileData.slug!.split("/")[0]
  const list = sectionPages(allFiles, section)
  const i = list.findIndex((p) => p.slug === fileData.slug)
  if (i < 0 || list.length < 2) return null
  const prev = list[i - 1]
  const next = list[i + 1]
  const slug = fileData.slug as FullSlug
  return (
    <nav class="prevnext" aria-label="More in this section">
      {prev ? (
        <a rel="prev" href={href(slug, prev.slug!)}>
          <span>Previous</span>
          {title(prev)}
        </a>
      ) : (
        <span />
      )}
      {next ? (
        <a rel="next" href={href(slug, next.slug!)}>
          <span>Next</span>
          {title(next)}
        </a>
      ) : (
        <span />
      )}
    </nav>
  )
}

/* ───────────── Breadcrumbs (match JSON-LD) ───────────── */
export const Crumbs: QuartzComponent = ({ cfg, fileData, allFiles }: QuartzComponentProps) => {
  const c = breadcrumbs(cfg, fileData, allFiles)
  if (c.length < 2) return null
  const slug = fileData.slug as FullSlug
  const origin = canonicalUrl(cfg, "index")
  return (
    <nav class="crumbs" aria-label="Breadcrumb">
      {c.map((x, i) => {
        const rel = x.url.startsWith(origin) ? x.url.slice(origin.length) : x.url
        const target = (rel === "" ? "index" : rel.replace(/\/$/, "/index")) as FullSlug
        return i === c.length - 1 ? (
          <span aria-current="page">{x.name}</span>
        ) : (
          <>
            <a href={resolveRelative(slug, target)}>{x.name}</a>
            <span class="sep" aria-hidden="true">/</span>
          </>
        )
      })}
    </nav>
  )
}

/* ───────────── Footer: editorial ───────────── */
export const ViceFooter: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
  const slug = fileData.slug as FullSlug
  const year = new Date().getFullYear()
  const to = (s: string) => resolveRelative(slug, s as FullSlug)
  return (
    <footer class="vfooter">
      <div class="vf-top">
        <p class="vf-line">
          Sourced, graded GTA 6 coverage from Vice City to the Keys. Written by{" "}
          <a href="https://kuber.studio/">Kuber Mehta</a>.
        </p>
        <a class="vf-up" href="#">
          Back to top ↑
        </a>
      </div>
      <div class="vf-cols">
        <nav aria-label="Read">
          <h2>Read</h2>
          <a href={to("release/index")}>Release and buying</a>
          <a href={to("characters/index")}>Characters</a>
          <a href={to("world/index")}>World and map</a>
          <a href={to("leaks/index")}>Leaks ledger</a>
          <a href={to("news/index")}>News</a>
        </nav>
        <nav aria-label="About">
          <h2>About</h2>
          <a href={to("about/index")}>About the site</a>
          <a href={to("about/how-we-grade")}>How we grade</a>
          <a href={to("about/corrections")}>Corrections</a>
          <a href={to("graph")}>Topic graph</a>
        </nav>
        <nav aria-label="Follow">
          <h2>Follow</h2>
          <a href="/index.xml">RSS</a>
          <a href="/news.xml">News RSS</a>
          <a href="https://x.com/Kuberwastaken">X</a>
          <a href="https://github.com/Kuberwastaken">GitHub</a>
        </nav>
      </div>
      <a class="vf-word" href={to("index")} aria-label={`${site.name} home`}>
        GTA VI <span>Wire</span>
      </a>
      <p class="vf-legal">
        © {year} {site.name}. Independent fan reference, not affiliated with Rockstar Games or Take-Two Interactive.
        Grand Theft Auto and GTA are trademarks of Take-Two Interactive Software, Inc.
      </p>
    </footer>
  )
}

export const c = <T extends QuartzComponent>(comp: T) => (() => comp) satisfies QuartzComponentConstructor
