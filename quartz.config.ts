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
        header: { name: "Anton", weights: [400] },
        body: { name: "Geist", weights: [400, 500, 600] },
        code: { name: "Geist Mono", weights: [400, 500] },
      },
      colors: {
        lightMode: {
          light: "#fff6ef",
          lightgray: "#f0dfd8",
          gray: "#8a6f80",
          darkgray: "#4a3550",
          dark: "#1e0f26",
          secondary: "#d1145a",
          tertiary: "#c95a00",
          highlight: "rgba(209, 20, 90, 0.06)",
          textHighlight: "#ff9a3c55",
        },
        darkMode: {
          light: "#0e0818",
          lightgray: "#2a1f3a",
          gray: "#8c7fa3",
          darkgray: "#bdb2cf",
          dark: "#f7f0ff",
          secondary: "#ff4d8d",
          tertiary: "#ff9a3c",
          highlight: "rgba(255, 77, 141, 0.08)",
          textHighlight: "#ff9a3c55",
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
