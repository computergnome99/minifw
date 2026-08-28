import { each } from "./each";

/**
 * Repeats a string-producing callback a fixed number of times and concatenates
 * the result.
 *
 * @example
 *   const stars = repeat(3, () => "*");
 *
 * @example
 *   const rows = repeat(2, (index) => `<li>${index + 1}</li>`);
 *
 * @param count The number of times to invoke the callback.
 * @param callback Called for each iteration with the current index.
 * @returns The concatenated string output.
 */
export const repeat = (
  count: number,
  callback: (index: number) => string,
): string => {
  return each(Array.from({ length: count }), (_, index) => callback(index));
};
