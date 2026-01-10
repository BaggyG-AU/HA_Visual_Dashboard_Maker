# UI Sounds User Guide

This guide explains how to enable and configure UI sound effects in HA Visual Dashboard Maker.

## Overview

UI sounds provide audible feedback for common interactions (button taps, success/error, notifications).
Sounds are **disabled by default** for accessibility and must be explicitly enabled.

## Global Settings

Open **Settings → Diagnostics → UI Sounds** to configure:

- **Enable UI Sounds**: Turns sounds on/off globally.
- **Volume (0–100)**: Controls playback volume for all effects.
- **Test Sound**: Preview a specific sound effect.

Available effects:

- Click/Tap
- Success
- Error
- Toggle On
- Toggle Off
- Notification

## Default Sound Mapping

If no per-card override is set, sounds are chosen by action:

- Toggle → Toggle On
- Navigate / URL / More-info → Click/Tap
- Call-service → Success

## Per-Card Overrides (Button Cards)

Button cards can override the global settings:

- **Enable Sounds**: Per-card opt-in/out.
- **Sound Effect**: Override the default effect for this card.
- **Volume**: Optional override (0–100).

## Accessibility Notes

- Sounds are opt-in and disabled by default.
- If audio output is unavailable, sound requests are ignored safely.
- If volume is set to 0, no sound will play.
