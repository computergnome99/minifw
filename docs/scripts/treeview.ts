const itemSelector = '[role="treeitem"]';

function getItems(tree: HTMLElement): HTMLElement[] {
  return [...tree.querySelectorAll<HTMLElement>(itemSelector)];
}

function setFocus(item: HTMLElement): void {
  const tree = item.closest<HTMLElement>("[data-docs-tree]");
  if (!tree) return;

  for (const treeItem of getItems(tree)) treeItem.tabIndex = -1;
  item.tabIndex = 0;
  item.focus();
}

function parentItem(item: HTMLElement): HTMLElement | undefined {
  const group = item.parentElement?.closest('[role="group"]');
  return group?.previousElementSibling?.matches(itemSelector)
    ? (group.previousElementSibling as HTMLElement)
    : undefined;
}

function firstChild(item: HTMLElement): HTMLElement | undefined {
  const group = item.parentElement?.querySelector('[role="group"]');
  return group?.querySelector<HTMLElement>(itemSelector) ?? undefined;
}

document.addEventListener("keydown", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const item = target.closest<HTMLElement>(itemSelector);
  const tree = item?.closest<HTMLElement>("[data-docs-tree]");
  if (!item || !tree) return;

  const items = getItems(tree);
  const itemIndex = items.indexOf(item);
  const expanded = item.getAttribute("aria-expanded");

  switch (event.key) {
    case "ArrowDown": {
      event.preventDefault();
      setFocus(items[(itemIndex + 1) % items.length]!);
      break;
    }
    case "ArrowUp": {
      event.preventDefault();
      setFocus(items[(itemIndex - 1 + items.length) % items.length]!);
      break;
    }
    case "Home": {
      event.preventDefault();
      setFocus(items[0]!);
      break;
    }
    case "End": {
      event.preventDefault();
      setFocus(items.at(-1)!);
      break;
    }
    case "ArrowRight": {
      event.preventDefault();
      if (expanded === "false") item.click();
      else if (expanded === "true") {
        const child = firstChild(item);
        if (child) setFocus(child);
      }
      break;
    }
    case "ArrowLeft": {
      event.preventDefault();
      if (expanded === "true") item.click();
      else {
        const parent = parentItem(item);
        if (parent) setFocus(parent);
      }
      break;
    }
    case "Enter":
    case " ": {
      if (expanded === null) return;
      event.preventDefault();
      item.click();
      break;
    }
  }
});

function restoreTreeFocus(): void {
  document
    .querySelector<HTMLElement>("[data-docs-tree] [data-tree-focus=true]")
    ?.focus();
}

document.addEventListener("htmx:afterSwap", restoreTreeFocus);
document.addEventListener("htmx:after:swap", restoreTreeFocus);
