import React, { useMemo } from 'react';
import { Button, Divider, Form, Input, InputNumber, Select, Space, Typography } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { TriggerAnimationConfig } from '../types/logic';

const { Text } = Typography;

interface TriggerAnimationControlsProps {
  value?: TriggerAnimationConfig[];
  onChange?: (next: TriggerAnimationConfig[]) => void;
  defaultEntityId?: string | null;
}

const TRIGGER_OPTIONS: Array<{ value: TriggerAnimationConfig['trigger']; label: string }> = [
  { value: 'state-change', label: 'State Change' },
  { value: 'action', label: 'Action' },
  { value: 'manual', label: 'Manual' },
];

const ANIMATION_OPTIONS = [
  { value: 'pulse', label: 'Pulse' },
  { value: 'flash', label: 'Flash' },
  { value: 'shake', label: 'Shake' },
  { value: 'bounce', label: 'Bounce' },
];

const EASING_OPTIONS = [
  { value: 'ease-out', label: 'Ease Out' },
  { value: 'ease', label: 'Ease' },
  { value: 'ease-in', label: 'Ease In' },
  { value: 'ease-in-out', label: 'Ease In Out' },
  { value: 'linear', label: 'Linear' },
];

const toFiniteNumber = (value: unknown): number | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const nextTriggerAnimationId = (entries: TriggerAnimationConfig[]): string => {
  const used = new Set(
    entries
      .map((entry) => entry.id)
      .filter((id): id is string => typeof id === 'string' && id.trim().length > 0),
  );

  let index = entries.length + 1;
  while (used.has(`trigger-animation-${index}`)) {
    index += 1;
  }

  return `trigger-animation-${index}`;
};

const normalize = (entries: TriggerAnimationConfig[] | undefined): TriggerAnimationConfig[] => {
  if (!Array.isArray(entries)) return [];

  return entries.flatMap((entry, index) => {
    if (!isRecord(entry)) return [];

    const trigger = entry.trigger === 'state-change' || entry.trigger === 'action' || entry.trigger === 'manual'
      ? entry.trigger
      : 'state-change';

    const duration = toFiniteNumber(entry.duration_ms);
    const iterations = toFiniteNumber(entry.iterations);

    const normalized: TriggerAnimationConfig = {
      id: typeof entry.id === 'string' && entry.id.trim().length > 0
        ? entry.id
        : `trigger-animation-${index + 1}`,
      trigger,
      animation: typeof entry.animation === 'string' && entry.animation.trim().length > 0
        ? entry.animation
        : 'pulse',
      duration_ms: duration === null ? 320 : Math.max(80, Math.min(5000, Math.round(duration))),
      iterations: iterations === null ? 1 : Math.max(1, Math.min(10, Math.round(iterations))),
      easing: typeof entry.easing === 'string' && entry.easing.trim().length > 0
        ? entry.easing
        : 'ease-out',
    };

    if (typeof entry.target === 'string' && entry.target.trim().length > 0) {
      normalized.target = entry.target.trim();
    }

    return [normalized];
  });
};

export const TriggerAnimationControls: React.FC<TriggerAnimationControlsProps> = ({
  value,
  onChange,
  defaultEntityId,
}) => {
  const items = useMemo(() => normalize(value), [value]);

  const updateAt = (index: number, patch: Partial<TriggerAnimationConfig>) => {
    onChange?.(items.map((entry, entryIndex) => (entryIndex === index ? { ...entry, ...patch } : entry)));
  };

  const removeAt = (index: number) => {
    onChange?.(items.filter((_, entryIndex) => entryIndex !== index));
  };

  const add = () => {
    const next: TriggerAnimationConfig = {
      id: nextTriggerAnimationId(items),
      trigger: 'state-change',
      animation: 'pulse',
      duration_ms: 320,
      iterations: 1,
      easing: 'ease-out',
      ...(defaultEntityId ? { target: defaultEntityId } : {}),
    };
    onChange?.([...items, next]);
  };

  return (
    <div data-testid="trigger-animation-controls">
      <Divider />
      <Text strong style={{ color: 'white' }}>Trigger Animations</Text>
      <Text type="secondary" style={{ display: 'block', marginTop: 4, marginBottom: 10 }}>
        Run bounded animations when card state or interactions trigger.
      </Text>

      <Space direction="vertical" style={{ width: '100%' }}>
        {items.map((entry, index) => (
          <div
            key={entry.id ?? `trigger-animation-${index}`}
            style={{ border: '1px solid #2f2f2f', borderRadius: 8, padding: 10, background: '#121212' }}
            data-testid={`trigger-animation-row-${index}`}
          >
            <Form.Item label={<span style={{ color: 'white' }}>Trigger</span>} style={{ marginBottom: 10 }}>
              <Select
                value={entry.trigger}
                options={TRIGGER_OPTIONS}
                onChange={(nextValue: TriggerAnimationConfig['trigger']) => updateAt(index, { trigger: nextValue })}
                data-testid={`trigger-animation-trigger-${index}`}
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: 'white' }}>Target Entity (optional)</span>}
              style={{ marginBottom: 10 }}
              help={<span style={{ color: '#666' }}>Defaults to card entity when left empty.</span>}
            >
              <Input
                value={entry.target}
                placeholder="light.living_room"
                onChange={(event) => {
                  const next = event.target.value.trim();
                  updateAt(index, { target: next.length > 0 ? next : undefined });
                }}
                data-testid={`trigger-animation-target-${index}`}
              />
            </Form.Item>

            <Form.Item label={<span style={{ color: 'white' }}>Animation</span>} style={{ marginBottom: 10 }}>
              <Select
                value={entry.animation}
                options={ANIMATION_OPTIONS}
                onChange={(nextValue: string) => updateAt(index, { animation: nextValue })}
                data-testid={`trigger-animation-name-${index}`}
              />
            </Form.Item>

            <Space size={10} style={{ width: '100%', display: 'flex', marginBottom: 10 }}>
              <Form.Item label={<span style={{ color: 'white' }}>Duration (ms)</span>} style={{ flex: 1, marginBottom: 0 }}>
                <InputNumber
                  value={typeof entry.duration_ms === 'number' ? entry.duration_ms : 320}
                  min={80}
                  max={5000}
                  style={{ width: '100%' }}
                  onChange={(next) => updateAt(index, { duration_ms: typeof next === 'number' ? next : 320 })}
                  data-testid={`trigger-animation-duration-${index}`}
                />
              </Form.Item>

              <Form.Item label={<span style={{ color: 'white' }}>Iterations</span>} style={{ flex: 1, marginBottom: 0 }}>
                <InputNumber
                  value={typeof entry.iterations === 'number' ? entry.iterations : 1}
                  min={1}
                  max={10}
                  style={{ width: '100%' }}
                  onChange={(next) => updateAt(index, { iterations: typeof next === 'number' ? next : 1 })}
                  data-testid={`trigger-animation-iterations-${index}`}
                />
              </Form.Item>
            </Space>

            <Form.Item label={<span style={{ color: 'white' }}>Easing</span>} style={{ marginBottom: 10 }}>
              <Select
                value={entry.easing}
                options={EASING_OPTIONS}
                onChange={(nextValue: string) => updateAt(index, { easing: nextValue })}
                data-testid={`trigger-animation-easing-${index}`}
              />
            </Form.Item>

            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => removeAt(index)}
              data-testid={`trigger-animation-remove-${index}`}
            >
              Remove Trigger Animation
            </Button>
          </div>
        ))}
      </Space>

      <Button
        icon={<PlusOutlined />}
        onClick={add}
        style={{ marginTop: 10 }}
        data-testid="trigger-animation-add"
      >
        Add Trigger Animation
      </Button>
    </div>
  );
};

export default TriggerAnimationControls;
