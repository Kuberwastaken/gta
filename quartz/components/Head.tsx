import { i18n } from "../i18n"
import { FullSlug, joinSegments, pathToRoot } from "../util/path"
import { CSSResourceToStyleElement, JSResourceToScriptElement } from "../util/resources"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { unescapeHTML } from "../util/escape"
import {
  author,
  canonicalUrl,
  documentTitle,
  isNoindex,
  ogImageUrl,
  pageDates,
  pageKind,
  sectionOf,
  site,
  siteOrigin,
  STATUS,
  StatusKey,
} from "../util/site"
import { buildJsonLd, serializeJsonLd } from "../util/jsonld"

export function pageDescription(cfg: QuartzComponentProps["cfg"], fd: QuartzComponentProps["fileData"]) {
  const fm = (fd.frontmatter ?? {}) as Record<string, unknown>
  const raw =
    (fm.description as string | undefined) ??
    unescapeHTML(fd.description?.trim() ?? i18n(cfg.locale).propertyDefaults.description)
  return raw.length > 300 ? raw.slice(0, 297).trimEnd() + "..." : raw
}

export default (() => {
  const Head: QuartzComponent = ({ cfg, fileData, externalResources, allFiles }: QuartzComponentProps) => {
    const fm = (fileData.frontmatter ?? {}) as Record<string, unknown>
    const slug = (fileData.slug ?? "") as FullSlug
    const kind = pageKind(fileData)
    const title = documentTitle(fileData)
    const ogTitle = String(fm.ogTitle ?? fm.seoTitle ?? fm.title ?? site.name)
    const description = pageDescription(cfg, fileData)
    const origin = siteOrigin(cfg)
    const url = slug === "404" ? `${origin}/404` : canonicalUrl(cfg, slug)
    const image = ogImageUrl(cfg, fileData)
    const noindex = isNoindex(fileData)
    const { published, modified } = pageDates(fileData)
    const isArticle = kind === "article" || kind === "news"
    const tags = (fm.tags ?? []) as string[]
    const status = fm.status as StatusKey | undefined
    const section = sectionOf(slug)
    const baseDir = slug === "404" ? ("/" as FullSlug) : pathToRoot(slug)
    const { css, js, additionalHead } = externalResources
    const jsonLd = serializeJsonLd(buildJsonLd(cfg, fileData, { title: ogTitle, description, image, allFiles }))
    const hasMirror = !!fileData.filePath && slug !== "404" && !slug.startsWith("tags/")

    return (
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <meta
          name="robots"
          content={
            noindex
              ? "noindex, follow"
              : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
          }
        />
        <meta name="theme-color" content="#0b0614" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#fff3ea" media="(prefers-color-scheme: light)" />
        <meta name="color-scheme" content="dark light" />
        <meta name="author" content={author.name} />
        <meta name="application-name" content={site.name} />
        <meta name="apple-mobile-web-app-title" content={site.shortName} />
        <meta name="format-detection" content="telephone=no" />
        {tags.length > 0 && <meta name="keywords" content={["GTA 6", ...tags.map((t) => t.replaceAll("-", " "))].join(", ")} />}

        {/* Open Graph */}
        <meta property="og:site_name" content={site.name} />
        <meta property="og:locale" content={site.locale} />
        <meta property="og:type" content={isArticle ? "article" : "website"} />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
        <meta property="og:image:secure_url" content={image} />
        <meta property="og:image:type" content={image.endsWith(".png") ? "image/png" : "image/jpeg"} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={`${ogTitle} — ${site.name}`} />
        {isArticle && (
          <>
            {published && <meta property="article:published_time" content={published.toISOString()} />}
            {modified && <meta property="article:modified_time" content={modified.toISOString()} />}
            {modified && <meta property="og:updated_time" content={modified.toISOString()} />}
            <meta property="article:author" content={author.url} />
            {section && <meta property="article:section" content={section.label} />}
            {tags.map((t) => (
              <meta property="article:tag" content={t.replaceAll("-", " ")} />
            ))}
          </>
        )}

        {/* Twitter / X */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content={`@${site.twitter}`} />
        <meta name="twitter:creator" content={`@${site.twitter}`} />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
        <meta name="twitter:image:alt" content={`${ogTitle} — ${site.name}`} />
        {status && STATUS[status] && (
          <>
            <meta name="twitter:label1" content="Status" />
            <meta name="twitter:data1" content={STATUS[status].label} />
          </>
        )}
        {modified && (
          <>
            <meta name="twitter:label2" content="Updated" />
            <meta
              name="twitter:data2"
              content={modified.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            />
          </>
        )}

        {/* Icons, manifest, feeds and machine-readable mirrors */}
        <link rel="icon" href={joinSegments(baseDir, "static/favicon.svg")} type="image/svg+xml" />
        <link rel="icon" href={joinSegments(baseDir, "static/icon.png")} type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href={joinSegments(baseDir, "static/apple-touch-icon.png")} />
        <link rel="manifest" href={`${origin}/site.webmanifest`} />
        <link rel="alternate" type="application/rss+xml" title={`${site.name}: everything`} href={`${origin}/index.xml`} />
        <link rel="alternate" type="application/rss+xml" title={`${site.name}: news`} href={`${origin}/news.xml`} />
        {hasMirror && <link rel="alternate" type="text/markdown" href={`${url.replace(/\/$/, "/index")}.md`} />}
        <link rel="author" href={author.url} />
        <link rel="me" href={author.url} />
        <meta name="generator" content="Quartz" />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

        {css.map((resource) => CSSResourceToStyleElement(resource, true))}
        {js
          .filter((resource) => resource.loadTime === "beforeDOMReady")
          .map((res) => JSResourceToScriptElement(res, true))}
        {additionalHead.map((resource) => (typeof resource === "function" ? resource(fileData) : resource))}
      </head>
    )
  }

  return Head
}) satisfies QuartzComponentConstructor
