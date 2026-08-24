import { expect, test } from "@playwright/test";

const longReportPath = "/research-mobile/popup/cookieverse";

test.describe("long research navigation", () => {
  test.use({ viewport: { width: 1440, height: 420 } });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "research-archive:archive-collapsed",
        "false",
      );
    });
    await page.goto(longReportPath);
    await page
      .getByRole("button", { name: "收起研究档案导航", exact: true })
      .waitFor();
  });

  test("archive navigation reaches its footer without scrolling the article", async ({
    page,
  }) => {
    const archive = page.locator(".archive-spine-content");
    const pageScrollBefore = await page.evaluate(() => window.scrollY);
    const metrics = await archive.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        clientHeight: element.clientHeight,
        overscrollBehavior: style.overscrollBehavior,
        overflowY: style.overflowY,
        scrollbarGutter: style.scrollbarGutter,
        scrollbarWidth: style.scrollbarWidth,
        scrollHeight: element.scrollHeight,
      };
    });

    expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight);
    expect(metrics.overscrollBehavior).toContain("contain");
    expect(metrics.overflowY).toMatch(/auto|scroll/);
    expect(metrics.scrollbarGutter).toContain("stable");
    expect(metrics.scrollbarWidth).toBe("thin");

    await archive.hover();
    await page.mouse.wheel(0, 700);
    await expect
      .poll(() => archive.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
    expect(await page.evaluate(() => window.scrollY)).toBe(pageScrollBefore);

    await archive.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    const footerIsInside = await page.evaluate(() => {
      const scroller = document.querySelector(".archive-spine-content");
      const footer = document.querySelector(".archive-spine-footer");
      if (!scroller || !footer) return false;
      const scrollerBox = scroller.getBoundingClientRect();
      const footerBox = footer.getBoundingClientRect();
      return footerBox.bottom <= scrollerBox.bottom + 1;
    });
    expect(footerIsInside).toBe(true);
  });

  test("article outline reserves a scrollbar and scrolls independently", async ({
    page,
  }) => {
    const outline = page.getByRole("navigation", {
      name: "本文目录",
      exact: true,
    });
    await outline.evaluate((element) =>
      element.scrollIntoView({ block: "start", behavior: "instant" }),
    );
    const metrics = await outline.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        clientHeight: element.clientHeight,
        overscrollBehavior: style.overscrollBehavior,
        overflowY: style.overflowY,
        scrollbarGutter: style.scrollbarGutter,
        scrollbarWidth: style.scrollbarWidth,
        scrollHeight: element.scrollHeight,
      };
    });

    expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight);
    expect(metrics.overscrollBehavior).toContain("contain");
    expect(metrics.overflowY).toMatch(/auto|scroll/);
    expect(metrics.scrollbarGutter).toContain("stable");
    expect(metrics.scrollbarWidth).toBe("thin");

    await outline.hover();
    const pageScrollBefore = await page.evaluate(() => window.scrollY);
    await page.mouse.wheel(0, 8);
    await expect
      .poll(() => outline.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
    expect(await page.evaluate(() => window.scrollY)).toBe(pageScrollBefore);
  });
});
