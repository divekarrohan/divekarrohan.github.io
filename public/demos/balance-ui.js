// Interactive front end for balance-core.js. Mounts on #balance.
import { createSim, P } from './balance-core.js';

const root = document.getElementById('balance');
if (root) mount(root);

function mount(root) {
  const canvas = root.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const latency = root.querySelector('[name=latency]');
  const limit = root.querySelector('[name=limit]');
  const predict = root.querySelector('[name=predict]');
  const pushBtn = root.querySelector('[data-push]');
  const status = root.querySelector('[data-status]');
  const latencyOut = root.querySelector('[data-out=latency]');
  const limitOut = root.querySelector('[data-out=limit]');

  const css = getComputedStyle(document.documentElement);
  const col = (n) => css.getPropertyValue(n).trim();
  const C = { ink: col('--ink'), graphite: col('--graphite'), grid: col('--grid'), signal: col('--signal'), limit: col('--limit'), paper: col('--paper') };
  const FONT = "500 12px 'Archivo Variable', system-ui, sans-serif";

  const sim = createSim({ latencyMs: +latency.value, torqueLimit: +limit.value, predict: predict.checked });
  const HIST = 6000; // ms of trace kept
  const hist = new Float32Array(HIST);
  const sat = new Uint8Array(HIST);
  let head = 0, peakSincePush = 0, pushDir = 1, fallTimer = 0, last = performance.now(), visible = true;

  const sync = () => {
    sim.latencyMs = +latency.value;
    sim.torqueLimit = +limit.value;
    sim.predict = predict.checked;
    latencyOut.textContent = `${latency.value} ms`;
    limitOut.textContent = `${limit.value} N·m`;
  };
  [latency, limit, predict].forEach((el) => el.addEventListener('input', sync));
  sync();

  const say = (t) => { if (status.textContent !== t) status.textContent = t; };
  const push = (dir) => {
    if (sim.fallen) return;
    sim.push(2.0 * dir);
    peakSincePush = 0;
  };
  pushBtn.addEventListener('click', () => { push(pushDir); pushDir *= -1; });
  canvas.addEventListener('pointerdown', (e) => {
    // poke from the side you click: clicking left of the body pushes it right
    const r = canvas.getBoundingClientRect();
    const bodyX = geom().ankleX + Math.sin(sim.x.th) * geom().len;
    push(e.clientX - r.left < bodyX ? 1 : -1);
  });

  let W = 0, H = 0;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  new ResizeObserver(resize).observe(canvas);
  resize();
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; last = performance.now(); }).observe(canvas);

  const geom = () => {
    const sceneH = H * 0.58;
    const groundY = sceneH - 18;
    const len = Math.min(sceneH - 24 - 80, 180); // keep the mass clear of the readout
    return { sceneH, groundY, len, ankleX: W * 0.5 };
  };

  function drawScene() {
    const { sceneH, groundY, len, ankleX } = geom();
    const th = sim.x.th;
    const down = sim.fallen;
    // ground
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(ankleX - 140, groundY); ctx.lineTo(ankleX + 140, groundY); ctx.stroke();
    // upright reference
    ctx.setLineDash([3, 4]); ctx.strokeStyle = C.graphite; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(ankleX, groundY); ctx.lineTo(ankleX, groundY - len - 22); ctx.stroke();
    ctx.setLineDash([]);
    // foot
    ctx.fillStyle = C.ink; ctx.fillRect(ankleX - 22, groundY - 6, 44, 6);
    // ankle torque: an arc whose sweep shows |torque| / limit, red when the actuator saturates
    const frac = Math.min(1, Math.abs(sim.applied) / sim.torqueLimit);
    if (frac > 0.01 && !down) {
      const dir = Math.sign(sim.applied);
      ctx.strokeStyle = sim.saturated ? C.limit : C.signal; ctx.lineWidth = 3;
      ctx.beginPath();
      const a0 = -Math.PI / 2, sweep = dir * frac * 1.4;
      ctx.arc(ankleX, groundY - 6, 26, Math.min(a0, a0 - sweep), Math.max(a0, a0 - sweep));
      ctx.stroke();
    }
    // body and center of mass
    const cx = ankleX + Math.sin(th) * len, cy = groundY - 6 - Math.cos(th) * len;
    ctx.strokeStyle = down ? C.limit : C.ink; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(ankleX, groundY - 6); ctx.lineTo(cx, cy); ctx.stroke();
    ctx.fillStyle = down ? C.limit : C.signal;
    ctx.beginPath(); ctx.arc(cx, cy, 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(ankleX, groundY - 6, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
    // readout
    ctx.font = FONT; ctx.fillStyle = C.graphite; ctx.textAlign = 'left';
    const deg = th * 57.2958;
    ctx.fillText(`lean ${(Math.abs(deg) < 0.05 ? 0 : deg).toFixed(1)}°`, 12, 20);
    ctx.fillText(`ankle torque ${Math.round(sim.applied)} N·m`, 12, 38);
    if (sim.saturated && !down) { ctx.fillStyle = C.limit; ctx.fillText('at torque limit', 12, 56); }
    return sceneH;
  }

  function drawTrace(top) {
    const left = 44, right = W - 12, bottom = H - 22, h = bottom - top - 10, mid = top + 10 + h / 2;
    const span = 35; // degrees shown either side
    const y = (deg) => mid - (deg / span) * (h / 2);
    ctx.font = FONT; ctx.textAlign = 'right'; ctx.fillStyle = C.graphite;
    ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
    for (const d of [-30, 0, 30]) {
      ctx.beginPath(); ctx.moveTo(left, y(d)); ctx.lineTo(right, y(d)); ctx.stroke();
      ctx.fillText(`${d}°`, left - 6, y(d) + 4);
    }
    // fall threshold
    ctx.strokeStyle = C.limit; ctx.setLineDash([2, 3]);
    const fall = P.fallAngle * 57.2958;
    for (const d of [fall, -fall]) { ctx.beginPath(); ctx.moveTo(left, y(d)); ctx.lineTo(right, y(d)); ctx.stroke(); }
    ctx.setLineDash([]);
    ctx.textAlign = 'left'; ctx.fillStyle = C.graphite;
    ctx.fillText('lean, last 6 s', left, bottom + 16);
    ctx.textAlign = 'right'; ctx.fillText('now', right, bottom + 16);
    // trace, red where the actuator was saturated
    const n = HIST, step = (right - left) / n;
    ctx.lineWidth = 2; ctx.lineJoin = 'round';
    let prevSat = -1;
    ctx.beginPath();
    for (let i = 0; i < n; i += 4) {
      const k = (head + i) % n;
      const px = left + i * step, py = y(Math.max(-span, Math.min(span, hist[k])));
      const s = sat[k];
      if (s !== prevSat) {
        if (prevSat !== -1) { ctx.lineTo(px, py); ctx.stroke(); }
        ctx.strokeStyle = s ? C.limit : C.signal; ctx.beginPath(); ctx.moveTo(px, py); prevSat = s;
      } else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible) return;
    const steps = Math.min(50, Math.round(now - last)); // 1 kHz sim in real time, capped after tab switches
    last = now;
    for (let i = 0; i < steps; i++) {
      sim.tick();
      hist[head] = sim.x.th * 57.2958; sat[head] = sim.saturated ? 1 : 0; head = (head + 1) % HIST;
      peakSincePush = Math.max(peakSincePush, Math.abs(sim.x.th) * 57.2958);
    }
    if (sim.fallen) {
      fallTimer += steps;
      say('It fell. Resetting…');
      if (fallTimer > 1500) { sim.reset(); fallTimer = 0; peakSincePush = 0; say('Reset. Push it again.'); }
    } else if (peakSincePush > 0.5) {
      say(`Standing. Largest lean since the last push: ${peakSincePush.toFixed(0)}°.`);
    }
    ctx.clearRect(0, 0, W, H);
    const sceneH = drawScene();
    drawTrace(sceneH);
  }
  requestAnimationFrame(frame);

  // one push shortly after load, so the trace shows a recovery; skipped for reduced motion
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setTimeout(() => push(1), 1200);
}
