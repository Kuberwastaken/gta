// Animates the ASCII hero: the sea drifts, stars twinkle. Pure text updates,
// paused off-screen and disabled for reduced-motion users.
let raf = 0
document.addEventListener("nav", () => {
  cancelAnimationFrame(raf)
  const pre = document.querySelector<HTMLElement>('pre[data-ascii="scene"]')
  if (!pre || matchMedia("(prefers-reduced-motion: reduce)").matches) return
  const base = (pre.textContent ?? "").split("\n")
  const seaStart = base.findIndex((l) => /~/.test(l) && !/[@%#]/.test(l))
  if (seaStart < 0) return
  let visible = true
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
  io.observe(pre)
  let t = 0
  let last = 0
  const frame = (now: number) => {
    raf = requestAnimationFrame(frame)
    if (!visible || now - last < 140) return
    last = now
    t++
    const out = base.map((line, y) => {
      if (y >= seaStart) {
        const shift = (t * (1 + ((y - seaStart) % 3))) % Math.max(1, line.length)
        // drift only the sparse swell; keep the sun's reflection anchored
        return line.replace(/[~-]/g, (_c, i: number) => ((i + shift) % 7 < 4 ? "~" : "-"))
      }
      if (y < seaStart - 12) {
        return line.replace(/[.+]/g, (c, i: number) => ((i * 31 + y * 17 + t) % 23 === 0 ? (c === "." ? "+" : "*") : c))
      }
      return line
    })
    pre.textContent = out.join("\n")
  }
  raf = requestAnimationFrame(frame)
  window.addCleanup(() => {
    cancelAnimationFrame(raf)
    io.disconnect()
  })
})
