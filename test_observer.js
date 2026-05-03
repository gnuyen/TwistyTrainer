const { JSDOM } = require('jsdom');
const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="host"></div></body></html>`);
const window = dom.window;
const document = window.document;

// Mock TwistyPlayer shadow root
const host = document.getElementById('host');
host.attachShadow({ mode: 'open' });

let observerCalls = 0;
const applyGreyOut = () => {
    observerCalls++;
    const svg = host.shadowRoot.querySelector('svg');
    if (svg) {
        let changed = 0;
        const stops = svg.querySelectorAll('stop');
        stops.forEach((stop) => {
            const color = stop.getAttribute('stop-color');
            if (
                color &&
                color !== 'black' &&
                color !== '#555555' &&
                color !== 'yellow' &&
                !color.startsWith('rgba')
            ) {
                stop.setAttribute('stop-color', '#555555');
                changed++;
            }
        });
        // console.log(`applyGreyOut ran, changed ${changed} stops`);
    }
};

const observer = new window.MutationObserver(applyGreyOut);
observer.observe(host.shadowRoot, { childList: true, subtree: true });

// Simulate cubing.js rendering the SVG
host.shadowRoot.innerHTML = `
<svg>
  <defs>
    <radialGradient id="grad1">
      <stop offset="100%" stop-color="limegreen"></stop>
      <stop offset="100%" stop-color="yellow"></stop>
    </radialGradient>
  </defs>
</svg>
`;

setTimeout(() => {
    console.log("Observer calls:", observerCalls);
    console.log("SVG after:", host.shadowRoot.innerHTML);
}, 100);
