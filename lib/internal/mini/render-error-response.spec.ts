import { describe, expect, test } from "bun:test";
import { error } from "../../helpers/error";
import { renderErrorResponse } from "./render-error-response";

describe("renderErrorResponse", () => {
  test("maps Mini HTTP errors to their status and message", () => {
    let caught: unknown;

    try {
      error(404, "Missing");
    } catch (e) {
      caught = e;
    }

    const res = renderErrorResponse(caught);

    expect(res.status).toBe(404);

    return res.text().then((text) => {
      expect(text).toBe("Missing");
    });
  });

  test("returns generic 500 for unknown errors", async () => {
    const res = renderErrorResponse(new Error("Boom"));

    expect(res.status).toBe(500);
    expect(await res.text()).toBe("Internal Server Error");
  });
});
