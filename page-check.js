const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const js = fs.readFileSync(path.join(root, 'script.js'), 'utf8');

const mustIncludeHtml = [
  'NAIL MUSE AI',
  '<span>喜欢的万物，</span>',
  '<span>存在指尖</span>',
  '<span>把一张图、一首歌、一部电影里的喜欢，变成一套独属于你的美甲设计稿</span>',
  '<span>先丢进灵感，看看它会长成什么样</span>',
  'data-upload-trigger',
  'data-sample-upload',
  'type="file"',
  'data-start-demo',
  'class="studio-panel is-waiting"',
  'class="result-placeholder"',
  'Pop Mood Nail Set',
  'data-slot-id="R1"',
  'data-slot-id="L5"',
  'data-result-title',
  'data-result-subtitle',
  'data-result-note-title',
  'assets/nails/lalaland/v1/R1.png',
  'assets/samples/hero-cover.png',
];

mustIncludeHtml.forEach((needle) => assert.ok(html.includes(needle), `${needle} should be in HTML`));

[
  'PCG AI',
  '产品任务拆解',
  '从用户发图到 AI 回图',
  '能拿给美甲师沟通的设计稿',
  '先看 La La Land 的示例',
  '<span>在指尖</span>',
].forEach((needle) => assert.ok(!html.includes(needle), `${needle} should not be in customer-facing HTML`));

const heroPanelBlock = css.match(/\.hero-panel\s*\{[^}]*\}/)?.[0] || '';
const studioPanelBlock = css.match(/\.studio-panel\s*\{[^}]*\}/)?.[0] || '';
assert.doesNotMatch(heroPanelBlock, /border-bottom/);
assert.doesNotMatch(studioPanelBlock, /margin-top:\s*-/);

[
  /\.hero-copy h1 span/,
  /\.hero-text span:first-child/,
  /\.transition-band/,
  /\.lock-tip/,
  /\.move-controls/,
  /\.move-tip/,
  /\.nail-item\.is-locked/,
  /\.result-status strong/,
  /\.nail-tip\.photo/,
  /\.studio-panel\.is-waiting/,
  /\.design-sheet\.shape-square/,
  /\.design-sheet\.shape-almond/,
  /\.design-sheet\.shape-ballerina/,
  /clip-path:\s*inset/,
].forEach((pattern) => assert.match(css, pattern));

[
  /const popMoodSets/,
  /La La Land Night Set/,
  /lalalandImageSets/,
  /showDemoSet/,
  /showUploadedDesign/,
  /startUploadSimulation/,
  /loadSampleInspiration/,
  /sampleUploadButtons/,
  /assets\/samples\/lalaland-poster\.jpg/,
  /assets\/samples\/hero-cover\.png/,
  /renderPopMoodVariant/,
  /renderSet/,
  /swapItems/,
  /setLockState/,
  /shapeClasses/,
  /data-shape/,
  /lockedTips/,
  /is-locked/,
  /if \(options\.keepLocked && lockedTips\.has/,
  /activeSet === 'lalaland'/,
  /window\.setTimeout/,
  /2000/,
].forEach((pattern) => assert.match(js, pattern));

assert.doesNotMatch(js, /lalalandVariants/);
assert.doesNotMatch(js, /file\.name/);

const nailTipCount = (html.match(/class="nail-tip/g) || []).length;
const lockButtonCount = (html.match(/class="lock-tip/g) || []).length;
assert.equal(nailTipCount, 10);
assert.equal(lockButtonCount, 10);

['v1', 'v2', 'v3', 'v4'].forEach((setName) => {
  ['R1', 'R2', 'R3', 'R4', 'R5', 'L1', 'L2', 'L3', 'L4', 'L5'].forEach((slotId) => {
    const assetPath = path.join(root, 'assets', 'nails', 'lalaland', setName, `${slotId}.png`);
    assert.ok(fs.existsSync(assetPath), `${assetPath} should exist`);
  });
});

console.log('Page check passed');
