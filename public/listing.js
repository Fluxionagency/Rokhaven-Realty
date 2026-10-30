/* RokHaven listing page: builds the page from window.LISTING and runs the animated 3D floor plan. */
(function () {
  const L = window.LISTING;
  const $ = (s, r) => (r || document).querySelector(s);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSmall = () => window.innerWidth < 860;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const clamp = x => Math.min(1, Math.max(0, x));
  const easeOut = x => 1 - Math.pow(1 - x, 3);

  let unitIdx = 0;
  try { const h = location.hash.slice(1); const i = L.units.findIndex(u => u.key === h); if (i >= 0) unitIdx = i; } catch (e) {}

  $('#area').textContent = L.area;

  // ---------- The building ----------
  const B = L.building;
  $('#b-title').textContent = B.title;
  $('#b-intro').textContent = B.intro;
  $('#b-stats').innerHTML = B.stats.map(([n, l]) => `<div><strong>${esc(n)}</strong><span>${esc(l)}</span></div>`).join('');
  $('#b-amen').innerHTML = B.amenities.map(([t, d]) => `<div><b>${esc(t)}</b><p>${esc(d)}</p></div>`).join('');
  $('#b-gallery').innerHTML = B.gallery.map(g => `<figure class="${esc(g.cls || '')}"><img src="${esc(g.src)}" alt="${esc(g.caption)}" loading="lazy"><figcaption>${esc(g.caption)}</figcaption></figure>`).join('');
  const pill = s => /sold|not available/i.test(s) ? `<span class="pill sold">${esc(s)}</span>` : /ask/i.test(s) ? `<span class="pill ask">${esc(s)}</span>` : `<span class="pill ok">${esc(s)}</span>`;
  $('#b-mix').innerHTML = '<thead><tr><th>Home</th><th>In building</th><th>Size</th><th>Price</th><th>Status</th></tr></thead><tbody>' +
    B.mix.map(r => `<tr class="${/sold|not available/i.test(r[4]) ? 'sold' : ''}"><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td class="price">${esc(r[3])}</td><td>${pill(r[4])}</td></tr>`).join('') + '</tbody>';
  $('#b-nearby').innerHTML = B.nearby ? `<h3>${esc(B.nearby.title)}</h3><ul>${B.nearby.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>${B.nearby.note ? `<p class="note">${esc(B.nearby.note)}</p>` : ''}` : '';

  // ---------- FAQ ----------
  if (L.faq && L.faq.length) {
    $('#faq').hidden = false;
    $('#faq-list').innerHTML = L.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('');
  }

  // ---------- Live from site ----------
  $('#live-title').textContent = L.live.title;
  $('#live-text').textContent = L.live.text;
  $('#live-meta').innerHTML = L.live.meta.map(([k, v]) => `<div><div class="k">${esc(k)}</div><div class="v">${esc(v)}</div></div>`).join('');
  $('#live-media').innerHTML = L.video
    ? `<video controls playsinline preload="metadata" poster="${esc(L.video.poster)}" src="${esc(L.video.src)}" aria-label="Live site walkthrough video"></video>`
    : `<div class="live-empty">The latest walkthrough of this building is being edited.<br><br>Ask us on WhatsApp and we’ll send the newest site footage.</div>`;

  // ---------- Enquiry → Leadboard → thank-you page ----------
  const F = L.form || {};
  const LB = 'https://makarfi.leadboard.ng/api/v1/f/' + (F.key || 'lbf_62f4c46be59e5b10f9701aac5b8ed123') + '/';
  const BTN = F.button || 'Submit enquiry';
  $('#f-submit').textContent = BTN;
  if (F.heading) $('#enq-h').textContent = F.heading;
  if (F.intro) $('#enq-p').textContent = F.intro;
  $('#f-country-wrap').hidden = !F.country; $('#f-country').required = !!F.country;
  $('#f-consent-wrap').hidden = !F.consent; $('#f-consent').required = !!F.consent;
  if (F.noRequest) { $('#f-when-wrap').hidden = true; }
  $('#f-extra').innerHTML = (F.selects || []).map(x => `<div class="field"><label for="fx-${esc(x.key)}">${esc(x.label)}</label><select id="fx-${esc(x.key)}" data-key="${esc(x.key)}">${x.options.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join('')}</select></div>`).join('');
  const fHome = $('#f-home');
  fHome.innerHTML = L.units.map((u, i) => `<option value="${i}">${esc(u.label)} · ${esc(u.price)}</option>`).join('');
  // Fetch the anti-spam timestamp when the page opens (the form rejects very fast submissions).
  let lbTs = null, lbHoneypot = F.honeypot || 'lb_caf510a2';
  try { fetch(LB + 'schema/').then(r => r.json()).then(j => { lbTs = j && j.antispam && j.antispam.timestamp; if (j && j.antispam && j.antispam.honeypot_field) lbHoneypot = j.antispam.honeypot_field; }).catch(() => {}); } catch (e) {}
  const WHEN = { site_inspection: 'a private site inspection', video_walkthrough: 'a live video walkthrough', price_list: 'the full price list and payment plan' };
  function waText(u, name, when, msg) {
    return (`Hello RokHaven, ${name ? 'this is ' + name + '. ' : ''}I'm interested in the ${u.title.toLowerCase()} in ${L.area}${/request/i.test(u.price) ? '. Please send me the price' : ' (' + u.price + ')'}.` + (when ? ` I'd like ${WHEN[when] || when}.` : '') + (msg ? ' ' + msg : '')).trim();
  }
  function updateWA() {}
  const form = $('#enquiry-form'), status = $('#f-status'), btn = $('#f-submit');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const u = L.units[+fHome.value || 0];
    const name = $('#f-name').value.trim(), wa = $('#f-wa').value.trim(), email = $('#f-email').value.trim(), when = $('#f-when').value, msg = $('#f-msg').value.trim();
    btn.disabled = true; btn.textContent = 'Sending…'; status.textContent = '';
    const country = $('#f-country').value.trim();
    const body = { full_name: name, whatsapp: wa, email, request_type: when, message: msg, listing_page: document.title + ' · ' + u.label,
                   property: u.product || '', area: L.area, home: u.title + ' · ' + u.price };
    if (F.country) body.country = country;
    if (F.unitField) body[F.unitField] = u.key;
    document.querySelectorAll('#f-extra select').forEach(sel => { body[sel.dataset.key] = sel.value; });
    if (F.noRequest) delete body.request_type;
    try { const up = new URLSearchParams(location.search); ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].forEach(k => { if (up.get(k)) body[k] = up.get(k); }); } catch (err) {}
    body[lbHoneypot] = '';
    let sent = false;
    try {
      if (!lbTs) { const j = await fetch(LB + 'schema/').then(r => r.json()); lbTs = j.antispam.timestamp; }
      const res = await fetch(LB + 'submit/', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())) }, body: JSON.stringify(Object.assign(body, { lb_ts: lbTs })) });
      sent = res.ok;
      if (!res.ok) { const d = await res.json().catch(() => ({})); if (d.field_errors) { status.textContent = 'Please check: ' + Object.keys(d.field_errors).join(', ') + '.'; btn.disabled = false; btn.textContent = BTN; return; } }
    } catch (err) { sent = false; }
    const q = new URLSearchParams({ n: name, h: u.title, p: u.price, a: L.area, back: location.pathname + '#' + u.key, w: (L.thanks && L.thanks.wa) || waText(u, name, when, msg), s: sent ? '1' : '0' });
    if (L.thanks) { if (L.thanks.title) q.set('tt', L.thanks.title); if (L.thanks.lede) q.set('tl', L.thanks.lede); if (L.thanks.cta) q.set('tc', L.thanks.cta); }
    try { sessionStorage.setItem('rh_thanks', q.toString()); } catch (err) {}
    if (sent) { try { window.rhTrack && window.rhTrack.lead(u.product || u.title, u.price); } catch (err) {} }
    location.href = (F.thanksUrl || '/enquiry-received') + '?' + q.toString();
  });
  document.querySelectorAll('.copy').forEach(b => b.addEventListener('click', () => {
    const done = t => { b.textContent = t; setTimeout(() => b.textContent = 'Copy', 1600); };
    const select = () => { const r = document.createRange(); r.selectNodeContents(document.getElementById(b.dataset.target)); const s = getSelection(); s.removeAllRanges(); s.addRange(r); done('Selected'); };
    try { navigator.clipboard.writeText(b.dataset.copy).then(() => done('Copied'), select); } catch (e) { select(); }
  }));

  const startMode = u => (u.levels.length > 1 && !u.layouts ? 'all' : 0);

  // ---------- Unit tabs ----------
  const tabsEl = $('#tabs');
  if (L.units.length > 1) {
    tabsEl.hidden = false;
    tabsEl.innerHTML = '<p class="tabs-k">Homes available in this building</p>' + L.units.map((u, i) =>
      `<button class="tab" type="button" data-i="${i}" aria-pressed="false"><span><b>${esc(u.label)}</b><small>${esc(u.size)}</small></span><strong>${esc(u.price)}</strong></button>`).join('');
    tabsEl.querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => {
      unitIdx = +b.dataset.i;
      try { history.replaceState(null, '', '#' + L.units[unitIdx].key); } catch (e) {}
      renderUnit();
      if (isSmall()) $('#stage').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    }));
  }

  function renderUnit() {
    const u = L.units[unitIdx];
    $('#u-title').textContent = u.title;
    $('#u-price').textContent = u.price;
    $('#u-avail').innerHTML = u.avail.split(' · ').map(esc).join('<br>');
    $('#u-lede').textContent = u.lede;
    $('#u-facts').innerHTML = u.facts.map(([k, v]) => `<li><div class="k">${esc(k)}</div><div class="v">${esc(v)}</div></li>`).join('');
    tabsEl.querySelectorAll('.tab').forEach((b, i) => b.setAttribute('aria-pressed', String(i === unitIdx)));
    $('#stage-title').innerHTML = u.levels.length ? `${esc(u.label)} · 3D floor plan<small>${esc(u.planNote || 'Built from the developer’s floor plans')}</small>` : `${esc(u.label)} · Interiors<small>Floor plan on request</small>`;
    $('#sched-title').textContent = u.label.charAt(0).toUpperCase() + u.label.slice(1) + ', room by room';
    $('#sched-note').textContent = u.schedNote || 'Room sizes from the developer’s floor plans. Every size is approximate.';
    $('#layout').hidden = !u.levels.length;
    $('#noplan-img').src = u.noPlanImage || '';
    $('#noplan-text').textContent = u.noPlanText || '';
    $('#schedule').innerHTML = u.levels.map(l => `<div class="sched"><h3>${esc(l.name)}</h3><p class="sub">${esc(l.sub || '')}</p><ul>${
      l.rooms.map(r => Array.isArray(r) ? `<li><span>${esc(r[0])}</span><span>${esc(r[1])} m²</span></li>` : `<li><span>${esc(r)}</span><span></span></li>`).join('')}</ul></div>`).join('');
    const pr = $('#pricing'); pr.hidden = !u.pricing;
    if (u.pricing) pr.innerHTML = `<h3>${esc(u.pricing.title)}</h3><p class="sub">${esc(u.pricing.sub || '')}</p><div class="table-scroll"><table class="mix price-table"><thead><tr>${u.pricing.cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${u.pricing.rows.map(r => `<tr>${r.map((v, i) => `<td class="${i === (u.pricing.hi ?? 2) ? 'price' : ''}">${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="form-note">${esc(u.pricing.note || '')}</p>`;
    $('#highlights').innerHTML = u.highlights.map(([b, s]) => `<div><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join('');
    const lv = $('#levels');
    lv.hidden = u.levels.length < 2;
    lv.innerHTML = (u.levels.length > 1 && !u.layouts ? '<button type="button" data-l="all">All levels</button>' : '') +
      u.levels.map((l, i) => `<button type="button" data-l="${i}">${esc(l.name)}</button>`).join('');
    lv.querySelectorAll('button').forEach(b => b.addEventListener('click', () => plan && plan.setMode(b.dataset.l === 'all' ? 'all' : +b.dataset.l)));
    fHome.value = String(unitIdx); updateWA();
    $('#fallback').innerHTML = u.levels.filter(l => l.plan).map(l => `<img src="${esc(l.plan)}" alt="${esc(u.label)}, ${esc(l.name)} floor plan">`).join('');
    if (plan) plan.build(u); else syncLevelButtons(startMode(u));
  }
  function syncLevelButtons(mode) {
    $('#levels').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String((b.dataset.l === 'all' ? 'all' : +b.dataset.l) === mode)));
  }

  // ---------- 3D floor plan ----------
  const plan = (function () {
    if (typeof THREE === 'undefined') { document.documentElement.classList.add('no-webgl'); return null; }
    const stage = $('#stage'), canvas = $('#plan');
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); }
    catch (e) { document.documentElement.classList.add('no-webgl'); return null; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmall() ? 1.5 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 200);
    scene.add(new THREE.HemisphereLight(0xe4e9f2, 0x0b1b35, 1.15));
    const sun = new THREE.DirectionalLight(0xffe4bc, 1.9);
    sun.position.set(-7, 16, 8); sun.castShadow = true; sun.shadow.mapSize.set(isSmall() ? 1024 : 2048, isSmall() ? 1024 : 2048);
    Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 50 }); sun.shadow.bias = -0.0008;
    scene.add(sun);
    const ground = new THREE.Mesh(new THREE.CircleGeometry(15, 72), new THREE.MeshStandardMaterial({ color: 0x0e2240, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -0.02; ground.receiveShadow = true; scene.add(ground);
    const ring = new THREE.Mesh(new THREE.RingGeometry(14.5, 14.56, 160), new THREE.MeshBasicMaterial({ color: 0xC0A870, transparent: true, opacity: .4 }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.001; scene.add(ring);

    let walls = null;
    const wallsReady = fetch('/plans/walls.json').then(r => r.json()).then(j => { walls = j; }).catch(() => { walls = {}; });
    const loader = new THREE.TextureLoader();
    const SLAB = 0.16, WALL = 0.6, GAP = 2.7;
    const boxGeo = new THREE.BoxGeometry(1, 1, 1); boxGeo.translate(0, 0.5, 0);
    const wallBase = new THREE.MeshStandardMaterial({ color: 0xf2ece1, roughness: .55 });
    const sideBase = new THREE.MeshStandardMaterial({ color: 0x1c2f4d, roughness: .8 });
    let levels = [], mode = 'all', t0 = 0, buildId = 0;

    function dispose() {
      levels.forEach(l => { scene.remove(l.group); l.group.traverse(o => { if (o.geometry && o.geometry !== boxGeo) o.geometry.dispose(); const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach(m => { if (m) { if (m.map) m.map.dispose(); m.dispose(); } }); }); });
      levels = [];
    }

    const FILLS = { living: '#efe8dc', wet: '#dfe6ea', bed: '#e8dcc6', leisure: '#d6e4ea', service: '#d9d5cd', outdoor: '#c7d1c8', pool: '#6fc1da' };
    function schematicCanvas(level) {
      const W = 1400, H = Math.round(W / level.aspect), c = document.createElement('canvas'); c.width = W; c.height = H;
      const g = c.getContext('2d'); g.fillStyle = '#e6e1d7'; g.fillRect(0, 0, W, H);
      level.zones.forEach(([name, type, x0, y0, x1, y1]) => {
        g.fillStyle = FILLS[type] || '#e6e1d7'; g.fillRect(x0 * W, y0 * H, (x1 - x0) * W, (y1 - y0) * H);
        if (type === 'pool') { g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 3; for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(x0 * W + 20, (y0 + (y1 - y0) * i / 6) * H); g.lineTo(x1 * W - 20, (y0 + (y1 - y0) * i / 6) * H); g.stroke(); } }
        g.fillStyle = '#1b2a40'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.font = '600 ' + Math.round(W * 0.019) + 'px "DM Sans", Arial, sans-serif';
        const lines = name.split('\n');
        lines.forEach((t, i) => g.fillText(t.toUpperCase(), (x0 + x1) / 2 * W, (y0 + y1) / 2 * H + (i - (lines.length - 1) / 2) * W * 0.026));
      });
      return c;
    }
    function schematicWalls(level) {
      const tx = 0.009, ty = tx * level.aspect, out = [[0, 0, 1, ty], [0, 1 - ty, 1, 1], [0, 0, tx, 1], [1 - tx, 0, 1, 1]];
      level.zones.forEach(([, type, x0, y0, x1, y1]) => {
        if (type === 'outdoor' || type === 'pool') return;
        out.push([x0, y0, x1, y0 + ty], [x0, y1 - ty, x1, y1], [x0, y0, x0 + tx, y1], [x1 - tx, y0, x1, y1]);
      });
      return out;
    }

    async function build(u) {
      const id = ++buildId;
      await wallsReady;
      if (id !== buildId) return;
      dispose();
      $('#stage').classList.toggle('noplan', !u.levels.length);
      if (!u.levels.length) return;
      const dims = u.levels.map(l => l.zones ? { w: 1000, h: 1000 / l.aspect } : (walls[l.key] ? { w: walls[l.key].w, h: walls[l.key].h } : { w: 1000, h: 700 }));
      const S = 10.5 / Math.max(...dims.map(d => Math.max(d.w, d.h)));
      u.levels.forEach((l, i) => {
        const W = dims[i].w * S, H = dims[i].h * S, data = walls[l.key] || {};
        const group = new THREE.Group(); scene.add(group);
        const outline = data.outline && data.outline.length > 2 ? data.outline : [[0, 0], [1, 0], [1, 1], [0, 1]];
        const shape = new THREE.Shape(outline.map(([x, y]) => new THREE.Vector2(x, 1 - y)));
        const geo = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false }); geo.translate(-0.5, -0.5, 0); geo.rotateX(-Math.PI / 2);
        const tex = l.zones ? new THREE.CanvasTexture(schematicCanvas(l)) : loader.load(l.plan);
        tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        const topMat = new THREE.MeshStandardMaterial({ map: tex, roughness: .85, transparent: true, opacity: 0 });
        const sMat = sideBase.clone(); sMat.transparent = true; sMat.opacity = 0;
        const slab = new THREE.Mesh(geo, [topMat, sMat]); slab.scale.set(W, SLAB, H); slab.receiveShadow = true; group.add(slab);
        const pts = outline.map(([x, y]) => new THREE.Vector3((x - 0.5) * W, SLAB + 0.004, (y - 0.5) * H)); pts.push(pts[0].clone());
        const edgeMat = new THREE.LineBasicMaterial({ color: 0xC0A870, transparent: true, opacity: 0 });
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), edgeMat));

        const items = [];
        const rects = l.zones ? schematicWalls(l) : (data.walls || []);
        rects.forEach(([x0, y0, x1, y1]) => items.push({ x: ((x0 + x1) / 2 - 0.5) * W, z: ((y0 + y1) / 2 - 0.5) * H, sx: Math.max((x1 - x0) * W, 0.035), sz: Math.max((y1 - y0) * H, 0.035), ry: 0, h: WALL }));
        if (!rects.length) {
          // Rendered plans already show interior walls; raise the outer walls around them.
          for (let k = 0; k < outline.length; k++) {
            const a = outline[k], b = outline[(k + 1) % outline.length];
            const ax = (a[0] - 0.5) * W, az = (a[1] - 0.5) * H, bx = (b[0] - 0.5) * W, bz = (b[1] - 0.5) * H, len = Math.hypot(bx - ax, bz - az);
            if (len < 0.04) continue;
            items.push({ x: (ax + bx) / 2, z: (az + bz) / 2, sx: len + 0.06, sz: 0.07, ry: -Math.atan2(bz - az, bx - ax), h: 0.45 });
          }
        }
        const wMat = wallBase.clone(); wMat.transparent = true; wMat.opacity = 0;
        const mesh = new THREE.InstancedMesh(boxGeo, wMat, Math.max(items.length, 1)); mesh.count = items.length;
        mesh.castShadow = true; mesh.receiveShadow = true; mesh.frustumCulled = false; group.add(mesh);
        const maxD = Math.max(1, ...items.map(it => Math.hypot(it.x, it.z)));
        items.forEach(it => { it.d = Math.hypot(it.x, it.z) / maxD; });
        levels.push({ idx: i, group, topMat, sMat, edgeMat, wMat, mesh, items, start: i * 1.6, cy: i * GAP, cop: 1, lastRise: -1 });
      });
      t0 = performance.now() / 1000;
      nLevels = u.layouts ? 1 : u.levels.length;
      cam.phi = 0.18; cam.tPhi = isSmall() ? 0.9 : 0.98; cam.theta = cam.tTheta = 0.75; cam.r = cam.tR = baseR();
      setMode(startMode(u));
    }

    function setMode(m) {
      mode = m; syncLevelButtons(m);
      cam.tR = baseR() * (m === 'all' ? 1 : 0.85);
    }
    function target(l) {
      if (mode === 'all') return { y: l.idx * GAP, op: 1 };
      if (l.idx === mode) return { y: 0, op: 1 };
      return { y: l.idx > mode ? l.idx * GAP + 4 : 0, op: 0 };
    }

    // Camera orbit
    const cam = { theta: 0.75, phi: 0.18, r: 20, tTheta: 0.75, tPhi: 0.98, tR: 20, ty: 0 };
    let nLevels = 1;
    function baseR() { const a = camera.aspect || 1.4; return (a < 0.75 ? 34 : a < 0.9 ? 31 : a < 1.25 ? 27 : 23) * (1 + 0.14 * (nLevels - 1)); }
    let lastUser = -99;
    const drag = { pts: new Map(), lx: 0, ly: 0, sx: 0, sy: 0, axis: null, p0: 0, r0: 0 };
    canvas.addEventListener('pointerdown', e => {
      drag.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (drag.pts.size === 1) { drag.lx = drag.sx = e.clientX; drag.ly = drag.sy = e.clientY; drag.axis = e.pointerType === 'mouse' ? 'free' : null; }
      if (drag.pts.size === 2) { const [a, b] = [...drag.pts.values()]; drag.p0 = Math.hypot(a.x - b.x, a.y - b.y); drag.r0 = cam.tR; drag.axis = 'pinch'; }
      lastUser = performance.now() / 1000;
    });
    canvas.addEventListener('pointermove', e => {
      if (!drag.pts.has(e.pointerId)) return;
      drag.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      lastUser = performance.now() / 1000;
      if (drag.axis === 'pinch' && drag.pts.size === 2) { const [a, b] = [...drag.pts.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); if (drag.p0) cam.tR = Math.min(40, Math.max(9, drag.r0 * drag.p0 / d)); return; }
      if (drag.axis === null) { const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy; if (Math.hypot(dx, dy) < 8) return; drag.axis = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v'; }
      if (drag.axis === 'v') return;
      const dx = e.clientX - drag.lx, dy = e.clientY - drag.ly; drag.lx = e.clientX; drag.ly = e.clientY;
      cam.tTheta -= dx * 0.007;
      if (drag.axis === 'free') cam.tPhi = Math.min(1.35, Math.max(0.12, cam.tPhi - dy * 0.005));
    });
    const end = e => { drag.pts.delete(e.pointerId); if (!drag.pts.size) drag.axis = null; else if (drag.axis === 'pinch') drag.axis = 'v'; };
    canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('wheel', e => { if (!e.ctrlKey) return; e.preventDefault(); cam.tR = Math.min(40, Math.max(9, cam.tR * Math.exp(e.deltaY * 0.01))); lastUser = performance.now() / 1000; }, { passive: false });

    function resize() {
      const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    }
    new ResizeObserver(resize).observe(stage); resize();
    let visible = true;
    new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(stage);

    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
    let last = performance.now() / 1000;
    function frame() {
      requestAnimationFrame(frame);
      const now = performance.now() / 1000, dt = Math.min(0.05, now - last); last = now;
      if (!visible || document.hidden) return;
      const t = reduce ? 99 : now - t0, k = reduce ? 1 : 1 - Math.exp(-dt * 4);
      levels.forEach(l => {
        const tg = target(l), local = t - l.start;
        const appear = easeOut(clamp(local / 0.9));
        const rise = reduce ? 1 : clamp((local - 0.5) / 1.5);
        l.cy += (tg.y - l.cy) * k; l.cop += (tg.op - l.cop) * k;
        const op = l.cop * appear;
        l.group.position.y = l.cy + (1 - appear) * (l.idx === 0 ? 0 : 6);
        l.topMat.opacity = op; l.sMat.opacity = op; l.edgeMat.opacity = op * 0.9; l.wMat.opacity = op;
        const opaque = op > 0.98; l.topMat.transparent = l.sMat.transparent = l.wMat.transparent = !opaque;
        l.group.visible = op > 0.01;
        if (Math.abs(l.lastRise - rise) > 1e-4) {
          l.items.forEach((it, i) => {
            const e = easeOut(clamp(rise * 1.4 - it.d * 0.4));
            p.set(it.x, SLAB, it.z); q.setFromAxisAngle(up, it.ry); s.set(it.sx, Math.max(it.h * e, 0.001), it.sz);
            m4.compose(p, q, s); l.mesh.setMatrixAt(i, m4);
          });
          l.mesh.instanceMatrix.needsUpdate = true; l.lastRise = rise;
        }
      });
      if (!reduce && now - lastUser > 4) cam.tTheta += dt * 0.1;
      const kc = reduce ? 1 : 1 - Math.exp(-dt * (t < 3 ? 1.1 : 3.5));
      cam.theta += (cam.tTheta - cam.theta) * (reduce ? 1 : 1 - Math.exp(-dt * 5));
      cam.phi += (cam.tPhi - cam.phi) * kc; cam.r += (cam.tR - cam.r) * kc;
      const ty = mode === 'all' ? (levels.length - 1) * GAP / 2 : 0;
      cam.ty += (ty - cam.ty) * k;
      camera.position.set(Math.sin(cam.theta) * Math.sin(cam.phi) * cam.r, cam.ty + Math.cos(cam.phi) * cam.r, Math.cos(cam.theta) * Math.sin(cam.phi) * cam.r);
      camera.lookAt(0, cam.ty, 0);
      renderer.render(scene, camera);
    }
    requestAnimationFrame(frame);

    $('#replay').addEventListener('click', () => { t0 = performance.now() / 1000; levels.forEach(l => { l.lastRise = -1; }); cam.phi = 0.18; cam.tPhi = isSmall() ? 0.9 : 0.98; cam.tR = baseR(); setMode(startMode(L.units[unitIdx])); });
    return { build, setMode };
  })();

  if (!plan) $('#replay').hidden = true;
  renderUnit();
})();
