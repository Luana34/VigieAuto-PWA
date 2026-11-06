import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../css/themes.css', import.meta.url), 'utf8');
function props(theme) {
  const escaped = theme.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`:root\\[data-theme="${escaped}"\\]\\s*\\{([^}]*)\\}`));
  assert.ok(match, `palette ${theme}`);
  return Object.fromEntries([...match[1].matchAll(/--([\w-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/g)].map(x => [x[1], x[2].toLowerCase()]));
}
const expected = {
  'sauge-dark': { bg:'#121212', surface:'#193128', 'surface-alt':'#234137', green:'#91d2a5', 'button-bg':'#91d2a5', 'vehicle-bg':'#1b3b2b', light:'#2d4c3a' },
  'cyan-dark': { bg:'#121212', surface:'#142f36', 'surface-alt':'#1a3a42', green:'#72d4dc', 'button-bg':'#54c7d0', 'vehicle-bg':'#09242b', light:'#244b52' },
  'sauge': { bg:'#edf4ee', surface:'#ffffff', green:'#286f4f', 'vehicle-bg':'#dbeade' },
  'cyan': { bg:'#eef6f7', surface:'#ffffff', green:'#00798a', 'vehicle-bg':'#0c2d36' },
};
for (const [theme, values] of Object.entries(expected)) {
  test(`palette ${theme} : fond, cartes et accents attendus`, () => {
    const actual=props(theme);
    for (const [key,value] of Object.entries(values)) assert.equal(actual[key],value,`${theme} / ${key}`);
  });
}
test('les fonds html/body utilisent la même variable, y compris sur mobile', () => {
  assert.match(css,/html,\s*body\s*\{\s*background:\s*var\(--bg\)/);
  assert.match(css,/body\s*\{\s*background:\s*var\(--bg\)/);
  assert.match(css,/:root\[data-theme="sauge-dark"\],\s*:root\[data-theme="cyan-dark"\]\s*\{\s*background:\s*var\(--bg\)/);
});
