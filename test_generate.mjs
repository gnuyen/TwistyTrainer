import { TwistyPlayer } from "cubing/twisty";

const player = new TwistyPlayer({
  puzzle: "3x3x3",
  alg: "R U R' U R U2 R'",
  experimentalStickering: "OLL",
  visualization: "experimental-2D-LL",
  background: "none",
  controlPanel: "none"
});

// Wait for it to render
setTimeout(() => {
  const svg = player.shadowRoot?.querySelector('svg');
  if (svg) {
    console.log("SVG found!");
    console.log(svg.outerHTML.substring(0, 100));
  } else {
    console.log("SVG not found");
  }
}, 1000);
