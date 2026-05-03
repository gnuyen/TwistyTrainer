import puppeteer from 'puppeteer';
import fs from 'fs';
import { casesStatic } from './src/lib/casesStatic.ts';

async function main() {
    console.log("Launching puppeteer...");
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    // Create a basic HTML page that loads cubing.js
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <script type="module" src="https://cdn.cubing.net/js/cubing/twisty"></script>
    </head>
    <body>
        <div id="container"></div>
    </body>
    </html>
    `;
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Inject a helper function to render and extract
    await page.addScriptTag({ content: `
        window.renderCase = async (alg, scramble, stepId) => {
            return new Promise((resolve) => {
                const container = document.getElementById('container');
                container.innerHTML = '';
                const player = document.createElement('twisty-player');
                player.setAttribute('puzzle', '3x3x3');
                if (alg) player.setAttribute('alg', alg);
                if (scramble) player.setAttribute('experimental-setup-alg', scramble);
                player.setAttribute('experimental-stickering', stepId);
                player.setAttribute('visualization', 'experimental-2D-LL');
                player.setAttribute('background', 'none');
                player.setAttribute('control-panel', 'none');
                container.appendChild(player);

                // Wait for SVG
                const check = setInterval(() => {
                    if (player.shadowRoot) {
                        const svg = player.shadowRoot.querySelector('svg');
                        if (svg) {
                            clearInterval(check);
                            
                            // Process the SVG colors to use CSS variables
                            const stops = svg.querySelectorAll('stop');
                            stops.forEach(stop => {
                                const color = stop.getAttribute('stop-color');
                                
                                if (stepId === 'OLL') {
                                    if (color === 'yellow') {
                                        stop.setAttribute('stop-color', 'var(--u-color, yellow)');
                                    } else if (color === 'white') {
                                        stop.setAttribute('stop-color', 'var(--d-color, white)');
                                    } else if (color !== 'black' && color !== '#555555' && !color.startsWith('rgba')) {
                                        stop.setAttribute('stop-color', 'var(--side-color, #555555)');
                                    }
                                } else if (stepId === 'PLL') {
                                    if (color === 'yellow') {
                                        stop.setAttribute('stop-color', 'var(--u-color, yellow)');
                                    } else if (color === 'white') {
                                        stop.setAttribute('stop-color', 'var(--d-color, white)');
                                    } else if (color === 'red') {
                                        stop.setAttribute('stop-color', 'var(--f-color, red)');
                                    } else if (color === 'limegreen') {
                                        stop.setAttribute('stop-color', 'var(--r-color, limegreen)');
                                    } else if (color === 'orange') {
                                        stop.setAttribute('stop-color', 'var(--b-color, orange)');
                                    } else if (color === 'rgb(34, 102, 255)') {
                                        stop.setAttribute('stop-color', 'var(--l-color, blue)');
                                    }
                                }
                            });
                            
                            // Clean up some unnecessary styling to keep SVG lean
                            svg.removeAttribute('style');
                            svg.setAttribute('width', '100%');
                            svg.setAttribute('height', '100%');
                            
                            resolve(svg.outerHTML);
                        }
                    }
                }, 50);
            });
        };
    `});

    const svgs = {
        OLL: {},
        PLL: {}
    };

    console.log("Generating SVGs...");

    const groupsToProcess = ['oll2look', 'ollfull', 'pll2look', 'pllfull'];
    
    for (const groupId of Object.keys(casesStatic)) {
        if (!groupsToProcess.includes(groupId.toLowerCase())) continue;
        
        const stepId = groupId.toLowerCase().includes('oll') ? 'OLL' : 'PLL';
        const cases = casesStatic[groupId];
        
        for (const caseId of Object.keys(cases)) {
            const data = cases[caseId];
            
            // Generate the default alg and scramble
            const alg = data.algPool?.[0] || '';
            const scramble = data.scramblePool?.[0] || '';
            
            console.log(`Processing ${groupId} - ${caseId}...`);
            const svgString = await page.evaluate(
                (a, s, st) => window.renderCase(a, s, st),
                alg, scramble, stepId
            );
            
            if (!svgs[stepId][groupId]) svgs[stepId][groupId] = {};
            svgs[stepId][groupId][caseId] = svgString;
        }
    }

    await browser.close();

    // Write to file
    const fileContent = `// Automatically generated from cubing.js
export const LL_SVGS: Record<string, Record<string, Record<string, string>>> = ${JSON.stringify(svgs, null, 2)};
`;
    fs.writeFileSync('./src/lib/data/ll_svgs.ts', fileContent);
    console.log("Done! Saved to src/lib/data/ll_svgs.ts");
}

main().catch(console.error);
