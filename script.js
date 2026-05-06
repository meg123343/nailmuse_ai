const scrollButtons = document.querySelectorAll('[data-scroll-target]');

scrollButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const target = document.getElementById(button.dataset.scrollTarget);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

document.querySelectorAll('.tag-row').forEach((row) => {
  row.addEventListener('click', (event) => {
    const choice = event.target.closest('.choice');
    if (!choice) return;

    row.querySelectorAll('.choice').forEach((item) => item.classList.remove('is-active'));
    choice.classList.add('is-active');
  });
});

const drawButton = document.getElementById('drawCard');
const designSheet = document.querySelector('.design-sheet');
const studioPanel = document.querySelector('.studio-panel');
const controlBoard = document.querySelector('.control-board');
const uploadInput = document.getElementById('inspirationUpload');
const uploadPreview = document.getElementById('uploadPreview');
const uploadHint = document.getElementById('uploadHint');
const sampleUploadButtons = document.querySelectorAll('[data-sample-upload]');
const heroCoverSrc = 'assets/samples/hero-cover.png';
const lalalandSampleSrc = 'assets/samples/lalaland-poster.jpg';
const lockedTips = new Set();
const slotIds = ['R1', 'R2', 'R3', 'R4', 'R5', 'L1', 'L2', 'L3', 'L4', 'L5'];
const shapeClasses = ['shape-oval', 'shape-almond', 'shape-square', 'shape-ballerina'];
const resultTitle = document.querySelector('[data-result-title]');
const resultSubtitle = document.querySelector('[data-result-subtitle]');
const resultNoteTitle = document.querySelector('[data-result-note-title]');
const resultNoteBody = document.querySelector('[data-result-note-body]');
const paletteSwatches = [...document.querySelectorAll('.palette-strip span')];
const nailItems = [...document.querySelectorAll('.nail-item')];

const lalalandImageSets = ['v1', 'v2', 'v3', 'v4'].map((setName) =>
  slotIds.map((slotId) => `assets/nails/lalaland/${setName}/${slotId}.png`)
);

const popMoodSets = [
  {
    palette: ['#173f88', '#efb8c7', '#e85c42', '#f5bd36', '#d4da7d', '#fff7df'],
    slots: ['red stripe', 'blue', 'coral maze', 'cream flower', 'navy swirl', 'jelly dot', 'yellow ring', 'green star', 'coral maze', 'cream line'],
  },
  {
    palette: ['#173f88', '#fff7df', '#ef7358', '#f5bd36', '#d4da7d', '#efb8c7'],
    slots: ['blue swirl', 'cream star', 'yellow ring', 'jelly dot', 'coral maze', 'green flower', 'navy stripe', 'cream line', 'red dot', 'yellow star'],
  },
  {
    palette: ['#ef7358', '#173f88', '#fff7df', '#d4da7d', '#f5bd36', '#efb8c7'],
    slots: ['coral flower', 'cream line', 'navy swirl', 'green star', 'yellow ring', 'red stripe', 'blue', 'jelly dot', 'cream maze', 'yellow dot'],
  },
];

const popMoodSet = {
  title: 'Pop Mood Nail Set',
  subtitle: '先用一套基础样例，看看 10 个槽位、锁定、调序和甲型切换怎么工作。',
  noteTitle: '适合拿给美甲师沟通',
  noteBody: '主图案集中在 2-3 指，其余甲跳色。边缘和饰纹平衡，保留灵感图的颜色，但降低制作难度。',
};

const lalalandSet = {
  title: 'La La Land Night Set',
  subtitle: '把夜空、聚光灯和音乐感，收成一套指尖小样。',
  noteTitle: '夜空、聚光灯和可落地材质',
  noteBody: '主图案集中在磁吸光带、冰透渐变、城市剪影和黄色跳色；文字与人物不进入甲面，只保留星空、路灯和舞台感。',
  palette: ['#08114a', '#4b24b8', '#ffd84d', '#fff2c6', '#17151e', '#f8f4e6'],
};

let variantIndex = 0;
let popVariantIndex = 0;
let activeSet = 'demo';
let uploadTimer;

function setText(element, value) {
  if (element) element.textContent = value;
}

function setStudioReady() {
  studioPanel?.classList.remove('is-waiting');
  window.setTimeout(() => {
    document.getElementById('result')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 80);
}

function updateCopy(set) {
  setText(resultTitle, set.title);
  setText(resultSubtitle, set.subtitle);
  setText(resultNoteTitle, set.noteTitle);
  setText(resultNoteBody, set.noteBody);

  paletteSwatches.forEach((swatch, index) => {
    swatch.style.background = set.palette?.[index] || set.palette?.at(-1) || '#fff7df';
  });
}

function setLockState(index, isLocked) {
  const item = nailItems[index];
  const button = item?.querySelector('.lock-tip');
  if (!item || !button) return;

  if (isLocked) {
    lockedTips.add(index);
    item.classList.add('is-locked');
    button.setAttribute('aria-pressed', 'true');
  } else {
    lockedTips.delete(index);
    item.classList.remove('is-locked');
    button.setAttribute('aria-pressed', 'false');
  }
}

function clearLocks() {
  [...lockedTips].forEach((index) => setLockState(index, false));
}

function setTipClass(item, className, label) {
  const tip = item.querySelector('.nail-tip');
  const image = tip.querySelector('.nail-art');

  if (image) image.remove();
  tip.className = `nail-tip ${className}`;
  tip.setAttribute('aria-label', label);
}

function setTipImage(item, src, label) {
  const tip = item.querySelector('.nail-tip');
  let image = tip.querySelector('.nail-art');

  tip.className = 'nail-tip photo';
  tip.removeAttribute('aria-label');

  if (!image) {
    image = document.createElement('img');
    image.className = 'nail-art';
    tip.append(image);
  }

  image.src = src;
  image.alt = label;
}

function renderPopMoodVariant(index, options = {}) {
  const variant = popMoodSets[index];
  updateCopy({ ...popMoodSet, palette: variant.palette });

  nailItems.forEach((item, itemIndex) => {
    if (options.keepLocked && lockedTips.has(itemIndex)) return;
    setTipClass(item, variant.slots[itemIndex], `${slotIds[itemIndex]} 基础样例`);
  });
}

function renderSet(imageSet, options = {}) {
  updateCopy(lalalandSet);

  nailItems.forEach((item, index) => {
    if (options.keepLocked && lockedTips.has(index)) return;
    setTipImage(item, imageSet[index], `${slotIds[index]} 甲片`);
  });
}

function showDemoSet() {
  activeSet = 'demo';
  clearLocks();
  renderPopMoodVariant(popVariantIndex);
  setStudioReady();
}

function showUploadedDesign() {
  activeSet = 'lalaland';
  clearLocks();
  renderSet(lalalandImageSets[variantIndex]);
  setStudioReady();
}

function startUploadSimulation() {
  window.clearTimeout(uploadTimer);
  activeSet = 'lalaland';
  uploadHint.textContent = '已放入灵感，正在提取色卡和元素...';
  controlBoard?.classList.add('is-generating');
  studioPanel?.classList.add('is-uploading');
  studioPanel?.classList.remove('is-waiting');
  designSheet.classList.add('is-shuffling');
  document.getElementById('result')?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  uploadTimer = window.setTimeout(() => {
    showUploadedDesign();
    controlBoard?.classList.remove('is-generating');
    studioPanel?.classList.remove('is-uploading');
    designSheet.classList.remove('is-shuffling');
    uploadHint.textContent = '灵感已识别，看看这套指尖小样。';
  }, 2000);
}

function loadSampleInspiration() {
  if (uploadPreview) uploadPreview.src = lalalandSampleSrc;
  startUploadSimulation();
}

function regenerateCurrentSet() {
  controlBoard?.classList.add('is-generating');
  designSheet.classList.add('is-shuffling');

  if (activeSet === 'lalaland') {
    variantIndex = (variantIndex + 1) % lalalandImageSets.length;
    renderSet(lalalandImageSets[variantIndex], { keepLocked: true });
  } else {
    activeSet = 'demo';
    popVariantIndex = (popVariantIndex + 1) % popMoodSets.length;
    renderPopMoodVariant(popVariantIndex, { keepLocked: true });
  }

  setStudioReady();

  window.setTimeout(() => {
    designSheet.classList.remove('is-shuffling');
    controlBoard?.classList.remove('is-generating');
  }, 620);
}

function swapItems(fromIndex, toIndex) {
  if (toIndex < 0 || toIndex >= nailItems.length) return;
  const fromTip = nailItems[fromIndex].querySelector('.nail-tip');
  const toTip = nailItems[toIndex].querySelector('.nail-tip');
  const fromClone = fromTip.cloneNode(true);
  const toClone = toTip.cloneNode(true);
  const fromLocked = lockedTips.has(fromIndex);
  const toLocked = lockedTips.has(toIndex);

  fromTip.replaceWith(toClone);
  toTip.replaceWith(fromClone);
  setLockState(fromIndex, toLocked);
  setLockState(toIndex, fromLocked);
}

document.querySelectorAll('[data-start-demo]').forEach((button) => {
  button.addEventListener('click', showDemoSet);
});

sampleUploadButtons.forEach((button) => {
  button.addEventListener('click', loadSampleInspiration);
});

document.querySelector('[data-filter-group="shape"]')?.addEventListener('click', (event) => {
  const choice = event.target.closest('[data-shape]');
  if (!choice || !designSheet) return;

  designSheet.classList.remove(...shapeClasses);
  designSheet.classList.add(`shape-${choice.dataset.shape}`);
});

drawButton?.addEventListener('click', regenerateCurrentSet);

document.querySelectorAll('.lock-tip').forEach((button, index) => {
  button.setAttribute('aria-pressed', 'false');

  button.addEventListener('click', () => {
    setLockState(index, !lockedTips.has(index));
  });
});

document.querySelectorAll('.move-tip').forEach((button) => {
  button.addEventListener('click', () => {
    const item = button.closest('.nail-item');
    const fromIndex = nailItems.indexOf(item);
    const toIndex = fromIndex + Number(button.dataset.move);
    swapItems(fromIndex, toIndex);
  });
});

uploadInput?.addEventListener('change', () => {
  const file = uploadInput.files?.[0];
  if (!file || !file.type.startsWith('image/')) return;

  const previewUrl = URL.createObjectURL(file);
  uploadPreview.src = previewUrl;
  startUploadSimulation();
});

renderPopMoodVariant(popVariantIndex);
if (uploadPreview) uploadPreview.src = heroCoverSrc;
