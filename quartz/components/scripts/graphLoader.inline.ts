import type { FullSlug } from "../../util/path"

// The topic graph (d3 + pixi, ~250 KB) is the heaviest script on the site, so
// it is bundled separately and fetched only once a graph is near the viewport
// or the user asks for the global map. Keeps it off the critical path for
// LCP/INP on every article.
type GraphModule = { setupGraph: (slug: FullSlug) => Promise<void> }
let modPromise: Promise<GraphModule> | undefined
const loadModule = () => {
  modPromise ??= (
    import(new URL("/static/graph.js", window.location.origin).href) as Promise<GraphModule>
  ).catch((e) => {
    modPromise = undefined
    throw e
  })
  return modPromise
}

document.addEventListener("nav", (e: CustomEventMap["nav"]) => {
  const slug = e.detail.url
  const containers = [...document.querySelectorAll<HTMLElement>(".graph-container")]
  const icons = [...document.querySelectorAll<HTMLElement>(".global-graph-icon")]
  if (containers.length === 0 && icons.length === 0) return
  let started = false
  const start = async (openGlobal = false) => {
    if (started) {
      if (openGlobal) (document.querySelector(".global-graph-icon") as HTMLElement | null)?.click()
      return
    }
    started = true
    observer?.disconnect()
    icons.forEach((i) => i.removeEventListener("click", onIcon))
    document.removeEventListener("keydown", onKey)
    try {
      const mod = await loadModule()
      await mod.setupGraph(slug)
      if (openGlobal) (document.querySelector(".global-graph-icon") as HTMLElement | null)?.click()
    } catch (error) {
      for (const container of containers) {
        container.replaceChildren()
        const message = document.createElement("p")
        message.className = "graph-status"
        message.append("The interactive graph could not load. ")
        const link = document.createElement("a")
        link.href = "/graph"
        link.textContent = "Open the full topic map"
        message.append(link)
        container.append(message)
      }
      console.warn("Topic graph unavailable", error)
    }
  }
  const onIcon = () => void start(true)
  const onKey = (ev: KeyboardEvent) => {
    if (ev.key === "g" && (ev.ctrlKey || ev.metaKey) && !ev.shiftKey) {
      ev.preventDefault()
      void start(true)
    }
  }
  let observer: IntersectionObserver | undefined
  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver(
      (entries) => entries.some((en) => en.isIntersecting) && void start(),
      {
        rootMargin: "300px",
      },
    )
    containers.forEach((c) => observer!.observe(c))
  } else void start()
  icons.forEach((i) => i.addEventListener("click", onIcon))
  document.addEventListener("keydown", onKey)
  window.addCleanup(() => {
    observer?.disconnect()
    icons.forEach((i) => i.removeEventListener("click", onIcon))
    document.removeEventListener("keydown", onKey)
  })
})
