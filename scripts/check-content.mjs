#!/usr/bin/env node
// Content gate: validates frontmatter, grades, sources, link targets and length.
// Usage: node scripts/check-content.mjs [section ...]   (no args = everything)
import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import yaml from "js-yaml"

const ROOT = path.resolve("content")
const only = process.argv.slice(2)
const STATUSES = new Set(["confirmed", "reported", "rumour", "speculation", "debunked", "mixed"])
const SKIP_LEN = new Set(["index", "graph", "about/corrections"])

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    return e.isDirectory() ? walk(p) : e.name.endsWith(".md") ? [p] : []
  })
}

const files = walk(ROOT)
const slugs = new Set(files.map((f) => path.relative(ROOT, f).replaceAll("\\", "/").replace(/\.md$/, "")))
let errors = 0
let warnings = 0
const err = (f, m) => (errors++, console.log(`  ✗ ${f}: ${m}`))
const warn = (f, m) => (warnings++, console.log(`  ! ${f}: ${m}`))
const inbound = new Map()

const parsed = files.map((file) => {
  const rel = path.relative(ROOT, file).replaceAll("\\", "/")
  const slug = rel.replace(/\.md$/, "")
  const raw = fs.readFileSync(file, "utf8")
  let data, content
  try {
    ;({ data, content } = matter(raw, { engines: { yaml: (s) => yaml.load(s, { schema: yaml.JSON_SCHEMA }) } }))
  } catch (e) {
    err(rel, `YAML parse error: ${e.message.split("\n")[0]}`)
    return null
  }
  const links = [...content.matchAll(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]/g)].map((m) => m[1].trim().replace(/\.md$/, ""))
  const fmLinks = JSON.stringify([data.tldr, data.faq, data.facts]).match(/\[\[([^\]|#]+)/g)?.map((x) => x.slice(2).trim()) ?? []
  for (const l of [...links, ...fmLinks]) inbound.set(l, (inbound.get(l) ?? 0) + 1)
  return { rel, slug, data, content, links: [...links, ...fmLinks] }
}).filter(Boolean)

for (const { rel, slug, data, content, links } of parsed) {
  const section = slug.split("/")[0]
  if (only.length && !only.includes(section)) continue
  const isHub = slug.endsWith("/index") || slug === "index"
  if (!data.title) err(rel, "missing title")
  if (!data.description) err(rel, "missing description")
  else if (data.description.length < 110 || data.description.length > 175) warn(rel, `description ${data.description.length} chars (aim 140-160)`)
  if (data.seoTitle && data.seoTitle.length > 65) warn(rel, `seoTitle ${data.seoTitle.length} chars (max 60)`)
  if (!["index", "graph"].includes(slug)) {
    if (!data.status || !STATUSES.has(data.status)) err(rel, `bad status '${data.status}'`)
    if (!isHub && !Array.isArray(data.sources)) err(rel, "missing sources")
  }
  if (data.status === "confirmed" && !(data.sources ?? []).some((s) => s.tier === "primary")) warn(rel, "status confirmed but no primary source")
  for (const s of data.sources ?? []) {
    if (!s.url || !/^https?:\/\//.test(s.url)) err(rel, `source without valid url: ${s.title}`)
    if (!s.title) err(rel, `source without title: ${s.url}`)
  }
  for (const k of ["published", "updated"]) if (!data[k] && slug !== "graph") err(rel, `missing ${k}`)
  for (const f of data.faq ?? []) if (!f.q || !f.a) err(rel, "faq entry missing q/a")
  for (const f of data.facts ?? []) if (!f.k || f.v === undefined) err(rel, "facts entry missing k/v")
  const bad = links.filter((l) => !slugs.has(l) && !slugs.has(l + "/index"))
  for (const b of [...new Set(bad)]) err(rel, `broken link [[${b}]]`)
  const words = content.replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length
  if (!SKIP_LEN.has(slug) && words < (isHub ? 200 : 350)) warn(rel, `only ${words} words`)
  const uniq = new Set(links.filter((l) => l !== slug)).size
  if (!isHub && slug !== "graph" && uniq < 4) warn(rel, `only ${uniq} internal links`)
  if (/^#\s/m.test(content)) err(rel, "body contains an H1")
}

if (!only.length) {
  for (const s of slugs) {
    if (s === "index" || s.endsWith("/index") || s === "graph") continue
    if (!inbound.get(s)) warn(`${s}.md`, "orphan: no page links here")
  }
}

console.log(`\n${files.length} files, ${errors} errors, ${warnings} warnings`)
process.exit(errors ? 1 : 0)
