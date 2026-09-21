import { test } from "@playwright/test";

test.describe("Onboarding Page - Visual", () => {
  test("should render onboarding page at 1440px", async ({ page, context }) => {
    // Mock localStorage to simulate authenticated user
    await context.addInitScript(() => {
      localStorage.setItem(
        "sb-auth-token",
        JSON.stringify({
          access_token:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
          user: {
            id: "test-user-id",
            email: "test@example.com",
            user_metadata: {
              role: "etudiant",
              firstName: "John",
              lastName: "Doe",
            },
          },
        })
      );
    });

    await page.setViewportSize({ width: 1440, height: 1080 });
    await page.goto("http://localhost:8080/onboarding", {
      waitUntil: "domcontentloaded",
    });

    // Wait a bit for the page to render
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({
      path: "screenshots/page-onboarding-1440.png",
      fullPage: true,
    });
  });

  test("should render onboarding page at 375px (mobile)", async ({ page, context }) => {
    // Mock localStorage to simulate authenticated user
    await context.addInitScript(() => {
      localStorage.setItem(
        "sb-auth-token",
        JSON.stringify({
          access_token:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
          user: {
            id: "test-user-id",
            email: "test@example.com",
            user_metadata: {
              role: "etudiant",
              firstName: "John",
              lastName: "Doe",
            },
          },
        })
      );
    });

    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("http://localhost:8080/onboarding", {
      waitUntil: "domcontentloaded",
    });

    // Wait a bit for the page to render
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({
      path: "screenshots/page-onboarding-375.png",
      fullPage: true,
    });
  });
});
