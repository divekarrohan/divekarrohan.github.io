// Ankle-torque balance: a standing robot reduced to one joint.
// Point mass m at height l above the ankle; the actuator applies torque tau at the ankle.
// I*th'' = m*g*l*sin(th) - c*th' + tau
export const P = { m: 35, l: 0.7, g: 9.81, c: 2.0, dt: 0.001, fallAngle: 0.6 };
export const I = P.m * P.l * P.l;
const MGL = P.m * P.g * P.l;

// PD gains: closed-loop natural frequency 8 rad/s, damping ratio 0.8 (no delay, no saturation).
const WN = 8, ZETA = 0.8;
export const KP = MGL + I * WN * WN;
export const KD = 2 * ZETA * WN * I - P.c;

const accel = (th, om, tau) => (MGL * Math.sin(th) - P.c * om + tau) / I;
const clamp = (v, lim) => Math.max(-lim, Math.min(lim, v));

function step(s, tau) {
  // semi-implicit Euler at 1 kHz
  const om = s.om + accel(s.th, s.om, tau) * P.dt;
  return { th: s.th + om * P.dt, om };
}

export function createSim({ latencyMs = 5, torqueLimit = 400, predict = false } = {}) {
  const sim = { x: { th: 0, om: 0 }, t: 0, queue: [], latencyMs, torqueLimit, predict, fallen: false, applied: 0, saturated: false };
  sim.reset = () => { sim.x = { th: 0, om: 0 }; sim.queue = []; sim.fallen = false; sim.applied = 0; sim.saturated = false; };
  sim.push = (dOm) => { if (!sim.fallen) sim.x.om += dOm; };

  sim.tick = () => {
    if (sim.fallen) return;
    const d = Math.round(sim.latencyMs / (P.dt * 1000));
    // keep exactly d commands in flight between controller and actuator
    while (sim.queue.length > d) sim.queue.shift();
    while (sim.queue.length < d) sim.queue.unshift(0);
    // controller acts on the measured state, or on the state predicted d steps ahead
    // through the commands already in flight
    let est = sim.x;
    if (sim.predict) for (const u of sim.queue) est = step(est, clamp(u, sim.torqueLimit));
    const cmd = -KP * est.th - KD * est.om;
    sim.queue.push(cmd);
    const u = sim.queue.shift(); // the command issued d steps ago reaches the actuator now
    sim.applied = clamp(u, sim.torqueLimit);
    sim.saturated = Math.abs(u) > sim.torqueLimit;
    sim.x = step(sim.x, sim.applied);
    sim.t += P.dt;
    if (Math.abs(sim.x.th) > P.fallAngle) sim.fallen = true;
  };
  return sim;
}
