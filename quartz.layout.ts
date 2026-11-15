import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

const { Vice } = Component
const make = Vice.c

type P = { fileData: { slug?: string } }
const isHome = (p: P) => p.fileData.slug === "index"
const isGraphPage = (p: P) => p.fileData.slug === "graph"
const notHome = (p: P) => !isHome(p)

// Obsidian-style graph settings. The sidebar graph is a local view with
// labels readable at rest; the full map starts zoomed out and fades labels
// in as you zoom, like Obsidian's text-fade threshold.
const localGraph = {
  drag: true,
  zoom: true,
  depth: 1,
  scale: 1.6,
  repelForce: 1.4,
  centerForce: 0.2,
  linkDistance: 60,
  fontSize: 0.7,
  opacityScale: 2.2,
  showTags: false,
  removeTags: [] as string[],
  focusOnHover: true,
  enableRadial: false,
}
const globalGraph = {
  drag: true,
  zoom: true,
  depth: -1,
  scale: 0.9,
  repelForce: 0.6,
  centerForce: 0.2,
  linkDistance: 32,
  fontSize: 0.5,
  opacityScale: 1,
  showTags: true,
  removeTags: [] as string[],
  focusOnHover: true,
  enableRadial: false,
}

const articleGraph = Component.Graph({ title: "Topic graph", localGraph, globalGraph })
const fullGraph = Component.Graph({ title: "", localGraph: globalGraph, globalGraph })

export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    make(Vice.FaqBlock)(),
    make(Vice.SourcesBlock)(),
    make(Vice.RelatedBlock)(),
    Component.ConditionalRender({
      component: articleGraph,
      condition: (p) => p.fileData.slug !== "index" && p.fileData.slug !== "graph",
    }),
    make(Vice.PrevNext)(),
  ],
  footer: make(Vice.ViceFooter)(),
}

const left = [
  make(Vice.SideBrand)(),
  Component.MobileOnly(Component.Spacer()),
  Component.Flex({
    components: [{ Component: Component.Search(), grow: true }, { Component: Component.Darkmode() }],
  }),
  Vice.Countdown({ compact: true }),
  Component.Explorer({
    title: "Categories",
    folderDefaultState: "collapsed",
    folderClickBehavior: "link",
    useSavedState: true,
    // serialised and run in the browser: keep everything it needs inside it
    sortFn: (a, b) => {
      const order = ["release", "guides", "characters", "world", "gameplay", "music", "media", "timeline", "leaks", "news", "about"]
      if (a.isFolder && b.isFolder) {
        const ia = order.indexOf(a.slugSegment)
        const ib = order.indexOf(b.slugSegment)
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)
      }
      if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1
      return a.displayName.localeCompare(b.displayName, undefined, { numeric: true, sensitivity: "base" })
    },
    // the home page and the graph page live in the brand link and the graph
    // panel; keep the tree to categories and their pages
    filterFn: (node) => node.slugSegment !== "tags" && node.slugSegment !== "index",
  }),
]

export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    make(Vice.HomeHero)(),
    Component.ConditionalRender({ component: make(Vice.Crumbs)(), condition: notHome }),
    make(Vice.HubBanner)(),
    Component.ConditionalRender({ component: Component.ArticleTitle(), condition: notHome }),
    make(Vice.PageMeta)(),
    make(Vice.QuickAnswer)(),
    make(Vice.GraphIntro)(),
    Component.ConditionalRender({ component: fullGraph, condition: isGraphPage }),
    make(Vice.HomeLatest)(),
  ],
  left,
  right: [],
}

export const defaultListPageLayout: PageLayout = {
  beforeBody: [make(Vice.Crumbs)(), make(Vice.HubBanner)(), Component.ArticleTitle(), make(Vice.PageMeta)()],
  left,
  right: [],
}
