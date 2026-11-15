# GTA VI Wire — content guide

Site: https://gta.kuber.studio (Quartz 4, content in `content/`). Brand: **GTA VI Wire**. Today is **2026-11-15**; GTA VI launches **2026-11-19**. Research dossiers with sourced facts live in `research/01..04-*.md`. They are the source of truth. If you add a fact that is not in them, you must have verified it yourself with a fetched page and you must cite that page.

## The rule

Every factual claim carries a grade. Never present a rumour as fact.

| status | meaning |
| --- | --- |
| `confirmed` | first-party: Rockstar, Take-Two, Sony, Microsoft, a ratings board, or a named Rockstar staffer on the record |
| `reported` | credible press, not first-party |
| `rumour` | unproven: leaks, fan IDs, insiders |
| `speculation` | our own inference |
| `debunked` | shown false or outdated |
| `mixed` | page-level only: the page mixes grades; each claim is labelled inline |

Inline grade tags in the body, for any claim that is not `confirmed` (or on pages with `status: mixed`):
`<span class="tag-rumour">rumour</span>`, `<span class="tag-reported">reported</span>`, `<span class="tag-debunked">debunked</span>`, `<span class="tag-speculation">speculation</span>`, `<span class="tag-confirmed">confirmed</span>`.

## Frontmatter (YAML, exactly these keys)

```yaml
---
title: "GTA 6 release time by country: when it unlocks where you live"   # H1. Keyword first. Natural.
seoTitle: "GTA 6 Release Time by Country: Exact Unlock Times"           # <title>, 45-60 chars, Title Case, keyword first
shortTitle: "Release time by country"                                    # used in cards/breadcrumbs, <= 32 chars
description: "GTA 6 unlocks at midnight local store time on Nov 19, 2026. Exact unlock times for the US, UK, India, Australia and 20 more regions."  # 140-160 chars, contains the answer
status: "confirmed"            # page-level grade (see table); use "mixed" if the page mixes grades
published: 2026-11-15
updated: 2026-11-15
verified: 2026-11-15
weight: 10                     # order inside the section, lower = earlier; flagship pages 1-10
tags: ["release", "unlock-times"]   # 2-5 from the vocabulary below
tldr: "One or two sentences that fully answer the main query. **Bold** the key fact. Can contain [[wikilinks]]."
facts:                          # 3-8 rows for the infobox; values short; optional on narrative pages
  - k: "Release date"
    v: "November 19, 2026"
faq:                            # 3-6 real questions people search (see 'Search demand notes' in research)
  - q: "What time does GTA 6 unlock in the US?"
    a: "Midnight Eastern (9 PM Pacific on Nov 18) for the whole US store."   # 1-3 sentences, self-contained
sources:                        # every source you relied on. Only URLs that appear in research/ or that you fetched.
  - title: "Exact page title"
    url: "https://..."
    publisher: "Rockstar Games"
    date: "Nov 10, 2026"
    tier: "primary"             # primary = first-party; omit otherwise
related: ["release/gta-6-preload-and-file-size"]   # optional, 0-4 slugs to force into "Keep reading"
---
```

Quote YAML strings with double quotes. Escape inner double quotes as `\"` or use single quotes in the text. No tabs.

## Writing

- **Answer first.** The first paragraph answers the query in plain words. Then detail.
- H2s phrased the way people search: "When does GTA 6 unlock in the UK?", "Is there a disc?". H3 for sub-points. Never put an H1 in the body (the title is the H1).
- Short paragraphs (1-3 sentences). Tables for anything comparable (times, prices, editions, regions). Bullets for lists.
- Concrete over vague: dates, numbers, names, who said it. Attribute: "Rockstar says…", "IGN reported…".
- Length: flagship pages 900-1800 words; normal pages 500-1000; nothing under 350 words of body. No padding — if you run out of facts, stop.
- Voice: knowledgeable fan-journalist, crisp, a little Vice City flavour is fine. No hype words ("epic", "mind-blowing"), no "In conclusion", no "delve", no "it's worth noting", no em-dash spam. Use American English.
- Quotes: max ~2 sentences, in quotation marks, attributed. Never paste long official text.
- No images. Do not embed Rockstar artwork. You may describe trailers.
- Do not copy other fan sites' prose. Use their facts with citation.
- Mention what is **not** known yet when relevant ("Rockstar has not said…"). This is valuable.
- Each page ends with a short "## What we're watching" or "## Bottom line" only if it adds something; otherwise no outro.

## Links (critical for SEO and the topic graph)

- Use wikilinks with the full path: `[[world/vice-city|Vice City]]`, `[[release/gta-6-release-time-by-country|unlock times]]`.
- Every page links to **at least 5 other pages** in the body, including its section hub (`[[characters/index|all characters]]`) and at least 2 pages in **other** sections. Link naturally on first mention of an entity.
- Only link to slugs in the planned sitemap below (they will all exist). Don't invent slugs.
- External links: normal markdown `[text](https://...)`, only to sources.

## Tag vocabulary (use these, kebab-case)

release, unlock-times, preload, editions, price, platforms, performance, pc, ps5, xbox, physical, reviews, rating, gta-online, gta-plus, sales, take-two, characters, jason, lucia, cast, story, world, map, vice-city, leonida-keys, grassrivers, port-gellhorn, ambrosia, mount-kalaga, real-life-locations, wildlife, weather, gameplay, wanted-system, weapons, vehicles, money, phone, music, radio, soundtrack, trailers, media, timeline, leaks, rumours, debunked, easter-eggs, news, guides, beginner, rockstar, development

## Planned sitemap (every slug below will exist; link freely)

**release/**: index, gta-6-release-time-by-country, gta-6-release-date, gta-6-preload-and-file-size, gta-6-price-and-editions, gta-6-pre-order-bonuses, gta-6-physical-copy-no-disc, gta-6-collectors-box, gta-6-ps5-pro-performance, gta-6-xbox-series-s-and-cloud-gaming, gta-6-pc-release-date, gta-6-switch-2, gta-6-reviews-and-review-embargo, gta-6-age-rating, gta-6-day-one-patch, gta-6-gta-online-status, gta-6-sales-and-pre-orders

**guides/**: index, gta-6-day-one-checklist, gta-6-which-edition-should-you-buy, gta-6-tips-before-you-start, gta-6-how-long-to-beat, gta-6-gta-plus-explained, gta-6-storage-space-guide, gta-6-printable-map, gta-6-controls-and-weapon-slots, gta-6-faq

**characters/**: index, jason-duval, lucia-caminos, cal-hampton, boobie-ike, dre-quan-priest, real-dimez, raul-bautista, brian-heder, extended-look-characters, macca-the-gator, gta-6-voice-actors-and-cast, jason-and-lucia-relationship, gta-6-first-female-protagonist, returning-characters-and-cameos

**world/**: index, gta-6-map-size, leonida-regions, vice-city, leonida-keys, grassrivers, port-gellhorn, ambrosia, mount-kalaga, gta-6-real-life-locations, gta-6-leaked-map-and-counties, gta-6-wildlife-and-animals, gta-6-weather-and-hurricanes, gta-6-interiors, gta-6-landmarks-and-neighborhoods

**gameplay/**: index, gta-6-wanted-system-and-heat, gta-6-weapons, gta-6-vehicles, gta-6-money-banks-and-fences, gta-6-phone-and-social-media, gta-6-character-switching, gta-6-criminal-profile, gta-6-activities-and-side-content, gta-6-gameplay-features-confirmed

**music/**: index, gta-6-radio-stations, gta-6-trailer-songs, gta-6-soundtrack-album, gta-6-justice-score

**media/**: index, gta-6-trailer-1, gta-6-trailer-2, gta-6-launch-trailer, gta-6-extended-look, gta-6-screenshots-and-galleries, gta-6-easter-eggs-in-trailers

**timeline/**: index, gta-6-development-history, gta-6-delays, gta-6-2022-leak, rockstar-uk-firings-and-union

**leaks/**: index, gta-6-pc-at-launch-rumour, gta-6-100-dollar-price-rumour, gta-6-online-at-launch-rumour, gta-6-cyberleek-2026-leaks, gta-6-four-protagonists-rumour, gta-6-actor-identifications, tommy-vercetti-return-rumour, gta-6-another-delay-rumour, gta-6-budget-rumours

**news/** (filename `YYYY-MM-DD-slug.md`): index, 2026-11-15-gta-6-launch-week-briefing, 2026-11-13-gta-6-update-1-002, 2026-11-10-gta-6-preload-live, 2026-11-09-take-two-q2-earnings-gta-6, 2026-11-14-collectors-box-map-leak, 2026-11-05-gta-6-launch-gallery

**about/**: index, how-we-grade, corrections

Plus: `index` (home) and `graph` (topic graph).

## Section hub pages (`<section>/index.md`)

A real page, not a stub: 300-600 words introducing the topic, answering the top 2-3 broad questions, then a curated "Start here" list of wikilinks to the section's pages with a one-line hook each. `status: "mixed"` unless clearly one grade. Quartz appends an automatic listing of the folder below it.

## News pages

`news/YYYY-MM-DD-slug.md`, `published` = the event date (the news date), `updated` = 2026-11-15. Lead with what happened, then why it matters, then what's next, linking to the evergreen pages it affects.
