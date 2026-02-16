import type { PresetRecord } from './types';

export const PRESET_MARKETPLACE_SEED: PresetRecord[] = [
  {
    id: 'starter-room-overview',
    title: 'Starter Room Overview',
    description: 'Simple two-card room overview with one light and one temperature sensor.',
    author: 'HAVDM',
    version: '1.0.0',
    tags: ['starter', 'lights', 'sensors'],
    entityIds: ['light.marketplace_lamp', 'sensor.marketplace_temperature'],
    cardCount: 2,
    yaml: `title: Starter Room Overview
views:
  - title: Home
    path: home
    cards:
      - type: button
        name: Main Lamp
        entity: light.marketplace_lamp
      - type: sensor
        name: Room Temperature
        entity: sensor.marketplace_temperature
        graph: line
`,
  },
  {
    id: 'energy-glance-compact',
    title: 'Energy Glance Compact',
    description: 'Compact energy glance layout with power and daily energy totals.',
    author: 'HAVDM',
    version: '1.0.0',
    tags: ['energy', 'glance'],
    entityIds: ['sensor.marketplace_power_now', 'sensor.marketplace_energy_today'],
    cardCount: 2,
    yaml: `title: Energy Glance Compact
views:
  - title: Energy
    path: energy
    cards:
      - type: sensor
        entity: sensor.marketplace_power_now
        name: Power Now
        graph: line
      - type: sensor
        entity: sensor.marketplace_energy_today
        name: Energy Today
`,
  },
];
