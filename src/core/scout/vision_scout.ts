import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

// 📂 DATA STRUCTURES
interface ElementNode {
    id: number;
    tagName: string;
    selector: string;
    text: string;
    isVisible: boolean;
    center: { x: number, y: number };
}

interface VisionIntel {
    url: string;
    timestamp: string;
    screenshotPath: string;
    interactiveElements: ElementNode[];
}

export class VisionScout {
    private browser: Browser | null = null;
    private outputDir: string;

    constructor() {
        // Updated to point to the new 'output' directory in root
        this.outputDir = path.resolve(process.cwd(), 'output', 'vision_intel');
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    async scan(url: string) {
        console.log(`\n👁️  [TESTFORGE SCOUT] Engaging Vision Systems on: ${url}`);
        
        this.browser = await chromium.launch({ headless: false }); 
        const context = await this.browser.newContext();
        const page = await context.newPage();

        try {
            await page.goto(url, { waitUntil: 'networkidle' });
            
            // 🎨 Inject Visual Tags (The "Set-of-Mark" Technique)
            const elements = await this.injectVisualTags(page);

            // 📸 Capture the Robot Vision Snapshot
            const screenshotName = `vision_${Date.now()}.png`;
            const screenshotPath = path.join(this.outputDir, screenshotName);
            
            await page.screenshot({ path: screenshotPath, fullPage: true });
            console.log(`📸 Captured Vision Snapshot: ${screenshotName}`);

            // 💾 Save the Intelligence Report
            const report: VisionIntel = {
                url,
                timestamp: new Date().toISOString(),
                screenshotPath,
                interactiveElements: elements
            };

            const reportPath = path.join(this.outputDir, 'scout_report.json');
            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
            console.log(`✅ Intelligence saved to: ${reportPath}`);
            console.log(`🔢 Mapped ${elements.length} interactive zones.`);

        } catch (e) {
            console.error("❌ Scout Failed:", e);
        } finally {
            await page.waitForTimeout(3000); 
            await this.browser.close();
        }
    }

    private async injectVisualTags(page: Page): Promise<ElementNode[]> {
        return await page.evaluate(() => {
            const interactables: ElementNode[] = [];
            let counter = 1;
            const selector = 'button, a, input, select, textarea, [role="button"], [onclick]';
            const nodes = document.querySelectorAll(selector);

            nodes.forEach((el) => {
                const element = el as HTMLElement;
                const rect = element.getBoundingClientRect();
                if (rect.width < 5 || rect.height < 5 || window.getComputedStyle(element).visibility === 'hidden') return;

                // Create Badge
                const badge = document.createElement('div');
                badge.textContent = counter.toString();
                badge.style.position = 'absolute';
                badge.style.zIndex = '99999';
                badge.style.backgroundColor = '#ff0000'; 
                badge.style.color = '#ffffff';
                badge.style.fontWeight = 'bold';
                badge.style.fontSize = '12px';
                badge.style.padding = '2px 6px';
                badge.style.borderRadius = '10px';
                badge.style.top = `${window.scrollY + rect.top - 10}px`; 
                badge.style.left = `${window.scrollX + rect.left - 10}px`;
                
                document.body.appendChild(badge);
                element.style.border = '2px solid #ff0000';

                // Generate Selector
                let cssSelector = element.tagName.toLowerCase();
                if (element.id) cssSelector += `#${element.id}`;
                else if (element.className) cssSelector += `.${element.className.split(' ')[0]}`;
                if (element.getAttribute('name')) cssSelector += `[name="${element.getAttribute('name')}"]`;

                interactables.push({
                    id: counter,
                    tagName: element.tagName.toLowerCase(),
                    selector: cssSelector,
                    text: element.innerText || (element as HTMLInputElement).placeholder || '',
                    isVisible: true,
                    center: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
                });
                counter++;
            });
            return interactables;
        });
    }
}

// 🟢 RUNNER (Self-executing if run directly)
if (require.main === module) {
    const TARGET_APP = 'https://www.saucedemo.com/';
    new VisionScout().scan(TARGET_APP);
}
