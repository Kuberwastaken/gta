import { FullSlug, resolveRelative, slugifyFilePath, FilePath } from "./path"

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

/**
 * Minimal inline markdown for frontmatter strings (tldr, facts, FAQ answers):
 * **bold**, *italic*, `code`, [text](url) and [[wikilinks|label]]. Output is
 * escaped HTML, so frontmatter can never inject markup.
 */
export function inlineMd(src: string, from: FullSlug | string): string {
  let s = esc(String(src ?? ""))
  s = s.replace(/\[\[([^\]|#]+)(#[^\]|]+)?(?:\|([^\]]+))?\]\]/g, (_, target: string, anchor = "", label?: string) => {
    const t = target.trim().replace(/\.md$/, "")
    const slug = slugifyFilePath((t + ".md") as FilePath)
    const url = resolveRelative(from as FullSlug, slug) + (anchor ?? "")
    const text = label ?? t.split("/").pop()!.replaceAll("-", " ")
    return `<a class="internal" href="${url}">${text}</a>`
  })
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (_, text, url) => `<a class="external" href="${url}" rel="noopener" target="_blank">${text}</a>`)
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  s = s.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>")
  return s
}
