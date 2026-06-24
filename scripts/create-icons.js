const sharp = require('sharp');

async function main() {
  const svg = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#4A90D9"/>
    <text x="256" y="280" font-family="Arial" font-size="240" font-weight="bold" fill="white" text-anchor="middle">F</text>
  </svg>`;
  await sharp(Buffer.from(svg)).resize(512, 512).png().toFile('assets/icon.png');
  console.log('Created assets/icon.png');
}

main().catch((e) => console.error(e));
