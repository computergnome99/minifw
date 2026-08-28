/**
 * After an HTMX swap, move scoped style tags into `<head>` with dedupe by
 * `fwid`.
 */
const handleAfterSwap = (event: Event) => {
  const target = event.target as HTMLElement | null;
  if (!target) return;

  const styles = target.querySelectorAll("style[fwid]");

  for (const style of Array.from(styles)) {
    const id = style.getAttribute("fwid");
    if (!id) continue;

    if (!document.head.querySelector(`style[fwid="${id}"]`)) {
      document.head.appendChild(style.cloneNode(true) as HTMLStyleElement);
    }

    style.remove();
  }
};

/** Register style promotion for HTMX swaps once the body is available. */
const registerAfterSwapListener = () => {
  document.body.addEventListener("htmx:afterSwap", handleAfterSwap);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", registerAfterSwapListener, {
    once: true,
  });
} else {
  registerAfterSwapListener();
}
