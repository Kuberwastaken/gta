import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

const config: QuartzConfig = {
  configuration: {
    pageTitle: "GTA VI Wire",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: null,
    locale: "en-US",
    baseUrl: "gta.kuber.studio",
    ignorePatterns: ["private", "templates", ".obsidian", "drafts"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      // Self-host fonts: no third-party connection on the critical path.
      cdnCaching: false,
      typography: {
        header: { name: "Geist", weights: [400, 500, 600] },
        body: { name: "Geist", weights: [400, 500, 600] },
        code: { name: "Geist Mono", weights: [400, 500] },
      },
      colors: {
        lightMode: {
          light: "#f6f5f9",
          lightgray: "#e4e2ea",
          gray: "#6c6779",
          darkgray: "#4e4a5b",
          dark: "#16141d",
          secondary: "#c2185b",
          tertiary: "#4e4a5b",
          highlight: "rgba(194, 24, 91, 0.06)",
          textHighlight: "#ffd16699",
        },
        darkMode: {
          light: "#0c0b12",
          lightgray: "#25232f",
          gray: "#7f7a8f",
          darkgray: "#a7a3b5",
          dark: "#eeecf4",
          secondary: "#ff4d8d",
          tertiary: "#a7a3b5",
          highlight: "rgba(255, 77, 141, 0.08)",
          textHighlight: "#ffd16655",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({ priority: ["frontmatter", "filesystem"] }),
      Plugin.SyntaxHighlighting({ theme: { light: "github-light", dark: "github-dark" }, keepBackground: false }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents({ minEntries: 2, maxDepth: 3 }),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest", openLinksInNewTab: false, lazyLoad: true, externalLinkIcon: true }),
      Plugin.Description({ descriptionLength: 155 }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      // Sitemap and RSS come from SeoFiles, which knows about noindex, real dates and images.
      Plugin.ContentIndex({ enableSiteMap: false, enableRSS: false }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      Plugin.CNAME(),
      Plugin.SeoFiles(),
      Plugin.GraphBundle(),
      Plugin.CustomOgImages(),
    ],
  },
}

export default config
