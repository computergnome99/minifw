document.addEventListener("DOMContentLoaded", () => {
  const navigation = document.querySelector("[data-docs-mobile-navigation]");
  const dialog = navigation?.querySelector("dialog");

  if (navigation && dialog) {
    navigation.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      if (target.closest("[data-docs-navigation-open]")) {
        dialog.showModal();
        return;
      }

      if (
        target === dialog ||
        target.closest("[data-docs-navigation-close]") ||
        target.closest("a")
      ) {
        dialog.close();
      }
    });
  }
});
