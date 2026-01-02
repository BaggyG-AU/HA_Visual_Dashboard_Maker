import { Entity } from "../../../src/services/dashboardGeneratorService";

export const sampleEntities: Entity[] = [
  {
    entity_id: "light.living_room",
    state: "on",
    attributes: { friendly_name: "Living Room Light" },
  },
  {
    entity_id: "light.kitchen",
    state: "off",
    attributes: { friendly_name: "Kitchen Light" },
  },
  {
    entity_id: "camera.front",
    state: "streaming",
    attributes: { friendly_name: "Front Camera" },
  },
  {
    entity_id: "sensor.power_main",
    state: "1200",
    attributes: { friendly_name: "Main Power", device_class: "power", unit_of_measurement: "W" },
  },
  {
    entity_id: "sensor.battery_storage",
    state: "80",
    attributes: { friendly_name: "Battery Storage", device_class: "battery", unit_of_measurement: "%" },
  },
  {
    entity_id: "sensor.humidity_office",
    state: "45",
    attributes: { friendly_name: "Office Humidity", device_class: "humidity", unit_of_measurement: "%" },
  },
  {
    entity_id: "sensor.temp_office",
    state: "22.1",
    attributes: { friendly_name: "Office Temp", device_class: "temperature", unit_of_measurement: "°C" },
  },
  {
    entity_id: "climate.lounge",
    state: "heat",
    attributes: { friendly_name: "Lounge Climate" },
  },
  {
    entity_id: "media_player.tv",
    state: "idle",
    attributes: { friendly_name: "Living Room TV" },
  },
  {
    entity_id: "device_tracker.phone",
    state: "home",
    attributes: { friendly_name: "Phone Tracker" },
  },
  {
    entity_id: "person.alex",
    state: "home",
    attributes: { friendly_name: "Alex" },
  },
  {
    entity_id: "cover.garage",
    state: "closed",
    attributes: { friendly_name: "Garage Door" },
  },
  {
    entity_id: "lock.front_door",
    state: "locked",
    attributes: { friendly_name: "Front Door Lock" },
  },
  {
    entity_id: "binary_sensor.front_door",
    state: "off",
    attributes: { friendly_name: "Front Door Sensor", device_class: "door" },
  },
  {
    entity_id: "switch.office_fan",
    state: "off",
    attributes: { friendly_name: "Office Fan" },
  },
];

export function withExtraLights(count: number): Entity[] {
  const extra = Array.from({ length: count }).map((_, idx) => ({
    entity_id: `light.extra_${idx}`,
    state: "off",
    attributes: { friendly_name: `Extra Light ${idx}` },
  }));
  return [...sampleEntities, ...extra];
}

