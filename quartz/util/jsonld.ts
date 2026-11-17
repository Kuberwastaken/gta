import { GlobalConfiguration } from "../cfg"
import { QuartzPluginData } from "../plugins/vfile"
import { FullSlug } from "./path"
import {
  author,
  canonicalUrl,
  pageDates,
  pageKind,
  sectionOf,
  site,
  siteOrigin,
} from "./site"

type Node = Record<string, unknown>

export interface Source {
  title: string
  url: string
  publisher?: string
  date?: string
  tier?: "primary" | "secondary" | string
}

export interface Faq {
  q: string
  a: string
}

export function getSources(fd: QuartzPluginData): Source[] {
  const raw = (fd.frontmatter as Record<string, unknown> | undefined)?.sources
  return Array.isArray(raw) ? (raw.filter((s) => s && (s as Source).url) as Source[]) : []
}

export function getFaq(fd: QuartzPluginData): Faq[] {
  const raw = (fd.frontmatter as Record<string, unknown> | undefined)?.faq
  return Array.isArray(raw) ? (raw.filter((f) => f && (f as Faq).q && (f as Faq).a) as Faq[]) : []
}

function stripMd(s: string): string {
  return s
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, (_, p) => p.split("/").pop())
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`]/g, "")
}

function orgNode(cfg: GlobalConfiguration): Node {
  const origin = siteOrigin(cfg)
  return {
    "@type": "Organization",
    "@id": `${origin}/#org`,
    name: site.name,
    alternateName: site.alternateName,
    url: `${origin}/`,
    logo: {
      "@type": "ImageObject",
      "@id": `${origin}/#logo`,
      url: `${origin}/static/logo-512.png`,
      width: 512,
      height: 512,
      caption: site.name,
    },
    founder: { "@id": author.id },
    parentOrganization: { "@type": "Organization", name: "Kuber Studio", url: "https://kuber.studio/" },
    sameAs: [site.repo, `https://x.com/${site.twitter}`],
  }
}

function personNode(): Node {
  return {
    "@type": "Person",
    "@id": author.id,
    name: author.name,
    alternateName: author.alternateName,
    url: author.url,
    image: author.image,
    jobTitle: author.jobTitle,
    sameAs: author.sameAs,
  }
}

function websiteNode(cfg: GlobalConfiguration): Node {
  const origin = siteOrigin(cfg)
  return {
    "@type": "WebSite",
    "@id": `${origin}/#website`,
    name: site.name,
    alternateName: [site.alternateName, "gta.kuber.studio"],
    url: `${origin}/`,
    description: site.description,
    inLanguage: cfg.locale ?? "en-US",
    publisher: { "@id": `${origin}/#org` },
    about: { "@id": `${origin}/#game` },
  }
}

export function gameNode(cfg: GlobalConfiguration): Node {
  const origin = siteOrigin(cfg)
  const g = site.game
  return {
    "@type": "VideoGame",
    "@id": `${origin}/#game`,
    name: g.name,
    alternateName: g.alternateName,
    url: g.url,
    sameAs: g.sameAs,
    datePublished: g.releaseDate,
    genre: g.genre,
    gamePlatform: g.platforms,
    playMode: "SinglePlayer",
    author: { "@type": "Organization", name: g.developer },
    publisher: { "@type": "Organization", name: g.publisher, parentOrganization: { "@type": "Organization", name: g.parent } },
    contentRating: "ESRB M",
    gameLocation: [
      { "@type": "Place", name: "Leonida" },
      { "@type": "Place", name: "Vice City" },
    ],
    character: [
      { "@type": "Person", name: "Jason Duval" },
      { "@type": "Person", name: "Lucia Caminos" },
    ],
  }
}

function titleFor(slug: string, allFiles: QuartzPluginData[]): string | undefined {
  return allFiles.find((f) => f.slug === slug)?.frontmatter?.title
}

/** Breadcrumbs with real page titles, mirroring the visible trail. */
export function breadcrumbs(
  cfg: GlobalConfiguration,
  fd: QuartzPluginData,
  allFiles: QuartzPluginData[],
): { name: string; url: string }[] {
  const slug = (fd.slug ?? "") as string
  if (slug === "index") return []
  const crumbs = [{ name: "Home", url: `${siteOrigin(cfg)}/` }]
  const parts = slug.split("/")
  const isIndex = parts[parts.length - 1] === "index"
  const folders = parts.slice(0, isIndex ? -2 : -1)
  let walked = ""
  for (const seg of folders) {
    walked = walked ? `${walked}/${seg}` : seg
    const name =
      sectionOf(walked)?.label && !walked.includes("/")
        ? sectionOf(walked)!.label
        : (titleFor(`${walked}/index`, allFiles) ?? seg.replaceAll("-", " "))
    crumbs.push({ name, url: canonicalUrl(cfg, `${walked}/index`) })
  }
  crumbs.push({
    name: String(fd.frontmatter?.shortTitle ?? fd.frontmatter?.title ?? slug),
    url: canonicalUrl(cfg, slug),
  })
  return crumbs
}

interface Ctx {
  title: string
  description: string
  image: string
  allFiles: QuartzPluginData[]
}

export function buildJsonLd(cfg: GlobalConfiguration, fd: QuartzPluginData, ctx: Ctx): Node {
  const origin = siteOrigin(cfg)
  const slug = (fd.slug ?? "") as FullSlug
  const url = canonicalUrl(cfg, slug)
  const kind = pageKind(fd)
  const fm = (fd.frontmatter ?? {}) as Record<string, unknown>
  const { published, modified } = pageDates(fd)
  const tags = (fm.tags ?? []) as string[]
  const lang = cfg.locale ?? "en-US"
  const graph: Node[] = [orgNode(cfg), personNode(), websiteNode(cfg), gameNode(cfg)]

  const crumbs = breadcrumbs(cfg, fd, ctx.allFiles)
  const crumbNode: Node | undefined =
    crumbs.length > 1
      ? {
          "@type": "BreadcrumbList",
          "@id": `${url}#breadcrumb`,
          itemListElement: crumbs.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.name,
            item: c.url,
          })),
        }
      : undefined
  if (crumbNode) graph.push(crumbNode)

  const imageNode: Node = {
    "@type": "ImageObject",
    "@id": `${url}#primaryimage`,
    url: ctx.image,
    contentUrl: ctx.image,
    width: 1200,
    height: 630,
    caption: ctx.title,
  }
  graph.push(imageNode)

  const webPageType =
    kind === "home" || kind === "hub" || kind === "tag" || kind === "listing"
      ? "CollectionPage"
      : getFaq(fd).length > 0 && fm.pageType === "faq"
        ? "FAQPage"
        : "WebPage"

  const webPage: Node = {
    "@type": webPageType,
    "@id": `${url}#webpage`,
    url,
    name: ctx.title,
    description: ctx.description,
    inLanguage: lang,
    isPartOf: { "@id": `${origin}/#website` },
    about: { "@id": `${origin}/#game` },
    primaryImageOfPage: { "@id": `${url}#primaryimage` },
    image: { "@id": `${url}#primaryimage` },
    ...(crumbNode ? { breadcrumb: { "@id": `${url}#breadcrumb` } } : {}),
    ...(published ? { datePublished: published.toISOString() } : {}),
    ...(modified ? { dateModified: modified.toISOString() } : {}),
    ...(fm.verified ? { lastReviewed: new Date(String(fm.verified)).toISOString() } : {}),
    reviewedBy: { "@id": author.id },
    potentialAction: [{ "@type": "ReadAction", target: [url] }],
  }
  graph.push(webPage)

  if (kind === "article" || kind === "news") {
    const sources = (fm.sources as { url: string; title: string; publisher?: string }[]) ?? []
    const words = fd.text?.split(/\s+/).filter(Boolean).length
    const section = sectionOf(slug)
    const article: Node = {
      "@type": kind === "news" ? "NewsArticle" : "Article",
      "@id": `${url}#article`,
      isPartOf: { "@id": `${url}#webpage` },
      mainEntityOfPage: { "@id": `${url}#webpage` },
      headline: ctx.title.slice(0, 110),
      description: ctx.description,
      image: [ctx.image],
      inLanguage: lang,
      author: [{ "@id": author.id }],
      publisher: { "@id": `${origin}/#org` },
      about: { "@id": `${origin}/#game` },
      ...(published ? { datePublished: published.toISOString() } : {}),
      ...(modified ? { dateModified: modified.toISOString() } : {}),
      ...(section ? { articleSection: section.label } : {}),
      ...(tags.length ? { keywords: tags.map((t) => t.replaceAll("-", " ")).join(", ") } : {}),
      ...(words ? { wordCount: words } : {}),
      ...(sources.length
        ? {
            citation: sources.slice(0, 30).map((s) => ({
              "@type": "CreativeWork",
              name: s.title,
              url: s.url,
              ...(s.publisher ? { publisher: { "@type": "Organization", name: s.publisher } } : {}),
            })),
          }
        : {}),
      license: "https://creativecommons.org/licenses/by/4.0/",
      acquireLicensePage: `${origin}/about/contribute-and-reuse`,
      creditText: `${author.name} / ${site.name}. Original editorial text only; third-party media excluded.`,
      copyrightHolder: { "@id": author.id },
      isAccessibleForFree: true,
    }
    graph.push(article)
  }

  const faq = getFaq(fd)
  if (faq.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      isPartOf: { "@id": `${url}#webpage` },
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: stripMd(f.q),
        acceptedAnswer: { "@type": "Answer", text: stripMd(f.a) },
      })),
    })
  }

  // Hubs list their children so the hierarchy is machine readable.
  if (kind === "hub" || kind === "home") {
    const prefix = kind === "home" ? "" : slug.replace(/index$/, "")
    const children = ctx.allFiles
      .filter((f) => {
        const s = f.slug ?? ""
        if (!f.filePath || s === slug || s === "404") return false
        if (kind === "home") return /^[^/]+\/index$/.test(s)
        return s.startsWith(prefix) && !s.slice(prefix.length).includes("/")
      })
      .slice(0, 60)
    if (children.length) {
      graph.push({
        "@type": "ItemList",
        "@id": `${url}#itemlist`,
        numberOfItems: children.length,
        itemListElement: children.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: canonicalUrl(cfg, c.slug!),
          name: c.frontmatter?.title,
        })),
      })
      webPage.mainEntity = { "@id": `${url}#itemlist` }
    }
  }

  return { "@context": "https://schema.org", "@graph": graph }
}

/** JSON-LD inside <script> must not be able to close the tag. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
}
