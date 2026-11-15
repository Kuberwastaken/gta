// Ticks every countdown on the page toward local midnight on release day.
// The server-rendered date stays in the HTML for crawlers and no-JS readers.
let timer: number | undefined
function tick() {
  const nodes = document.querySelectorAll<HTMLElement>(".countdown[data-release]")
  nodes.forEach((el) => {
    const [y, m, d] = el.dataset.release!.split("-").map(Number)
    const target = new Date(y, m - 1, d, 0, 0, 0).getTime()
    const diff = target - Date.now()
    const grid = el.querySelector<HTMLElement>(".cd-grid")
    const label = el.querySelector<HTMLElement>(".cd-label")
    if (!grid || !label) return
    if (diff <= 0) {
      el.classList.add("released")
      label.textContent = "GTA 6 is out now"
      grid.hidden = true
      return
    }
    grid.hidden = false
    const s = Math.floor(diff / 1000)
    const parts: Record<string, number> = {
      d: Math.floor(s / 86400),
      h: Math.floor((s % 86400) / 3600),
      m: Math.floor((s % 3600) / 60),
      s: s % 60,
    }
    for (const [k, v] of Object.entries(parts)) {
      const b = grid.querySelector<HTMLElement>(`[data-u="${k}"]`)
      if (b) b.textContent = String(v).padStart(2, "0")
    }
  })
}
document.addEventListener("nav", () => {
  if (timer) window.clearInterval(timer)
  tick()
  timer = window.setInterval(tick, 1000)
  window.addCleanup(() => window.clearInterval(timer))
})
