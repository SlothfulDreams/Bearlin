import { Resvg } from '@resvg/resvg-js';
import { fileURLToPath } from 'node:url';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

type IconNode = [tag: string, attributes: Record<string, string | number>];

const icons = {
  home: 'house',
  discover: 'compass',
  words: 'book-open-text',
  settings: 'settings',
} as const;

const outputDirectory = path.resolve('assets/images/nativeTabIcons');

function escapeAttribute(value: string | number) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

async function readLucideNode(iconName: string): Promise<IconNode[]> {
  const moduleUrl = import.meta.resolve(`lucide-react-native/icons/${iconName}`);
  const source = await readFile(fileURLToPath(moduleUrl), 'utf8');
  const callStart = source.indexOf('createLucideIcon(');
  const nodeStart = source.indexOf('[', callStart);
  const nodeEnd = source.lastIndexOf(']);');

  if (callStart < 0 || nodeStart < 0 || nodeEnd < 0) {
    throw new Error(`Could not read Lucide icon node for ${iconName}`);
  }

  // Lucide's installed ESM files contain a static array of tag/attribute pairs.
  return Function(`"use strict"; return (${source.slice(nodeStart, nodeEnd + 1)});`)() as IconNode[];
}

function renderSvg(nodes: IconNode[]) {
  const children = nodes.map(([tag, attributes]) => {
    const renderedAttributes = Object.entries(attributes)
      .filter(([name]) => name !== 'key')
      .map(([name, value]) => `${name}="${escapeAttribute(value)}"`)
      .join(' ');
    return `<${tag} ${renderedAttributes}/>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${children}</svg>`;
}

await mkdir(outputDirectory, { recursive: true });

for (const [assetName, lucideName] of Object.entries(icons)) {
  const svg = renderSvg(await readLucideNode(lucideName));
  for (const [scale, suffix] of [[1, ''], [2, '@2x'], [3, '@3x']] as const) {
    const size = 32 * scale;
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng();
    await writeFile(path.join(outputDirectory, `${assetName}${suffix}.png`), png);
  }
}
