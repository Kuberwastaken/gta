import { readFileSync } from "node:fs"
import path from "node:path"
import { SocialImageOptions } from "./og"
import { getFontSpecificationName } from "./theme"
import { QUARTZ } from "./path"
import { sectionOf, site, STATUS, StatusKey } from "./site"

const sceneUri = (() => {
  try {
    return `data:image/png;base64,${readFileSync(path.join(QUARTZ, "static", "ascii-scene.png")).toString("base64")}`
  } catch {
    return undefined
  }
})()

const statusColor: Record<string, string> = {
  confirmed: "#4cc38a",
  reported: "#5aa9d6",
  rumour: "#d9a84a",
  speculation: "#9f8fe0",
  debunked: "#e5484d",
  mixed: "#c98bb0",
}
const secColor: Record<string, string> = {
  release: "#ff3d9a",
  guides: "#ffb347",
  characters: "#3df0ff",
  world: "#5cffb0",
  gameplay: "#b18cff",
  music: "#ff7ad9",
  media: "#ffe45c",
  timeline: "#6aa8ff",
  leaks: "#ff5c5c",
  news: "#e2a6ff",
  about: "#9a93ad",
}

const LINE = "rgba(238,236,244,0.08)"

export const viceImage: SocialImageOptions["imageStructure"] = ({ cfg, title, description, fileData }) => {
  const headerFont = getFontSpecificationName(cfg.theme.typography.header)
  const bodyFont = getFontSpecificationName(cfg.theme.typography.body)
  const fm = (fileData.frontmatter ?? {}) as Record<string, unknown>
  const slug = fileData.slug ?? ""
  const section = sectionOf(slug)
  void secColor
  const status = fm.status as StatusKey | undefined
  const t = String(fm.ogTitle ?? fm.shortTitle ?? fm.title ?? title)
  const size = t.length > 64 ? 52 : t.length > 44 ? 60 : t.length > 26 ? 72 : 88
  const desc = description.length > 140 ? description.slice(0, 137).trimEnd() + "..." : description
  const path_ = slug === "index" ? "~/" : `~/${slug.replace(/\/index$/, "/")}`

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        position: "relative",
        backgroundColor: "#0c0b12",
        fontFamily: bodyFont,
        color: "#eeecf4",
      }}
    >
      {sceneUri && (
        <img src={sceneUri} width={760} height={367} style={{ position: "absolute", right: -60, top: 150, opacity: 0.95 }} />
      )}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          backgroundImage: "linear-gradient(90deg, rgba(12,11,18,1) 0%, rgba(12,11,18,0.94) 50%, rgba(12,11,18,0.25) 78%, rgba(12,11,18,0) 100%)",
        }}
      />
      {/* dossier header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "22px 48px",
          borderBottom: `1px solid ${LINE}`,
          backgroundColor: "rgba(12,11,18,0.85)",
          fontSize: 22,
          color: "rgba(238,236,244,0.6)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", fontFamily: headerFont, fontWeight: 600, fontSize: 28, color: "#eeecf4" }}>
            GTA VI
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "rgba(238,236,244,0.5)" }}>Wire</div>
        </div>
        <div style={{ display: "flex", gap: 28 }}>
          <div style={{ display: "flex" }}>{section?.label ?? "Field guide"}</div>
          <div style={{ display: "flex" }}>{path_.length > 34 ? path_.slice(0, 33) + "…" : path_}</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", padding: "44px 48px 0", width: 800, flex: 1 }}>
        <div
          style={{
            display: "flex",
            fontFamily: headerFont,
            fontWeight: 500,
            fontSize: size,
            lineHeight: 1.04,
            letterSpacing: -1.5,
            color: "#ffffff",
          }}
        >
          {t}
        </div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 26, lineHeight: 1.4, color: "rgba(246,243,251,0.72)" }}>{desc}</div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 48px",
          borderTop: `1px solid ${LINE}`,
          backgroundColor: "rgba(12,11,18,0.85)",
          fontSize: 22,
        }}
      >
        <div style={{ display: "flex", color: status ? statusColor[status] : "rgba(246,243,251,0.6)" }}>
          {status && STATUS[status] ? `[${STATUS[status].label.toLowerCase()}]` : "Sourced and graded"}
        </div>
        <div style={{ display: "flex", color: "rgba(246,243,251,0.6)" }}>{cfg.baseUrl}</div>
      </div>
      
    </div>
  )
}
void site
