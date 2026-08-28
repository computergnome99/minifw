import { describe, expect, test } from "bun:test";
import { error } from "../../helpers/error";
import { renderErrorResponse } from "./render-error-response";

describe("renderErrorResponse", () => {
  test("maps Mini HTTP errors to their status and message", async () => {
    let caught: unknown;

    try {
      error(404, "Missing");
    } catch (error_) {
      caught = error_;
    }

    const response = renderErrorResponse(caught);

    expect(response.status).toBe(404);
    expect(await response.text()).toBe("Missing");
  });

  test("returns generic 500 for unknown errors", async () => {
    const response = renderErrorResponse(new Error("Boom"));

    expect(response.status).toBe(500);
    expect(await response.text()).toBe("Internal Server Error");
  });
});
