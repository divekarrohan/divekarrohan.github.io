---
title: "Hardware interface and loop timing"
claim: "A fixed-rate 1 kHz control loop talks to the robot through a bus with real latency, jitter and dropped packets."
week: 1
order: 1
status: planned
demo: { type: plot, alt: "Loop-timing histogram for the 1 kHz loop" }
shows: "How evenly a non-real-time Linux loop actually runs, and what the bus does to commands."
limits: "Simulated bus; jitter on a real robot also comes from drivers and firmware."
---
