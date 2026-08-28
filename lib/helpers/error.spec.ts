import { describe, expect, test } from "bun:test";
import { error, isMiniHttpError, MiniHttpError } from "./error";

describe("error", () => {
  test("throws MiniHttpError for 4xx/5xx status codes", () => {
    // Arrange
    const status = 404;
    const message = "Not found";

    // Act
    const act = () => error(status, message);

    // Assert
    expect(act).toThrow(MiniHttpError);

    try {
      act();
    } catch (caught) {
      expect(isMiniHttpError(caught)).toBe(true);
      expect((caught as MiniHttpError).status).toBe(404);
      expect((caught as MiniHttpError).message).toBe("Not found");
    }
  });

  test("throws TypeError for non-4xx/5xx status codes", () => {
    // Arrange
    const status = 200;

    // Act
    const act = () => error(status, "Not an error code");

    // Assert
    expect(act).toThrow(TypeError);
  });

  test("isMiniHttpError narrows unknown values", () => {
    // Arrange
    const httpError = new MiniHttpError(500, "Boom");
    const regularError = new Error("Boom");

    // Act
    const httpErrorCheck = isMiniHttpError(httpError);
    const regularErrorCheck = isMiniHttpError(regularError);

    // Assert
    expect(httpErrorCheck).toBe(true);
    expect(regularErrorCheck).toBe(false);
  });
});
