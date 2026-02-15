# Phase 5.1 Native Graphs Implementation

## Summary

Implemented `custom:native-graph-card` using Recharts with line/bar/area/pie modes, multi-series configuration, refresh-driven updates, optional zoom/pan (brush), and YAML-compatible schema wiring.

## Added

- `src/features/graphs/types.ts`
- `src/features/graphs/graphService.ts`
- `src/features/graphs/NativeGraphsCard.tsx`
- `src/components/cards/NativeGraphsCardRenderer.tsx`
- `tests/support/dsl/graphs.ts`
- `tests/unit/graph-service.spec.ts`
- `tests/e2e/graphs.spec.ts`
- `tests/e2e/graphs.visual.spec.ts`

## Updated

- `src/components/BaseCard.tsx`
- `src/services/cardRegistry.ts`
- `src/components/PropertiesPanel.tsx`
- `src/schemas/ha-dashboard-schema.json`
- `tests/support/index.ts`
- `package.json`
- `package-lock.json`

## YAML Contract

```yaml
type: custom:native-graph-card
chart_type: line
time_range: 24h
refresh_interval: 30s
x_axis:
  mode: time
y_axis:
  min: auto
  max: auto
zoom_pan: true
series:
  - entity: sensor.living_room_temperature
    label: Temperature
    color: '#4fa3ff'
    axis: left
```
