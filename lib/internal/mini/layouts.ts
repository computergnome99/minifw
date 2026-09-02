import type { MiniLayout } from "../../core/layout";
import type { MiniContext } from "../../core/shared";

export type ResolvedLayout = {
  layout: MiniLayout;
  pattern: string;
};

/** Resolve all layouts matching a pathname from least to most specific. */
export function resolveLayouts(
  layouts: Record<string, MiniLayout>,
  pathname: string,
): ResolvedLayout[] {
  return Object.entries(layouts)
    .filter(([pattern]) => isLayoutPatternMatch(pattern, pathname))
    .map(([pattern, layout]) => ({ layout, pattern }))
    .toSorted(
      (first, second) =>
        layoutSpecificity(first.pattern) - layoutSpecificity(second.pattern),
    );
}

/** Compose matched layouts from the innermost shell to the outermost shell. */
export async function composeLayouts(
  page: string,
  layouts: readonly ResolvedLayout[],
  context: MiniContext,
): Promise<string> {
  let rendered = page;

  for (const { layout } of layouts.toReversed()) {
    rendered = await layout.render({ context, page: rendered });
  }

  return rendered;
}

/** Check whether two resolved layout chains contain the same route patterns. */
export function isSameLayoutChain(
  first: readonly ResolvedLayout[],
  second: readonly ResolvedLayout[],
): boolean {
  return (
    first.length === second.length &&
    first.every(({ pattern }, index) => pattern === second[index]?.pattern)
  );
}

/** Count the matching outer layouts shared by two resolved route chains. */
export function sharedLayoutPrefixLength(
  first: readonly ResolvedLayout[],
  second: readonly ResolvedLayout[],
): number {
  let length = 0;

  while (true) {
    const firstLayout = first[length];
    const secondLayout = second[length];

    if (
      firstLayout === undefined ||
      secondLayout === undefined ||
      firstLayout.pattern !== secondLayout.pattern
    ) {
      break;
    }

    length += 1;
  }

  return length;
}

function isLayoutPatternMatch(pattern: string, pathname: string): boolean {
  if (pattern === "*") return true;

  const normalizedPath = normalizePath(pathname);
  const normalizedPattern = normalizePath(pattern);
  if (normalizedPattern.endsWith("/*")) {
    const basePath = normalizedPattern.slice(0, -"/*".length);
    return (
      normalizedPath === basePath || normalizedPath.startsWith(`${basePath}/`)
    );
  }

  const patternSegments = normalizedPattern.split("/");
  const pathSegments = normalizedPath.split("/");
  return (
    patternSegments.length === pathSegments.length &&
    patternSegments.every(
      (segment, index) =>
        segment.startsWith(":") || segment === pathSegments[index],
    )
  );
}

function layoutSpecificity(pattern: string): number {
  if (pattern === "*") return 0;

  return normalizePath(pattern)
    .split("/")
    .reduce(
      (score, segment) =>
        score + (segment === "*" ? 0 : segment.startsWith(":") ? 1 : 2),
      0,
    );
}

function normalizePath(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}
