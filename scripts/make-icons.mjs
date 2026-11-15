// Generates favicon.svg, PNG icons and the fallback OG image from the original brand mark.
import sharp from "sharp"
import fs from "node:fs/promises"

const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd166"/><stop offset=".55" stop-color="#ff6a3d"/><stop offset="1" stop-color="#ff2e88"/></linearGradient></defs>
<rect width="64" height="64" rx="16" fill="#1a0826"/>
<circle cx="32" cy="34" r="20" fill="url(#s)"/>
<g fill="#1a0826"><rect x="8" y="34" width="48" height="2.2"/><rect x="8" y="39" width="48" height="3"/><rect x="8" y="45" width="48" height="4"/><rect x="8" y="52" width="48" height="12"/></g>
<path d="M40 64c0-9 1-17 4-25l2 .6c-2.6 8-3.6 16-3.6 24.4z" fill="#12051c"/>
<path d="M45 39c-4-3-9-3-13 0 4-1 8-.4 12 1.6zM45 39c3-4 8-5 12-3.4-4 0-8 1.2-11 4zM45 39c0-4-2-7-5-8.6 2 2.4 3.4 5 4 8.8z" fill="#12051c"/>
</svg>`

await fs.writeFile("quartz/static/favicon.svg", mark)
const buf = Buffer.from(mark)
await sharp(buf, { density: 600 }).resize(192, 192).png().toFile("quartz/static/icon.png")
await sharp(buf, { density: 900 }).resize(512, 512).png().toFile("quartz/static/logo-512.png")
await sharp(buf, { density: 600 }).resize(180, 180).flatten({ background: "#1a0826" }).png().toFile("quartz/static/apple-touch-icon.png")

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#12051c"/><stop offset=".5" stop-color="#2a0b3d"/><stop offset="1" stop-color="#a3245f"/></linearGradient>
<linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe08a"/><stop offset=".5" stop-color="#ff7a3d"/><stop offset="1" stop-color="#ff2e88"/></linearGradient>
<linearGradient id="t" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#22d3ee"/><stop offset=".6" stop-color="#ff4fa3"/><stop offset="1" stop-color="#ff9f43"/></linearGradient>
</defs>
<rect width="1200" height="630" fill="url(#bg)"/>
<circle cx="900" cy="360" r="220" fill="url(#s)"/>
<g fill="#2a0b3d"><rect x="600" y="330" width="600" height="8"/><rect x="600" y="360" width="600" height="12"/><rect x="600" y="394" width="600" height="16"/><rect x="600" y="432" width="600" height="200"/></g>
<text x="70" y="250" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="120" fill="url(#t)">GTA VI WIRE</text>
<text x="74" y="330" font-family="Arial, sans-serif" font-size="40" fill="#fff4fb" fill-opacity=".85">Sourced facts, guides, map and a graded</text>
<text x="74" y="382" font-family="Arial, sans-serif" font-size="40" fill="#fff4fb" fill-opacity=".85">leaks ledger for Grand Theft Auto VI.</text>
<text x="74" y="560" font-family="Arial, sans-serif" font-size="30" fill="#fff4fb" fill-opacity=".6">gta.kuber.studio</text>
<rect y="620" width="1200" height="10" fill="url(#t)"/>
</svg>`
await sharp(Buffer.from(og)).jpeg({ quality: 85, mozjpeg: true }).toFile("quartz/static/og-image.jpg")
await fs.rm("quartz/static/og-image.png", { force: true })
console.log("icons ok")
