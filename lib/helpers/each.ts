/**
 * Maps each item in an array to a string and concatenates the result. Useful
 * for rendering repeated template fragments from list data.
 *
 * @example
 *   const items = each(["a", "b"], (item) => `<li>${item}</li>`);
 *
 * @param basis The array to iterate over.
 * @param callback Called for each item with its index.
 * @returns The concatenated string output.
 */
export const each = <T>(
  basis: T[],
  callback: (item: T, index: number) => string,
): string => {
  return basis.map((item, index) => callback(item, index)).join("");
};
