import { chromium } from "playwright-core";

const chromePath = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true
});

const page = await browser.newPage({ viewport: { width: 1896, height: 900 } });

await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.screenshot({ path: "public/screenshots/landing-page.png", fullPage: false });

await page.locator("#audit").scrollIntoViewIfNeeded();
await page.screenshot({ path: "public/screenshots/audit-inputs.png", fullPage: false });

await page.getByLabel("Primary use case").selectOption("data");
await page.getByLabel("Seats").fill("6");
await page.getByRole("button", { name: "Generate audit" }).click();
await page.waitForSelector(".resultHero");
await page.screenshot({ path: "public/screenshots/audit-result.png", fullPage: false });

await page.getByPlaceholder("work@email.com").fill("harsha@gmail.com");
await page.getByRole("button", { name: "Capture report" }).click();
await page.waitForSelector(".status");
await page.screenshot({ path: "public/screenshots/captured-report.png", fullPage: false });

await browser.close();
