import { isMiniHttpError } from "../../helpers/error";

/** Convert render failures into HTTP responses. */
export function renderErrorResponse(caught: unknown): Response {
  if (isMiniHttpError(caught)) {
    return new Response(caught.message, {
      status: caught.status,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return new Response("Internal Server Error", {
    status: 500,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
