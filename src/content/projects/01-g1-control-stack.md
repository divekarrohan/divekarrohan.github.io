---
title: An actuator-to-policy control stack for a humanoid
repo: g1-control-stack
weeks: "1–16"
order: 1
status: planned
proves: Control architecture from actuators to an RL policy, on a simulated Unitree G1
headline: "Pending: an RL policy running inside a 1 kHz C++ stack, with and without actuator modeling"
gate: The transfer experiment is published, and every number reruns with one command.
---
Layers, built in order: hardware interface and actuator models (weeks 1–3), a 1 kHz joint servo (4),
state estimation and whole-body balance (5–6), a trained policy running inside the stack and swept against
delay, backlash and sensor noise (7–8), the action-interface experiment (11), policies retrained with the identified
actuator model (12–13), and a supervisor with fallbacks and a safety filter (14).
