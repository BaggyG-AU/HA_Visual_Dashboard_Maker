# Haptic Feedback User Guide

This guide explains how to enable and tune haptic feedback in HA Visual Dashboard Maker.

## Overview

Haptic feedback uses the browser Vibration API to provide tactile response on supported devices.
Haptics are **disabled by default** for accessibility and must be explicitly enabled.

## Global Settings

Open **Settings → Diagnostics → Haptic Feedback** to configure:

- **Enable Haptic Feedback**: Turns haptics on/off globally.
- **Intensity (0–100)**: Scales vibration duration. Lower values feel lighter.
- **Test Pattern**: Preview a pattern before using it.

Supported patterns:

- Light (10ms)
- Medium (25ms)
- Heavy (50ms)
- Double (10ms, pause, 10ms)
- Success (50ms, pause, 25ms)
- Error (25ms, pause, 25ms, pause, 25ms)

## Per-Card Overrides (Button Cards)

Button cards can override the global settings:

- **Enable Haptics**: Per-card opt-in/out.
- **Haptic Pattern**: Override the default pattern based on the card action.
- **Intensity**: Optional override for this card (0–100).

If no per-card pattern is set, the default pattern is derived from the tap action:

- Toggle → Medium
- Navigate / URL / More-info → Light
- Call-service → Success

## Accessibility Notes

- Haptics are opt-in and disabled by default.
- If the device does not support vibration, haptic requests are ignored safely.
- If haptics are enabled but intensity is 0, no vibration occurs.
