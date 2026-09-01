import { expect, test } from "bun:test";
import { redirect } from "./redirect";

test("redirect creates a response with the requested destination and status", () => {
  const response = redirect("/docs/getting-started", 301);

  expect(response.status).toBe(301);
  expect(response.headers.get("location")).toBe("/docs/getting-started");
});

test("redirect defaults to a temporary redirect", () => {
  expect(redirect("/docs").status).toBe(302);
});
