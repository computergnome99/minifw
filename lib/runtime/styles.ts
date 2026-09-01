/**
 * After an HTMX swap, move scoped style tags into `<head>` with dedupe by
 * `fwid`.
 *
 * @param _event
 */
const handleAfterSwap = (_event: Event) => {
  const styles = document.body.querySelectorAll("style[fwid]");

  for (const style of styles) {
    const id = style.getAttribute("fwid");
    if (!id) continue;

    if (!document.head.querySelector(`style[fwid="${CSS.escape(id)}"]`)) {
      document.head.append(style.cloneNode(true) as HTMLStyleElement);
    }

    style.remove();
  }
};

/** Register style promotion for HTMX swaps once the body is available. */
const registerAfterSwapListener = () => {
  document.body.addEventListener("htmx:afterSwap", handleAfterSwap);
  document.body.addEventListener("htmx:after:swap", handleAfterSwap);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", registerAfterSwapListener, {
    once: true,
  });
} else {
  registerAfterSwapListener();
}
