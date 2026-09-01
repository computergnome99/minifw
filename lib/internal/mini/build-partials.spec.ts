import { describe, expect, test } from "bun:test";
import { error, MiniHttpError } from "../../helpers/error";
import { redirectTo } from "../../helpers/redirect-to";
import { partial } from "../../core/partial";
import { buildPartials } from "./build-partials";

describe("buildPartials", () => {
  test("registers normalized partial route names", async () => {
    const handlers = buildPartials({
      "/greeting": partial(() => "<p>Hello</p>", { allowNonHtmx: true }),
    });

    expect(Object.keys(handlers)).toContain("/partial/greeting");

    const response = await handlers["/partial/greeting"]!(
      new Request("http://localhost/partial/greeting"),
    );
    expect(await response.text()).toBe("<p>Hello</p>");
  });

  test("handles partial caching when enabled", async () => {
    let calls = 0;
    const handlers = buildPartials({
      stable: partial(
        () => {
          calls += 1;
          return `<p>${calls}</p>`;
        },
        { allowNonHtmx: true, cache: true },
      ),
    });

    const first = await handlers["/partial/stable"]!(
      new Request("http://localhost/partial/stable"),
    );
    const second = await handlers["/partial/stable"]!(
      new Request("http://localhost/partial/stable"),
    );

    expect(await first.text()).toBe("<p>1</p>");
    expect(await second.text()).toBe("<p>1</p>");
    expect(calls).toBe(1);
  });

  test("propagates MiniFW HTTP errors", async () => {
    const handlers = buildPartials({
      fail: partial(
        () => {
          error(409, "conflict");
        },
        { allowNonHtmx: true },
      ),
    });

    await expect(() =>
      handlers["/partial/fail"]!(new Request("http://localhost/partial/fail")),
    ).toThrow(MiniHttpError);
  });

  test("returns render-time redirects", async () => {
    const handlers = buildPartials({
      account: partial(() => redirectTo("/login"), {
        allowNonHtmx: true,
      }),
    });

    const response = await handlers["/partial/account"]!(
      new Request("http://localhost/partial/account"),
    );

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/login");
  });
});
