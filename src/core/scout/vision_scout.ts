import { chromium, Browser, Page, Request } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

// 📂 DATA STRUCTURES
interface ElementNode {
    id: number;
    tagName: string;
    selector: string;
    text: string;
    isVisible: boolean;
    attributes: Record<string, string>;
}

interface NetworkCall {
    method: string;
    url: string;
    postData?: string;
    headers: Record<string, string>;
}

interface VisionIntel {
    url: string;
    timestamp: string;
    screenshotPath: string;
    interactiveElements: ElementNode[];
    networkActivity: NetworkCall[]; // New: Added for API Testing
}

export class VisionScout {
    private browser: Browser | null = null;
    private outputDir: string;

    constructor() {
        // Output path: root/output/vision_intel
        this.outputDir = path.resolve(process.cwd(), 'output', 'vision_intel');
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    async scan(url: string) {
        console.log(`\n👁️  [SCOUT] Engaging Vision & Network Systems on: ${url}`);

        this.browser = await chromium.launch({ headless: false }); // Headless: false to see it working
        const context = await this.browser.newContext();
        const page = await context.newPage();

        // 📡 NETWORK INTERCEPTOR (For API Test Generation)
        const networkLogs: NetworkCall[] = [];
        page.on('request', (request: Request) => {
            if (request.resourceType() === 'fetch' || request.resourceType() === 'xhr') {
                networkLogs.push({
                    method: request.method(),
                    url: request.url(),
                    postData: request.postData() || undefined,
                    headers: request.headers()
                });
            }
        });

        try {
            await page.goto(url, { waitUntil: 'networkidle' });

            // 🎨 INJECT VISUAL TAGS (Set-of-Mark Technique)
            const elements = await this.injectVisualTags(page);

            // 📸 CAPTURE SNAPSHOT
            const screenshotName = `vision_snapshot.png`;
            const screenshotPath = path.join(this.outputDir, screenshotName);
            await page.screenshot({ path: screenshotPath, fullPage: true });
            
            console.log(`📸 Captured Vision Snapshot: ${screenshotName}`);

            // 💾 SAVE INTELLIGENCE REPORT
            const report: VisionIntel = {
                url,
                timestamp: new Date().toISOString(),
                screenshotPath,
                interactiveElements: elements,
                networkActivity: networkLogs // Saving API calls
            };

            const reportPath = path.join(this.outputDir, 'scout_report.json');
            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
            
            console.log(`✅ Intelligence saved to: ${reportPath}`);
            console.log(`🔢 Mapped ${elements.length} UI Elements.`);
            console.log(`📡 Captured ${networkLogs.length} API Calls.`);

        } catch (e) {
            console.error("❌ Scout Failed:", e);
        } finally {
            await this.browser.close();
        }
    }

    private async injectVisualTags(page: Page): Promise<ElementNode[]> {
        return await page.evaluate(() => {
            const interactables: ElementNode[] = [];
            let counter = 1;
            // Expanded selector list for better coverage
            const selector = 'button, a, input, select, textarea, [role="button"], [onclick], form';
            const nodes = document.querySelectorAll(selector);

            nodes.forEach((el) => {
                const element = el as HTMLElement;
                const rect = element.getBoundingClientRect();
                
                // Filter out invisible or tiny elements
                if (rect.width < 5 || rect.height < 5 || window.getComputedStyle(element).visibility === 'hidden') return;

                // Create Visual Badge (Red Box)
                const badge = document.createElement('div');
                badge.textContent = counter.toString();
                Object.assign(badge.style, {
                    position: 'absolute',
                    zIndex: '99999',
                    backgroundColor: '#ff0000',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    top: `${window.scrollY + rect.top - 10}px`,
                    left: `${window.scrollX + rect.left - 10}px`,
                    pointerEvents: 'none' // Ensure badge doesn't block clicks
                });
                document.body.appendChild(badge);
                element.style.border = '2px solid #ff0000';

                // Intelligent Selector Generation
                let cssSelector = element.tagName.toLowerCase();
                if (element.id) cssSelector += `#${element.id}`;
                else if (element.getAttribute('data-test')) cssSelector += `[data-test="${element.getAttribute('data-test')}"]`;
                else if (element.className) cssSelector += `.${element.className.split(' ')[0]}`; // Only take first class

                interactables.push({
                    id: counter,
                    tagName: element.tagName.toLowerCase(),
                    selector: cssSelector,
                    text: element.innerText?.slice(0, 50) || (element as HTMLInputElement).placeholder || '',
                    isVisible: true,
                    attributes: {
                        id: element.id,
                        name: element.getAttribute('name') || '',
                        type: element.getAttribute('type') || '',
                        placeholder: (element as HTMLInputElement).placeholder || ''
                    }
                });
                counter++;
            });
            return interactables;
        });
    }
}

// 🟢 RUNNER (Self-executing for testing)
if (require.main === module) {
    const args = process.argv.slice(2);
    const url = args[0] || 'https://www.saucedemo.com/';
    new VisionScout().scan(url);
}