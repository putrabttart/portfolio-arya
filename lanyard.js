/**
 * Lanyard ID Card - Stable rope physics
 * Clean Verlet integration in pixel space.
 * The last rope node = card's top-center attachment point.
 * Card hangs below that point.
 */
(function () {
  'use strict';

  // Polyfill roundRect
  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      if (typeof r === 'number') r = [r, r, r, r];
      if (!Array.isArray(r)) r = [0, 0, 0, 0];
      const [tl, tr, br, bl] = r;
      this.moveTo(x + tl, y);
      this.lineTo(x + w - tr, y);
      this.arcTo(x + w, y, x + w, y + tr, tr);
      this.lineTo(x + w, y + h - br);
      this.arcTo(x + w, y + h, x + w - br, y + h, br);
      this.lineTo(x + bl, y + h);
      this.arcTo(x, y + h, x, y + h - bl, bl);
      this.lineTo(x, y + tl);
      this.arcTo(x, y, x + tl, y, tl);
      this.closePath();
    };
  }

  const wrapper = document.getElementById('lanyardWrapper');
  const canvas  = document.getElementById('lanyardCanvas');
  const card    = document.getElementById('lanyardCard');
  if (!wrapper || !canvas || !card) return;

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const w = wrapper.offsetWidth;
    const cw = card.offsetWidth;
    card.style.transform = `translate(${(w - cw) / 2}px, 100px)`;
    return;
  }

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  // === CONFIG ===
  const SEGMENTS   = 30;
  const GRAVITY    = 0.35;
  const DAMPING    = 0.97;
  const ITERATIONS = 20;
  const ANCHOR_Y   = 20;  // fixed Y for anchor (px from top of wrapper)

  // === STATE ===
  let W, H, anchorX, ropeLen, segLen;
  let nodes = [];
  let dragging = false;
  let dragPointer = { x: 0, y: 0 };

  function resize() {
    W = wrapper.offsetWidth;
    H = wrapper.offsetHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    anchorX = W / 2;
    // Rope length: enough to place card nicely in the wrapper
    ropeLen = Math.min(H * 0.3, 150);
    segLen  = ropeLen / SEGMENTS;
  }

  function initNodes() {
    nodes = [];
    for (let i = 0; i <= SEGMENTS; i++) {
      const t = i / SEGMENTS;
      nodes.push({
        x:  anchorX,
        y:  ANCHOR_Y + t * ropeLen,
        ox: anchorX,
        oy: ANCHOR_Y + t * ropeLen
      });
    }
  }

  resize();
  initNodes();

  // === POINTER HANDLING ===
  // When dragging, we move the LAST node (card attachment) to follow pointer.
  // The pointer grabs the card at whatever point clicked, so we track offset.
  let grabOffsetX = 0, grabOffsetY = 0;

  function getPointer(e) {
    const rect = wrapper.getBoundingClientRect();
    const cx = (e.touches ? e.touches[0].clientX : e.clientX);
    const cy = (e.touches ? e.touches[0].clientY : e.clientY);
    return { x: cx - rect.left, y: cy - rect.top };
  }

  function onDown(e) {
    e.preventDefault();
    dragging = true;
    card.classList.add('dragging');
    const p = getPointer(e);
    const last = nodes[SEGMENTS];
    // Offset = difference between rope endpoint and where user clicked
    grabOffsetX = last.x - p.x;
    grabOffsetY = last.y - p.y;
    dragPointer = p;
  }

  function onMove(e) {
    if (!dragging) return;
    e.preventDefault();
    dragPointer = getPointer(e);
  }

  function onUp() {
    if (!dragging) return;
    dragging = false;
    card.classList.remove('dragging');
  }

  card.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);

  // === PHYSICS ===
  function simulate() {
    // Verlet integration (skip anchor node 0)
    for (let i = 1; i <= SEGMENTS; i++) {
      const n = nodes[i];

      // If dragging, lock last node to pointer
      if (dragging && i === SEGMENTS) {
        n.x = dragPointer.x + grabOffsetX;
        n.y = dragPointer.y + grabOffsetY;
        n.ox = n.x;
        n.oy = n.y;
        continue;
      }

      const vx = (n.x - n.ox) * DAMPING;
      const vy = (n.y - n.oy) * DAMPING;
      n.ox = n.x;
      n.oy = n.y;
      n.x += vx;
      n.y += vy + GRAVITY;
    }

    // Pin anchor
    nodes[0].x = anchorX;
    nodes[0].y = ANCHOR_Y;

    // Distance constraints (multiple iterations for stability)
    for (let iter = 0; iter < ITERATIONS; iter++) {
      for (let i = 0; i < SEGMENTS; i++) {
        const a = nodes[i];
        const b = nodes[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
        const diff = (dist - segLen) / dist * 0.5;
        const cx = dx * diff;
        const cy = dy * diff;

        if (i !== 0) {
          a.x += cx;
          a.y += cy;
        }
        if (!(dragging && i + 1 === SEGMENTS)) {
          b.x -= cx;
          b.y -= cy;
        }
      }
      // Re-pin anchor every iteration
      nodes[0].x = anchorX;
      nodes[0].y = ANCHOR_Y;
    }
  }

  // === RENDER ===
  function drawRope() {
    ctx.clearRect(0, 0, W, H);

    // --- Anchor clip bar ---
    const clipW = 56, clipH = 7, clipY = ANCHOR_Y - clipH / 2;
    ctx.save();
    ctx.shadowColor = 'rgba(99,102,241,0.5)';
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.roundRect(anchorX - clipW / 2, clipY, clipW, clipH, 3);
    ctx.fill();
    ctx.restore();

    // --- Metal connector ---
    const connW = 10, connH = 16;
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(anchorX - connW / 2, clipY + clipH, connW, connH, [0, 0, 3, 3]);
    ctx.fill();
    ctx.stroke();

    // --- Rope ---
    const ropeStartY = clipY + clipH + connH;
    ctx.beginPath();
    ctx.moveTo(anchorX, ropeStartY);

    // Skip first few nodes that are above the connector
    let startIdx = 0;
    for (let i = 1; i <= SEGMENTS; i++) {
      if (nodes[i].y >= ropeStartY) { startIdx = i; break; }
    }
    if (startIdx === 0) startIdx = 1;

    // Draw smooth curve through nodes
    ctx.lineTo(nodes[startIdx].x, nodes[startIdx].y);
    for (let i = startIdx; i < SEGMENTS; i++) {
      const curr = nodes[i];
      const next = nodes[i + 1];
      const mx = (curr.x + next.x) / 2;
      const my = (curr.y + next.y) / 2;
      ctx.quadraticCurveTo(curr.x, curr.y, mx, my);
    }
    // End at last node
    const last = nodes[SEGMENTS];
    ctx.lineTo(last.x, last.y);

    const grad = ctx.createLinearGradient(anchorX, ropeStartY, last.x, last.y);
    grad.addColorStop(0, '#6366f1');
    grad.addColorStop(1, '#06b6d4');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  function positionCard() {
    const last = nodes[SEGMENTS];
    const prev = nodes[SEGMENTS - 2]; // use node 2 back for smoother angle

    // Angle: how much the rope end deviates from vertical
    const dx = last.x - prev.x;
    const dy = last.y - prev.y;
    const angle = Math.atan2(dx, dy); // angle from vertical
    const rotation = angle; // positive = tilted right

    // Card top-center = last node position
    const cw = card.offsetWidth;
    const tx = last.x - cw / 2;
    const ty = last.y;

    card.style.transform =
      `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) rotate(${rotation.toFixed(3)}rad)`;
    card.style.transformOrigin = '50% 0%'; // rotate around top center
  }

  // === LOOP ===
  function loop() {
    simulate();
    drawRope();
    positionCard();
    requestAnimationFrame(loop);
  }

  // === RESIZE ===
  let resizeTimer;
  const ro = new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      initNodes();
    }, 150);
  });
  ro.observe(wrapper);

  // === START ===
  // Gentle initial swing (desktop only)
  if (window.innerWidth >= 768) {
    setTimeout(() => {
      nodes[SEGMENTS].ox -= 6;
    }, 500);
  }

  loop();
})();
