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

    describe("1. Navigation and Dashboard", () => {
        it("should load the home page and navigate to other sections", async () => {
            await driver.get(APP_URL);
            const title = await driver.getTitle();
            expect(title).toBeDefined();

            // Verify Dashboard elements
            const heading = await driver.findElement(By.tagName("h2"));
            expect(await heading.getText()).toContain("Bem-vindo ao ProfTest");

            // Look for navigation links (sidebar usually has these words)
            const links = await driver.findElements(By.css("a"));
            const linkTexts = await Promise.all(links.map(l => l.getText()));
            expect(linkTexts.some(t => t.includes("Questões"))).toBeTruthy();
            expect(linkTexts.some(t => t.includes("Provas"))).toBeTruthy();
            expect(linkTexts.some(t => t.includes("Correção"))).toBeTruthy();
        });
    });

    describe("2. Manage Questions Route (/questions)", () => {
        beforeAll(async () => {
            await driver.get(`${APP_URL}/questions`);
            // Wait until some UI loads, we can wait for h2
            await driver.wait(until.elementTextContains(driver.findElement(By.tagName("h2")), "Gerenciamento de Questões"), 10000);
        });

        it("should create a new question", async () => {
            const textarea = await driver.findElement(By.tagName("textarea"));
            await textarea.sendKeys("Qual a capital da França?");

            const inputs = await driver.findElements(By.css("input[type='text']"));
            // Depending on the default empty state, there's at least one answer
            await inputs[0].sendKeys("Paris");

            const checkboxes = await driver.findElements(By.css("input[type='checkbox']"));
            await checkboxes[0].click(); // Mark as correct

            // Add alternative
            const addAltBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Adicionar Alternativa')]"));
            await addAltBtn.click();

            const updatedInputs = await driver.findElements(By.css("input[type='text']"));
            await updatedInputs[1].sendKeys("Londres");

            // Save question
            const saveBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Salvar')]"));
            await saveBtn.click();

            await driver.sleep(1000);

            // Assert question is in the list
            const cards = await driver.findElements(By.css("div[role='button']"));
            const cardTexts = await Promise.all(cards.map(c => c.getText()));
            expect(cardTexts.some(t => t.includes("Qual a capital da França?"))).toBeTruthy();
        });
        
        it("should delete the question", async () => {
            // Find trash icon (might be tricky, we'll try to find a button within a card)
            const cards = await driver.findElements(By.css("div[role='button']"));
            let targetCardIndex = -1;
            for (let i = 0; i < cards.length; i++) {
                const text = await cards[i].getText();
                if (text.includes("Qual a capital da França?")) {
                    targetCardIndex = i;
                    break;
                }
            }
            if (targetCardIndex !== -1) {
                const buttons = await cards[targetCardIndex].findElements(By.tagName("button"));
                // The trash can is typically the second icon button
                const deleteBtn = buttons[1];
                if (deleteBtn) {
                   await deleteBtn.click();
                   // accept alert
                   const alert = await driver.switchTo().alert();
                   await alert.accept();
                   await driver.sleep(1000);
                }
            }
        });
    });

    describe("3. Manage Tests Route (/tests)", () => {
        beforeAll(async () => {
            await driver.get(`${APP_URL}/tests`);
            await driver.wait(until.elementTextContains(driver.findElement(By.tagName("h2")), "Gerenciamento de Provas"), 10000);
        });

        it("should show basic interface for tests", async () => {
             const heading = await driver.findElement(By.tagName("h2"));
             expect(await heading.getText()).toContain("Gerenciamento de Provas");
        });
    });

    describe("4. Correction Route (/correction)", () => {
        beforeAll(async () => {
            await driver.get(`${APP_URL}/correction`);
            await driver.wait(until.elementTextContains(driver.findElement(By.tagName("h2")), "Correção de Provas"), 10000);
        });

        it("should render correction form", async () => {
            const bodyText = await driver.findElement(By.tagName("body")).getText();
            expect(bodyText).toContain("Selecione");
            expect(bodyText).toContain("Arquivo de Respostas (.csv)");
        });
    });
});
