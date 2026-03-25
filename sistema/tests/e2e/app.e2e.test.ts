import { Builder, By, until, WebDriver } from "selenium-webdriver";

const APP_URL = process.env.APP_URL || "http://web:3000";
const SELENIUM_URL = process.env.SELENIUM_URL || "http://selenium-hub:4444/wd/hub";

describe("Frontend E2E Tests - All Routes and Scenarios", () => {
    let driver: WebDriver;

    beforeAll(async () => {
        // Wait for the app and selenium to be ready if they just spun up
        await new Promise(r => setTimeout(r, 5000));
        
        driver = await new Builder()
            .usingServer(SELENIUM_URL)
            .forBrowser("chrome")
            .build();
        
        // Add implicit wait to make tests more resilient
        await driver.manage().setTimeouts({ implicit: 5000 });
    });

    afterAll(async () => {
        if (driver) {
            await driver.quit();
        }
    });

    describe("Navigation and Dashboard", () => {
        it("should load the home page and navigate to other sections", async () => {
            await driver.get(APP_URL);
            const title = await driver.getTitle();
            expect(title).toBeDefined();

            // Verify Dashboard elements
            const heading = await driver.findElement(By.tagName("h1"));
            expect(await heading.getText()).toContain("Bem-vindo ao ProfTest");

            // Look for navigation links  on the dashboard cards
            const links = await driver.findElements(By.css("a"));
            const linkTexts = await Promise.all(links.map(l => l.getText()));
            expect(linkTexts.some(t => t.includes("Questões"))).toBeTruthy();
            expect(linkTexts.some(t => t.includes("Provas"))).toBeTruthy();
        });
    });

    describe("Manage Questions Route (/questions)", () => {
        beforeAll(async () => {
            await driver.get(`${APP_URL}/questions`);
            await driver.wait(until.elementTextContains(driver.findElement(By.tagName("h2")), "Gerenciamento de Questões"), 10000);
        });

        it("should show basic interface for questions", async () => {
             const heading = await driver.findElement(By.tagName("h2"));
             expect(await heading.getText()).toContain("Gerenciamento de Questões");
        });
    });

    describe("Manage Tests Route (/tests)", () => {
        beforeAll(async () => {
            await driver.get(`${APP_URL}/tests`);
            await driver.wait(until.elementTextContains(driver.findElement(By.tagName("h2")), "Gerenciamento de Provas"), 10000);
        });

        it("should show basic interface for tests", async () => {
             const heading = await driver.findElement(By.tagName("h2"));
             expect(await heading.getText()).toContain("Gerenciamento de Provas");
        });
    });

    describe("Correction Route (/correction)", () => {
        beforeAll(async () => {
            await driver.get(`${APP_URL}/correction`);
            await driver.wait(until.elementTextContains(driver.findElement(By.tagName("h2")), "Importação de Dados"), 10000);
        });

        it("should render correction form", async () => {
            const bodyText = await driver.findElement(By.tagName("body")).getText();
            expect(bodyText).toContain("Selecione");
            expect(bodyText).toContain("RESPOSTAS DOS ALUNOS");
        });
    });
});
