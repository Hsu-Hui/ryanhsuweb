// firebase.json 的轉址規則。實際的 HTTP 行為另外用 Firebase 模擬器確認。
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const { hosting } = JSON.parse(readFileSync(new URL('../firebase.json', import.meta.url), 'utf8'));

function redirectFor(path) {
  const rule = hosting.redirects.find((r) => new RegExp(r.regex).test(path));
  return rule && { destination: rule.destination, type: rule.type };
}

test('網址規則：不帶結尾斜線、不帶 .html', () => {
  assert.equal(hosting.public, 'dist');
  assert.equal(hosting.cleanUrls, true);
  assert.equal(hosting.trailingSlash, false);
});

const cases = [
  ['/page/2', { destination: '/posts', type: 301 }],
  ['/page/12/', { destination: '/posts', type: 301 }],
  ['/contact', { destination: '/about', type: 301 }],
  ['/contact/', { destination: '/about', type: 301 }],
  ['/contact.html', { destination: '/about', type: 301 }],
  ['/page/abc', undefined],
  ['/contacts', undefined],
  ['/posts', undefined],
];

for (const [path, expected] of cases) {
  test(`${path} → ${expected ? expected.destination : '不轉址'}`, () => {
    assert.deepEqual(redirectFor(path), expected);
  });
}
