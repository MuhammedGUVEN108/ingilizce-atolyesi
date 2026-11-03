import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseHTML} from 'linkedom';

test('all direct-open assets, font files and SVG icon references exist locally', () => {
  const root = new URL('../',import.meta.url);
  const html = fs.readFileSync(new URL('index.html',root),'utf8');
  const {document} = parseHTML(html);
  for (const tag of document.querySelectorAll('script[src],link[href]')) {
    const path = tag.getAttribute('src') || tag.getAttribute('href');
    assert.ok(!/^https?:/.test(path), 'Runtime resource must be local: '+path);
    assert.ok(fs.existsSync(new URL(path,root)),path);
  }
  const css = fs.readFileSync(new URL('site/css/app.css',root),'utf8');
  const cssDocument = parseHTML('<html><head><style>'+css+'</style></head><body></body></html>').document;
  assert.ok(cssDocument.querySelector('style').sheet.cssRules.length > 0);
  for (const match of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
    assert.ok(fs.existsSync(new URL(match[1],new URL('site/css/app.css',root))),match[1]);
  }
  const symbols = new Set([...document.querySelectorAll('symbol')].map(el=>'#'+el.id));
  for (const el of document.querySelectorAll('use')) assert.ok(symbols.has(el.getAttribute('href')));
  const font = fs.readFileSync(new URL('site/fonts/InterVariable.woff2',root));
  assert.equal(font.subarray(0,4).toString(),'wOF2');
  assert.ok(fs.existsSync(new URL('site/fonts/LICENSE-Inter.txt',root)));
});
