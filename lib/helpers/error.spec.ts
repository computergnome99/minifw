import { describe, expect, test } from "bun:test";
import { error, isMiniError, MiniHttpError } from "./error";

describe("error", () => {
  test("throws MiniHttpError for 4xx/5xx status codes", () => {
    const status = 404;
    const message = "Not found";

    const act = () => error(status, message);

    expect(act).toThrow(MiniHttpError);

    try {
      act();
    } catch (error_) {
      expect(isMiniError(error_)).toBe(true);
      expect((error_ as MiniHttpError).status).toBe(404);
      expect((error_ as MiniHttpError).message).toBe("Not found");
    }
  });

  test("throws TypeError for non-4xx/5xx status codes", () => {
    const status = 200;

    const act = () => error(status, "Not an error code");

    expect(act).toThrow(TypeError);
  });

  test("isMiniError narrows unknown values", () => {
    const httpError = new MiniHttpError(500, "Boom");
    const regularError = new Error("Boom");

    const httpErrorCheck = isMiniError(httpError);
    const regularErrorCheck = isMiniError(regularError);

    expect(httpErrorCheck).toBe(true);
    expect(regularErrorCheck).toBe(false);
  });
});
