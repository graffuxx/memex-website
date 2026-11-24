const DOUBLE = { id: 'double', label: 'DOUBLE FLIP', line: 'Wooow!', duration: 1240 };
const TRIPLE = { id: 'triple', label: 'TRIPLE FLIP', line: 'Naaaice!', duration: 1500 };
const QUAD = { id: 'quad', label: 'QUAD FLIP', line: 'GODLIKE!', duration: 1760 };

export function flipComboTier(count) {
  if (count === 2) return DOUBLE;
  if (count === 3) return TRIPLE;
  if (count === 4) return QUAD;
  if (count > 4) return { ...QUAD, label: `${count}× FLIP` };
  return null;
}

export function animateResolvedFlips(view, { board, last: { flips, side } }, effect) {
  const tier = flipComboTier(flips.length);
  return Promise.all(flips.map((cell, index) => view.flip(board[cell].uid, side, tier ? {
    delay: index * 65,
    accent: true,
    onImpact() {
      if (index === 0) effect.announce(tier, flips, side);
      effect.flash(tier, cell);
    },
  } : undefined)));
}

export function bindFlipCombo(stage, svg, { audio, motion }) {
  const layer = document.createElement('div');
  const caption = document.createElement('div');
  const label = document.createElement('strong');
  const line = document.createElement('span');

  layer.className = 'flip-combo-layer';
  caption.className = 'flip-combo';
  caption.hidden = true;
  caption.setAttribute('role', 'status');
  caption.append(label, line);
  layer.append(caption);
  stage.append(layer);

  let timer;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animate = () => motion() && !reduceMotion.matches;

  function position(cell, area) {
    const field = svg.querySelector(`[data-cell="${cell}"] .field-hit`);
    const rect = field?.getBoundingClientRect();
    if (!rect?.width || !rect.height) return null;
    return {
      x: rect.left + rect.width / 2 - area.left,
      y: rect.top + rect.height / 2 - area.top,
      size: Math.max(rect.width, rect.height),
    };
  }

  function clear() {
    clearTimeout(timer);
    caption.hidden = true;
    label.textContent = '';
    line.textContent = '';
    for (const node of layer.querySelectorAll('.flip-combo-impact')) node.remove();
  }

  return {
    clear,
    announce(tier, cells, side) {
      clear();
      const area = layer.getBoundingClientRect();
      const points = cells.map(cell => position(cell, area)).filter(Boolean);
      const centerX = points.length
        ? points.reduce((sum, point) => sum + point.x, 0) / points.length
        : area.width / 2;
      const top = points.length ? Math.min(...points.map(point => point.y - point.size / 2)) : area.height / 2;
      const safeX = Math.min(area.width / 2, Math.min(148, area.width * .43));
      const safeY = Math.min(area.height / 2, 62);

      caption.style.left = Math.max(safeX, Math.min(area.width - safeX, centerX)) + 'px';
      caption.style.top = Math.max(safeY, Math.min(area.height - safeY, top - 43)) + 'px';
      caption.style.setProperty('--combo-duration', tier.duration + 'ms');
      caption.dataset.tier = tier.id;
      caption.dataset.side = side === 0 ? 'own' : 'rival';
      caption.dataset.motion = animate() ? 'on' : 'off';
      label.textContent = tier.label;
      line.textContent = tier.line;
      caption.hidden = false;
      timer = setTimeout(clear, tier.duration);
      void audio.sayCombo(tier.id);
    },
    flash(tier, cell) {
      if (!animate()) return;
      const point = position(cell, layer.getBoundingClientRect());
      if (!point) return;
      const impact = document.createElement('span');
      impact.className = 'flip-combo-impact';
      impact.dataset.tier = tier.id;
      impact.setAttribute('aria-hidden', 'true');
      impact.style.cssText = `left:${point.x}px;top:${point.y}px;--impact-size:${Math.max(44, point.size)}px`;
      impact.addEventListener('animationend', event => {
        if (event.target === impact && !event.pseudoElement) impact.remove();
      });
      layer.insertBefore(impact, caption);
    },
  };
}
