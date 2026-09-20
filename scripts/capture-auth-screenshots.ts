import { chromium } from "@playwright/test";
import path from "path";

const BASE_URL = "http://localhost:5173";
const SCREENSHOT_DIR = path.join(process.cwd(), "screenshots");

async function captureScreenshots() {
  const browser = await chromium.launch();

  try {
    // Desktop 1440px
    console.log("Capturing login page at 1440px...");
    let page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "page-login-1440.png"),
      fullPage: true,
    });
    await page.close();

    console.log("Capturing signup page at 1440px...");
    page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
    await page.goto(`${BASE_URL}/signup`, { waitUntil: "networkidle" });
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "page-signup-1440.png"),
      fullPage: true,
    });
    await page.close();

    // Mobile 375px
    console.log("Capturing login page at 375px...");
    page = await browser.newPage({ viewport: { width: 375, height: 812 } });
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "page-login-375.png"),
      fullPage: true,
    });
    await page.close();

    console.log("Capturing signup page at 375px...");
    page = await browser.newPage({ viewport: { width: 375, height: 812 } });
    await page.goto(`${BASE_URL}/signup`, { waitUntil: "networkidle" });
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "page-signup-375.png"),
      fullPage: true,
    });
    await page.close();

    console.log("Screenshots captured successfully!");
  } finally {
    await browser.close();
  }
}

captureScreenshots().catch(console.error);
