# Dashboard Templates

This directory contains pre-built dashboard templates for common Home Assistant use cases. These templates provide quick-start configurations that can be customized to match your specific setup.

## Available Templates

### 1. Home Overview (`home-overview.yaml`)
**Difficulty:** Beginner
**Category:** Overview

A comprehensive main dashboard showing at-a-glance status of your entire home.

**Features:**
- Weather forecast
- Person/presence tracking
- Quick action scenes (Good Morning, Good Night, Away, Home)
- Status summaries (lights on, doors open, etc.)
- Energy usage overview
- Security system status
- Upcoming calendar events

**Required Entities:**
- `weather.forecast_home`
- `person.john`, `person.jane`
- `sensor.lights_on_count`
- `alarm_control_panel.home`

---

### 2. Energy Management (`energy-management.yaml`)
**Difficulty:** Intermediate
**Category:** Utility

Monitor and optimize energy consumption, solar production, and costs.

**Features:**
- Power flow visualization (grid, solar, home, battery)
- Real-time power consumption gauges
- Solar production tracking
- Individual device consumption breakdown
- Cost tracking and projections
- Historical energy trends (24h, weekly, monthly)

**Required Entities:**
- `sensor.grid_power`
- `sensor.solar_power` (optional for non-solar setups)
- `sensor.home_power`
- `sensor.current_power_usage`

---

### 3. Security & Surveillance (`security-surveillance.yaml`)
**Difficulty:** Intermediate
**Category:** Security

Complete security monitoring with cameras, locks, alarms, and sensors.

**Features:**
- Alarm panel control (arm/disarm)
- Live camera feeds (front, back, garage, backyard)
- Door lock management
- Motion sensor status
- Window sensor monitoring
- Security event history (24 hours)

**Required Entities:**
- `alarm_control_panel.home`
- `camera.front_door`, `camera.back_door`, etc.
- `lock.front_door`, `lock.back_door`
- `binary_sensor.front_door_motion`

---

### 4. Climate & HVAC (`climate-hvac.yaml`)
**Difficulty:** Intermediate
**Category:** Climate

Control heating, cooling, and monitor climate conditions throughout your home.

**Features:**
- Multi-zone thermostat controls
- Room-by-room temperature monitoring
- Humidity tracking
- HVAC system status and action
- Energy usage tracking
- Temperature trend graphs
- Automation controls (eco mode, away mode)

**Required Entities:**
- `climate.living_room_thermostat`
- `sensor.living_room_temperature`
- `sensor.living_room_humidity`
- `sensor.hvac_action`

---

### 5. Lighting Control (`lighting-control.yaml`)
**Difficulty:** Beginner
**Category:** Lighting

Master control panel for all lights with scenes, groups, and automation.

**Features:**
- Quick scene buttons (Bright, Dim, Movie, Dinner, Reading, All Off)
- Room-based light controls
- Brightness and color controls
- Light group management
- Energy monitoring for lighting
- Automation toggles (circadian lighting, motion activated)

**Required Entities:**
- `light.living_room_ceiling`
- `scene.bright`, `scene.dim`, etc.
- `sensor.lights_on_count`

---

### 6. Living Room (`living-room.yaml`)
**Difficulty:** Beginner
**Category:** Rooms

Comprehensive room dashboard with all living room devices and controls.

**Features:**
- All room lights with individual control
- Thermostat and climate monitoring
- Media player controls
- Window blind controls
- Room-specific scenes
- Motion and window sensors
- Energy usage tracking

**Required Entities:**
- `light.living_room_ceiling`
- `climate.living_room_thermostat`
- `media_player.living_room_tv`
- `cover.living_room_blinds_left`

---

### 7. Media & Entertainment (`media-entertainment.yaml`)
**Difficulty:** Beginner
**Category:** Media

Control all media players, TVs, speakers, and streaming devices.

**Features:**
- Media player controls for each room
- Whole home audio grouping
- Streaming service integration (Spotify, Plex, etc.)
- Activity scenes (Movie Night, Gaming, Music Party)
- Remote control management
- AV equipment power controls

**Required Entities:**
- `media_player.living_room_tv`
- `media_player.living_room_soundbar`
- `media_player.spotify`

---

## Using Templates

### Method 1: Template Service (Programmatic)

```typescript
import { templateService } from '../services/templateService';

// Get all templates
const templates = await templateService.getTemplates();

// Load a specific template
const yaml = await templateService.loadTemplate('home-overview');

// Get recommended templates based on user's entities
const userEntities = ['light.living_room', 'climate.bedroom'];
const recommendations = await templateService.getRecommendations(userEntities);
```

### Method 2: Direct File Loading

Templates are standard Home Assistant YAML files that can be:
1. Loaded directly into the application
2. Copied and customized
3. Used as reference for creating custom dashboards

## Template Structure

Each template follows the Home Assistant dashboard YAML format:

```yaml
title: Dashboard Name
views:
  - title: View Name
    path: view_path
    type: custom:grid-layout
    layout:
      grid_template_columns: repeat(12, 1fr)
      grid_template_rows: repeat(auto-fill, 56px)
      grid_gap: 8px
    cards:
      # Card configurations...
```

## Customizing Templates

1. **Replace Entity IDs**: Update entity IDs to match your Home Assistant setup
2. **Adjust Layout**: Modify `grid_column` and `grid_row` values to change card positions
3. **Add/Remove Cards**: Customize which cards are displayed
4. **Modify Scenes**: Update scene names and actions
5. **Change Colors**: Adjust card colors and themes

## Template Metadata

The `templates.json` file contains metadata for all templates:

- **id**: Unique template identifier
- **name**: Display name
- **description**: Template description
- **category**: Template category
- **difficulty**: Beginner, Intermediate, or Advanced
- **features**: List of key features
- **requiredEntities**: Entities needed for the template to work
- **tags**: Searchable tags

## Creating New Templates

To add a new template:

1. Create a new YAML file in this directory
2. Follow the standard HA dashboard format
3. Add metadata entry to `templates.json`
4. Include required entities list
5. Tag appropriately for searchability

## Categories

- **Overview**: Main dashboards showing overall home status
- **Utility**: Energy, water, and resource monitoring
- **Security**: Security systems, cameras, and monitoring
- **Climate**: Temperature, humidity, and HVAC control
- **Lighting**: Light control and scenes
- **Rooms**: Room-specific comprehensive controls
- **Media**: Entertainment and media control

## Entity Naming Conventions

For best compatibility, follow these naming patterns:

- **Lights**: `light.{room}_{fixture}`
- **Sensors**: `sensor.{room}_{type}`
- **Switches**: `switch.{device}`
- **Cameras**: `camera.{location}`
- **Climate**: `climate.{room}_thermostat`
- **Media**: `media_player.{room}_{device}`
- **Covers**: `cover.{room}_{type}`
- **Binary Sensors**: `binary_sensor.{location}_{type}`

## Best Practices

1. **Start Simple**: Begin with beginner templates and customize
2. **Test First**: Load template in a test view before deploying
3. **Check Entities**: Verify all required entities exist in your setup
4. **Backup**: Save your current dashboard before applying templates
5. **Customize**: Adapt templates to your specific needs
6. **Mobile-Friendly**: Test on mobile devices after customization
7. **Performance**: Limit number of camera feeds on resource-constrained devices

## Support & Resources

- [Home Assistant Dashboard Documentation](https://www.home-assistant.io/dashboards/)
- [Lovelace UI](https://www.home-assistant.io/lovelace/)
- [Card Types](https://www.home-assistant.io/dashboards/cards/)
- [Custom Cards (HACS)](https://hacs.xyz/)

## License

These templates are provided as examples and can be freely modified and distributed.
