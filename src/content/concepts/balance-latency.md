---
title: "Latency and torque limits in a balance loop"
claim: "A standing robot reduced to one joint shows why actuators and latency decide whether a controller works."
week: 0
order: 1
status: live
demo: { type: live, src: balance, alt: "Interactive ankle-torque balance controller with latency and torque-limit controls" }
metrics:
  - { label: "Latency where plain PD loses stability", value: "87–88 ms" }
  - { label: "Latency-aware PD, still stable at", value: "300 ms" }
  - { label: "Control and simulation rate", value: "1 kHz" }
code: https://github.com/divekarrohan/divekarrohan.github.io/blob/main/public/demos/balance-core.js
shows: "An inverted pendulum (35 kg, center of mass 0.7 m above the ankle) balanced by PD control on ankle torque. Commands reach the actuator after an adjustable delay and saturate at an adjustable torque limit. The latency-aware controller predicts the state ahead by the delay through the commands already in flight."
limits: "One joint and a known model: the predictor is exact here, which a real robot never allows. Prediction fixes latency but cannot create torque the actuator does not have."
---
Stability limits were found by bisection on a small push, comparing the oscillation envelope at 2–4 s with 8–10 s,
with the torque limit removed.
