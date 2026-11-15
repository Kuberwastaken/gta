import rawAssets from "./media-assets.json"

export type MediaAsset = { file: string; url: string; source: string; width: number; height: number; label: string; alt: string; credit: string }
export const mediaAssets: Record<string, MediaAsset> = rawAssets
const specific: Record<string, string> = {
  "characters/jason-duval": "jason-duval-01", "characters/lucia-caminos": "lucia-caminos-01",
  "characters/cal-hampton": "cal-hampton-01", "characters/boobie-ike": "boobie-ike-01",
  "characters/dre-quan-priest": "drequan-priest-01", "characters/real-dimez": "real-dimez-01",
  "characters/raul-bautista": "raul-bautista-01", "characters/brian-heder": "brian-heder-01",
  "world/vice-city": "vice-city-01", "world/leonida-keys": "leonida-keys-01",
  "world/port-gellhorn": "port-gellhorn-01", "world/ambrosia": "ambrosia-01", "world/grassrivers": "grassrivers-01",
  "gameplay/gta-6-vehicles": "ultimate-edition-grotti-cheetah-01",
  "gameplay/gta-6-weapons": "ultimate-edition-hawk-and-little-morgan-revolvers-01",
  "release/gta-6-pre-order-bonuses": "vintage-vice-city-pack-01",
  "media/gta-6-trailer-1": "trailer-1", "media/gta-6-trailer-2": "trailer-2",
  "media/gta-6-extended-look": "extended-look", "media/gta-6-launch-trailer": "launch-trailer",
  "media/gta-6-screenshots-and-galleries": "jason-and-lucia-14",
  "news/2026-11-05-gta-6-launch-gallery": "jason-and-lucia-14",
}
export function pageMedia(slug: string, key?: unknown): MediaAsset {
  const id = typeof key === "string" && mediaAssets[key] ? key : specific[slug] ??
    (slug.startsWith("music/") ? "album" : slug.startsWith("world/") || slug === "graph" ? "vice-city-01" : "jason-and-lucia-01")
  return mediaAssets[id]
}
export const officialVideos: Record<string, { id: string; title: string }> = {
  "media/gta-6-trailer-1": { id: "QdBZY2fkU-0", title: "Grand Theft Auto VI Trailer 1" },
  "media/gta-6-trailer-2": { id: "VQRLujxTm3c", title: "Grand Theft Auto VI Trailer 2" },
  "media/gta-6-launch-trailer": { id: "rz1B4B2yBZY", title: "Grand Theft Auto VI Launch Trailer" },
  "media/gta-6-extended-look": { id: "tJbzMqJGH4k", title: "Grand Theft Auto VI: An Extended Look" },
}
