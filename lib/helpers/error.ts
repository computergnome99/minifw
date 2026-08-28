/** Error type used by MiniFW to represent HTTP errors. */
export class MiniHttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "MiniHttpError";
    this.status = status;
  }
}

/** Validate that a status code is in the HTTP client/server error range. */
function isHttpErrorCode(status: number): boolean {
  return Number.isInteger(status) && status >= 400 && status <= 599;
}

/**
 * Throw an HTTP error to abort rendering.
 *
 * @example
 *   if (!user) {
 *     error(404, "User not found");
 *   }
 *
 * @param status HTTP status code in the 4xx or 5xx range.
 * @param message Error message returned to the client.
 * @throws {MiniHttpError}
 */
export function error(status: number, message: string): never {
  if (!isHttpErrorCode(status)) {
    throw new TypeError("error(status, message) requires a 4xx or 5xx status");
  }

  throw new MiniHttpError(status, message);
}

/**
 * Check whether an unknown value is a MiniFW HTTP error.
 *
 * @param value Value to check.
 * @returns True if the value is a {@link MiniHttpError}.
 */
export function isMiniHttpError(value: unknown): value is MiniHttpError {
  return value instanceof MiniHttpError;
}
