// Build-time art: renders an original Vice City sunset scene to ASCII, figlet
// banners for each section, and the liquid-glass refraction map. Output is a
// generated TS module so the art ships as plain text in the HTML (crawlable,
// zero image requests, no JS needed to see it).
import sharp from "sharp"
import figlet from "figlet"
import fs from "node:fs/promises"

const COLS = 168
const ROWS = 52

// Scene drawn large, then sampled. White = bright = dense glyph.
const scene = `<svg xmlns="http://www.w3.org/2000/svg" width="1320" height="790" viewBox="0 0 1320 790">
<rect width="1320" height="920" fill="#000"/>
<defs>
  <radialGradient id="sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff"/><stop offset=".8" stop-color="#e6e6e6"/><stop offset="1" stop-color="#bbb"/></radialGradient>
  <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#2a2a2a"/></linearGradient>
  <linearGradient id="refl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfcfcf"/><stop offset="1" stop-color="#000"/></linearGradient>
</defs>
<rect y="200" width="1320" height="400" fill="url(#haze)"/>
<circle cx="760" cy="430" r="250" fill="url(#sun)"/>
<g fill="#000">
  <rect x="0" y="420" width="1320" height="8"/><rect x="0" y="452" width="1320" height="12"/>
  <rect x="0" y="488" width="1320" height="16"/><rect x="0" y="528" width="1320" height="22"/>
</g>
<g fill="#7a7a7a">
  <rect x="300" y="440" width="34" height="160"/><rect x="340" y="392" width="40" height="208"/><rect x="386" y="430" width="28" height="170"/>
  <rect x="420" y="372" width="36" height="228"/><rect x="462" y="452" width="44" height="148"/>
  <rect x="1080" y="456" width="36" height="144"/><rect x="1122" y="402" width="30" height="198"/><rect x="1158" y="440" width="56" height="160"/><rect x="1220" y="380" width="34" height="220"/>
</g>
<rect y="600" width="1320" height="320" fill="#000"/>
<g fill="url(#refl)">
  <rect x="560" y="612" width="400" height="10"/><rect x="590" y="640" width="340" height="9"/><rect x="620" y="668" width="280" height="8"/>
  <rect x="650" y="696" width="220" height="7"/><rect x="680" y="724" width="160" height="6"/><rect x="705" y="752" width="110" height="5"/>
</g>
<g fill="#000">
  <g transform="translate(380 -40)">
  <path d="M200 960 C214 760 236 620 296 470 L314 476 C258 624 236 762 228 920Z"/>
  <path d="M305 472c-64-52-160-56-228-14 76-14 150-8 216 38zM305 472c-14-76-64-124-132-140 56 38 94 88 116 152zM305 472c56-68 150-80 220-50-76-4-140 16-204 66zM305 472c50-86 110-118 178-118-60 26-110 68-156 132zM305 472c-44 4-104 42-142 102 56-42 98-64 148-76z"/>
  </g>
  <path d="M96 920 C100 820 116 724 150 628 L164 632 C134 728 122 822 122 920Z"/>
  <path d="M158 630c-42-34-98-34-140-8 46-8 90-4 132 22zM158 630c34-46 94-52 136-30-46 0-88 14-126 46zM158 630c-4-46-26-76-64-92 30 26 50 58 56 96z"/>
  <path d="M1240 920 C1232 810 1216 720 1182 626 L1196 622 C1232 716 1248 808 1262 920Z"/>
  <path d="M1188 624c-38-38-94-42-136-20 46-2 88 8 126 34zM1188 624c30-50 86-60 132-42-46 0-86 16-122 50zM1188 624c0-46-18-80-56-98 26 30 40 62 48 102z"/>
</g>
</svg>`

const RAMP = " .:-=+*#%@"
const { data, info } = await sharp(Buffer.from(scene))
  .resize(COLS, ROWS, { fit: "fill", kernel: "lanczos3" })
  .greyscale()
  .raw()
  .toBuffer({ resolveWithObject: true })

let seed = 7
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
const seaStart = Math.round((600 / 790) * ROWS)
const lines = []
for (let y = 0; y < info.height; y++) {
  let row = ""
  for (let x = 0; x < info.width; x++) {
    const v = data[y * info.width + x] / 255
    let ch = RAMP[Math.min(RAMP.length - 1, Math.floor(v * RAMP.length))]
    if (y >= seaStart) {
      // water: reflections become waves, dark water gets sparse swell
      if (v > 0.15) ch = v > 0.5 ? "=" : "~"
      else if (ch === " " && rnd() < 0.05) ch = rnd() < 0.5 ? "-" : "~"
    } else if (ch === " " && y < seaStart - 14 && rnd() < 0.012) {
      ch = rnd() < 0.7 ? "." : "+" // stars
    }
    row += ch
  }
  lines.push(row.replace(/\s+$/, ""))
}

const fig = (text, font) => figlet.textSync(text, { font, horizontalLayout: "fitted" }).replace(/\s+$/gm, "")
const banners = {}
for (const [k, label] of Object.entries({
  release: "RELEASE",
  guides: "GUIDES",
  characters: "CAST",
  world: "LEONIDA",
  gameplay: "GAMEPLAY",
  music: "RADIO",
  media: "TRAILERS",
  timeline: "TIMELINE",
  leaks: "LEAKS",
  news: "NEWS",
  about: "ABOUT",
  graph: "GRAPH",
})) {
  banners[k] = fig(label, "ANSI Shadow")
}
const logo = fig("VI WIRE", "ANSI Shadow")
const notFound = fig("404", "ANSI Shadow")

// Liquid-glass displacement map: a rounded-rect lens where pixels near the
// edge are pushed along the inward normal (R = x shift, G = y shift).
const N = 256
const bezel = 0.16
const px = Buffer.alloc(N * N * 4)
for (let y = 0; y < N; y++) {
  for (let x = 0; x < N; x++) {
    const u = (x + 0.5) / N
    const v = (y + 0.5) / N
    const dx = Math.min(u, 1 - u)
    const dy = Math.min(v, 1 - v)
    const d = Math.min(dx, dy)
    let nx = 0
    let ny = 0
    if (d < bezel) {
      const t = 1 - d / bezel
      const k = t * t * (3 - 2 * t) // smoothstep: strongest at the rim
      if (dx < dy) nx = (u < 0.5 ? 1 : -1) * k
      else ny = (v < 0.5 ? 1 : -1) * k
    }
    const i = (y * N + x) * 4
    px[i] = Math.round(128 + nx * 127)
    px[i + 1] = Math.round(128 + ny * 127)
    px[i + 2] = 128
    px[i + 3] = 255
  }
}
const map = await sharp(px, { raw: { width: N, height: N, channels: 4 } }).png().toBuffer()
const glassMap = `data:image/png;base64,${map.toString("base64")}`

const out = `// GENERATED by scripts/make-ascii.mjs — do not edit by hand.
export const HERO_ASCII = ${JSON.stringify(lines.join("\n"))}
export const HERO_COLS = ${COLS}
export const HERO_ROWS = ${ROWS}
export const LOGO_ASCII = ${JSON.stringify(logo)}
export const NOT_FOUND_ASCII = ${JSON.stringify(notFound)}
export const BANNERS: Record<string, string> = ${JSON.stringify(banners, null, 2)}
export const GLASS_MAP = ${JSON.stringify(glassMap)}
`
await fs.writeFile("quartz/components/ascii.generated.ts", out)
console.log(lines.join("\n"))
console.log(logo)
console.log(banners.characters)

// Coloured raster of the ASCII scene for OG images (satori can't do monospace text art).
{
  const cw = 9, lh = 16
  const W = COLS * cw, H = ROWS * lh
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  const tspans = lines.map((l, i) => `<text x="0" y="${(i + 1) * lh - 4}" xml:space="preserve">${esc(l)}</text>`).join("")
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="${H}" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#7b5cff"/><stop offset=".22" stop-color="#ffd166"/><stop offset=".45" stop-color="#ff7a3d"/><stop offset=".62" stop-color="#ff2e88"/><stop offset=".7" stop-color="#3df0ff"/><stop offset="1" stop-color="#1b6b8a"/></linearGradient></defs>
<g font-family="Consolas, 'Courier New', monospace" font-size="15" fill="url(#g)">${tspans}</g></svg>`
  await sharp(Buffer.from(svg)).png().toFile("quartz/static/ascii-scene.png")
}
