import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Form, Input, Button, Space, Typography, Divider, Select, Alert, Tabs, message, Tooltip, Switch, InputNumber } from 'antd';
import { UndoOutlined, FormatPainterOutlined, DatabaseOutlined } from '@ant-design/icons';
import * as monaco from 'monaco-editor';
import * as yaml from 'js-yaml';
import { Card } from '../types/dashboard';
import { cardRegistry } from '../services/cardRegistry';
import { EntitySelect } from './EntitySelect';
import { EntityMultiSelect } from './EntityMultiSelect';
import { IconSelect } from './IconSelect';
import { ColorPickerInput } from './ColorPickerInput';
import { BackgroundCustomizer } from './BackgroundCustomizer';
import { haConnectionService } from '../services/haConnectionService';
import { createDebouncedCommit, DebouncedCommit } from '../utils/debouncedCommit';
import { extractStyleColor, upsertStyleColor } from '../utils/styleBackground';
import { applyBackgroundConfigToStyle, DEFAULT_BACKGROUND_CONFIG, parseBackgroundConfig, type BackgroundConfig } from '../utils/backgroundStyle';
import { formatActionLabel, resolveTapAction } from '../services/smartActions';
import { logger } from '../services/logger';
import { useHAEntities } from '../contexts/HAEntityContext';
import { getMissingEntityReferences, hasEntityContextVariables, resolveEntityContext } from '../services/entityContext';
import { AttributeDisplayControls } from './AttributeDisplayControls';
import { ConditionalVisibilityControls } from './ConditionalVisibilityControls';
import { StateIconMappingControls } from './StateIconMappingControls';
import type { AttributeDisplayLayout } from '../types/attributeDisplay';
import { MultiEntityControls } from './MultiEntityControls';
import type { AggregateFunction, BatchActionType, MultiEntityMode } from '../types/multiEntity';

const { Title, Text } = Typography;

type MonacoTestWindow = Window & {
  __monacoEditor?: monaco.editor.IStandaloneCodeEditor;
  __monacoModel?: monaco.editor.ITextModel | null;
};

type FormCardValues = Record<string, unknown> & { entities?: unknown };

interface PropertiesPanelProps {
  card: Card | null;
  cardIndex: number | null;
  onChange: (updatedCard: Card) => void;
  onCommit: (updatedCard: Card) => void;
  onCancel: () => void;
  onOpenEntityBrowser?: (insertCallback: (entityId: string) => void) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  card,
  cardIndex,
  onChange,
  onCommit,
  onCancel: _onCancel,
  onOpenEntityBrowser,
}) => {
  void _onCancel;
  const [form] = Form.useForm();
  const [streamComponentEnabled, setStreamComponentEnabled] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<string>('form');
  const [yamlContent, setYamlContent] = useState<string>('');
  const [yamlError, setYamlError] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<Card[]>([]);
  const [backgroundConfig, setBackgroundConfig] = useState<BackgroundConfig>(DEFAULT_BACKGROUND_CONFIG);
  const isUpdatingFromForm = useRef(false);
  const isUpdatingFromYaml = useRef(false);
  const debouncedCommitRef = useRef<DebouncedCommit<Card> | null>(null);
  const yamlSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const yamlParseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCommittedCardRef = useRef<Card | null>(null);
  const lastStyleValueRef = useRef<string>('');
  const skipStyleSyncRef = useRef(false);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const { entities } = useHAEntities();

  const COMMIT_DEBOUNCE_MS = 800;
  const YAML_SYNC_DEBOUNCE_MS = 250;
  const YAML_PARSE_DEBOUNCE_MS = 350;
  const HAPTIC_PATTERN_OPTIONS = [
    { value: 'light', label: 'Light' },
    { value: 'medium', label: 'Medium' },
    { value: 'heavy', label: 'Heavy' },
    { value: 'double', label: 'Double' },
    { value: 'success', label: 'Success' },
    { value: 'error', label: 'Error' },
  ];

  const renderHapticConfig = (testIdPrefix: string) => (
    <div>
      <Divider />
      <Text strong style={{ color: 'white' }}>Haptic Feedback</Text>
      <Form.Item
        label={<span style={{ color: 'white' }}>Enable Haptics</span>}
        name={['haptic', 'enabled']}
        valuePropName="checked"
      >
        <Switch data-testid={`${testIdPrefix}-haptic-toggle`} />
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) => prev.haptic?.enabled !== curr.haptic?.enabled}
      >
        {() => {
          const enabled = Boolean(form.getFieldValue(['haptic', 'enabled']));
          return (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Haptic Pattern</span>}
                name={['haptic', 'pattern']}
              >
                <Select
                  placeholder="Use default pattern"
                  options={HAPTIC_PATTERN_OPTIONS}
                  disabled={!enabled}
                  data-testid={`${testIdPrefix}-haptic-pattern`}
                />
              </Form.Item>
              <Form.Item
                label={<span style={{ color: 'white' }}>Intensity</span>}
                name={['haptic', 'intensity']}
                help={<span style={{ color: '#666' }}>Override global intensity (0-100)</span>}
              >
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width: '100%' }}
                  disabled={!enabled}
                  data-testid={`${testIdPrefix}-haptic-intensity`}
                />
              </Form.Item>
            </>
          );
        }}
      </Form.Item>
    </div>
  );

  const SOUND_EFFECT_OPTIONS = [
    { value: 'click', label: 'Click/Tap' },
    { value: 'success', label: 'Success' },
    { value: 'error', label: 'Error' },
    { value: 'toggle-on', label: 'Toggle On' },
    { value: 'toggle-off', label: 'Toggle Off' },
    { value: 'notification', label: 'Notification' },
  ];

  const renderSoundConfig = (testIdPrefix: string) => (
    <div>
      <Divider />
      <Text strong style={{ color: 'white' }}>UI Sounds</Text>
      <Form.Item
        label={<span style={{ color: 'white' }}>Enable Sounds</span>}
        name={['sound', 'enabled']}
        valuePropName="checked"
      >
        <Switch data-testid={`${testIdPrefix}-sound-toggle`} />
      </Form.Item>
      <Form.Item
        noStyle
        shouldUpdate={(prev, curr) => prev.sound?.enabled !== curr.sound?.enabled}
      >
        {() => {
          const enabled = Boolean(form.getFieldValue(['sound', 'enabled']));
          return (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Sound Effect</span>}
                name={['sound', 'effect']}
              >
                <Select
                  placeholder="Use default effect"
                  options={SOUND_EFFECT_OPTIONS}
                  disabled={!enabled}
                  data-testid={`${testIdPrefix}-sound-effect`}
                />
              </Form.Item>
              <Form.Item
                label={<span style={{ color: 'white' }}>Volume</span>}
                name={['sound', 'volume']}
                help={<span style={{ color: '#666' }}>Override global volume (0-100)</span>}
              >
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width: '100%' }}
                  disabled={!enabled}
                  data-testid={`${testIdPrefix}-sound-volume`}
                />
              </Form.Item>
            </>
          );
        }}
      </Form.Item>
    </div>
  );

  const resolveContextValue = useCallback(
    (template: string, defaultEntityId: string | null) => resolveEntityContext(template, defaultEntityId, entities),
    [entities],
  );

  const renderAttributeDisplaySection = (values: FormCardValues) => {
    if (!card) return null;

    const entityField = typeof values.entity === 'string' ? values.entity : undefined;
    const entitiesField = Array.isArray(values.entities) ? values.entities : undefined;
    const firstEntityValue = entitiesField
      ? (typeof entitiesField[0] === 'string'
        ? entitiesField[0]
        : (typeof entitiesField[0] === 'object' && entitiesField[0] !== null && 'entity' in entitiesField[0]
          ? (entitiesField[0] as { entity?: unknown }).entity
          : undefined))
      : undefined;
    const firstEntity = typeof firstEntityValue === 'string' ? firstEntityValue : undefined;
    const availableEntityIds = Object.keys(entities || {});
    const fallbackEntityId = availableEntityIds.length > 0 ? availableEntityIds[0] : null;
    const entityId = entityField ?? card.entity ?? firstEntity ?? fallbackEntityId;

    const hasEntityConfig = Boolean(entityField || firstEntity || card.entity);
    if (!hasEntityConfig) {
      return null;
    }

    const layout = (values.attribute_display_layout as AttributeDisplayLayout) ?? 'stacked';

    return (
      <>
        <Form.Item name="attribute_display_layout" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="attribute_display">
          <AttributeDisplayControls
            entityId={entityId}
            layout={layout}
            onLayoutChange={(next) => form.setFieldsValue({ attribute_display_layout: next })}
          />
        </Form.Item>
      </>
    );
  };

  const renderContextPreviewSection = (values: FormCardValues) => {
    if (!card) return null;

    const entityField = typeof values.entity === 'string' ? values.entity : undefined;
    const entitiesField = Array.isArray(values.entities) ? values.entities : undefined;
    const firstEntityValue = entitiesField
      ? (typeof entitiesField[0] === 'string'
        ? entitiesField[0]
        : (typeof entitiesField[0] === 'object' && entitiesField[0] !== null && 'entity' in entitiesField[0]
          ? (entitiesField[0] as { entity?: unknown }).entity
          : undefined))
      : undefined;
    const firstEntity = typeof firstEntityValue === 'string' ? firstEntityValue : undefined;
    const availableEntityIds = Object.keys(entities || {});
    const fallbackEntityId = availableEntityIds.length > 0 ? availableEntityIds[0] : null;
    const defaultEntityId = entityField ?? card.entity ?? firstEntity ?? fallbackEntityId;

    const candidates = [
      { key: 'name', label: 'Name', template: typeof values.name === 'string' ? values.name : undefined },
      { key: 'title', label: 'Title', template: typeof values.title === 'string' ? values.title : undefined },
      { key: 'content', label: 'Content', template: typeof values.content === 'string' ? values.content : undefined },
    ];

    const entries = candidates
      .filter((entry) => entry.template && hasEntityContextVariables(entry.template))
      .map((entry) => {
        const template = entry.template as string;
        return {
          ...entry,
          resolved: resolveContextValue(template, defaultEntityId),
          missing: getMissingEntityReferences(template, defaultEntityId, entities),
        };
      });

    if (entries.length === 0) return null;

    return (
      <div style={{ marginTop: '16px' }} data-testid="entity-context-preview-section">
        <Divider />
        <Text strong style={{ color: 'white' }}>Entity Context Preview</Text>
        <Text type="secondary" style={{ display: 'block', fontSize: '12px', marginTop: '4px' }}>
          Use variables like <Text code>[[entity.state]]</Text> or <Text code>[[entity.attributes.battery]]</Text>.
        </Text>
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {entries.map((entry) => (
            <div key={entry.key} data-testid={`entity-context-preview-${entry.key}`}>
              <Text strong style={{ color: '#e6e6e6', fontSize: '12px' }}>{entry.label}</Text>
              <div style={{ marginTop: '4px', padding: '8px', backgroundColor: '#111', borderRadius: '6px' }}>
                <Text style={{ color: '#b7eb8f', fontSize: '12px' }}>{entry.resolved || ' '}</Text>
              </div>
              {entry.missing.length > 0 && (
                <Alert
                  type="warning"
                  showIcon
                  style={{ marginTop: '6px' }}
                  message={`Missing entities: ${entry.missing.join(', ')}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderConditionalVisibilitySection = (values: FormCardValues) => {
    if (!card) return null;

    const supportsVisibility =
      typeof values.entity === 'string'
      || Array.isArray(values.entities)
      || typeof card.entity === 'string'
      || Array.isArray(card.entities);

    if (!supportsVisibility) {
      return null;
    }

    return (
      <Form.Item name="visibility_conditions">
        <ConditionalVisibilityControls />
      </Form.Item>
    );
  };

  const renderStateIconMappingSection = (values: FormCardValues) => {
    if (!card) return null;

    const supportsStateIcons =
      typeof values.entity === 'string'
      || Array.isArray(values.entities)
      || typeof card.entity === 'string'
      || Array.isArray(card.entities);

    if (!supportsStateIcons) {
      return null;
    }

    const entityField = typeof values.entity === 'string' ? values.entity : undefined;
    const entitiesField = Array.isArray(values.entities) ? values.entities : undefined;
    const firstEntityValue = entitiesField
      ? (typeof entitiesField[0] === 'string'
        ? entitiesField[0]
        : (typeof entitiesField[0] === 'object' && entitiesField[0] !== null && 'entity' in entitiesField[0]
          ? (entitiesField[0] as { entity?: unknown }).entity
          : undefined))
      : undefined;
    const firstEntity = typeof firstEntityValue === 'string' ? firstEntityValue : undefined;
    const entityId = entityField ?? card.entity ?? firstEntity ?? null;

    return (
      <Form.Item name="state_icons">
        <StateIconMappingControls entityId={entityId} />
      </Form.Item>
    );
  };

  const renderMultiEntitySection = (values: FormCardValues) => {
    if (!card) return null;
    const supportsMultiEntity = card.type === 'button' || card.type === 'custom:button-card';
    if (!supportsMultiEntity) return null;

    const entitiesField = Array.isArray(values.entities)
      ? values.entities.filter((entry): entry is string => typeof entry === 'string')
      : [];
    const mode = (values.multi_entity_mode as MultiEntityMode | undefined) ?? card.multi_entity_mode ?? 'individual';
    const aggregateFunction = (values.aggregate_function as AggregateFunction | undefined)
      ?? card.aggregate_function
      ?? 'count_on';
    const batchActions = (Array.isArray(values.batch_actions) ? values.batch_actions : card.batch_actions)
      ?.map((entry) => {
        if (typeof entry === 'string') return entry;
        if (entry && typeof entry === 'object' && 'type' in entry) {
          const type = (entry as { type?: unknown }).type;
          return typeof type === 'string' ? type : undefined;
        }
        return undefined;
      })
      .filter((entry): entry is BatchActionType => typeof entry === 'string');

    return (
      <>
        <Form.Item name="multi_entity_mode" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="aggregate_function" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="batch_actions" hidden>
          <Select mode="multiple" options={[]} />
        </Form.Item>
        <Form.Item name="entities">
          <MultiEntityControls
            value={entitiesField}
            mode={mode}
            aggregateFunction={aggregateFunction}
            batchActions={batchActions}
            onChange={(nextEntities) => {
              const nextValues: Record<string, unknown> = { entities: nextEntities };
              if (nextEntities.length > 0 && !form.getFieldValue('entity')) {
                nextValues.entity = nextEntities[0];
              }
              form.setFieldsValue(nextValues);
            }}
            onModeChange={(nextMode) => form.setFieldsValue({ multi_entity_mode: nextMode })}
            onAggregateFunctionChange={(nextFunction) => form.setFieldsValue({ aggregate_function: nextFunction })}
            onBatchActionsChange={(nextActions) => form.setFieldsValue({ batch_actions: nextActions })}
          />
        </Form.Item>
      </>
    );
  };

  const renderSmartDefaultsConfig = (testIdPrefix: string) => {
    if (!card) return null;

    return (
      <div>
        <Divider />
        <Text strong style={{ color: 'white' }}>Smart Default Actions</Text>
        <Form.Item
          label={
            <Tooltip title="When enabled, tap_action is computed automatically based on the entity domain unless you define tap_action explicitly.">
              <span style={{ color: 'white' }}>Use Smart Defaults</span>
            </Tooltip>
          }
          name="smart_defaults"
          valuePropName="checked"
        >
          <Switch data-testid={`${testIdPrefix}-smart-defaults-toggle`} />
        </Form.Item>

        <Form.Item noStyle shouldUpdate>
          {() => {
            const currentEntity = form.getFieldValue('entity') as string | undefined;
            const smartDefaults = form.getFieldValue('smart_defaults') as boolean | undefined;
            const tapAction = form.getFieldValue('tap_action');

            const { action, source } = resolveTapAction({
              ...card,
              entity: currentEntity,
              smart_defaults: smartDefaults,
              tap_action: tapAction,
            });

            const sourceLabel =
              source === 'user'
                ? 'User-defined'
                : source === 'smart'
                  ? 'Smart default'
                  : source === 'legacy'
                    ? 'Legacy default'
                    : 'None';

            return (
              <div
                style={{
                  padding: '8px 10px',
                  background: '#141414',
                  border: '1px solid #2a2a2a',
                  borderRadius: 6,
                }}
                data-testid={`${testIdPrefix}-smart-defaults-preview`}
              >
                <Text style={{ color: '#bbb', fontSize: 12 }}>
                  Tap action used: <Text style={{ color: '#fff' }}>{formatActionLabel(action)}</Text>{' '}
                  <Text style={{ color: '#666' }}>({sourceLabel})</Text>
                </Text>
              </div>
            );
          }}
        </Form.Item>
      </div>
    );
  };

  // Helper function to normalize entities for form display
  const normalizeCardForForm = (card: Card): FormCardValues => {
    const normalized: FormCardValues = { ...(card as Record<string, unknown>) };

    // Handle entities field - can be array, object, or missing
    if (normalized.entities) {
      // Case 1: Array of entities (most common for simple cards)
      if (Array.isArray(normalized.entities)) {
        normalized.entities = normalized.entities
          .map((entity: unknown) => {
          // If it's an object with an entity property, extract the entity ID
            if (typeof entity === 'object' && entity !== null && 'entity' in entity) {
              const entityId = (entity as { entity?: unknown }).entity;
              return typeof entityId === 'string' ? entityId : entity;
            }
          // If it's already a string, keep it
          return entity;
          })
          .filter((e): e is string => typeof e === 'string'); // Remove any non-strings
      }
      // Case 2: Object (complex cards like power-flow-card-plus)
      // Don't try to normalize - leave as-is for YAML editor
      else if (typeof normalized.entities === 'object') {
        // Keep the complex object structure intact
        // The form won't show EntityMultiSelect for these
      }
    }

    // Normalize icon color mode for form selection when stored on the card
    const hasStateColors = typeof (normalized as { icon_color_states?: unknown }).icon_color_states === 'object';
    if (!(normalized as { icon_color_mode?: unknown }).icon_color_mode) {
      if ((normalized as { icon_color_attribute?: unknown }).icon_color_attribute) {
        (normalized as { icon_color_mode?: unknown }).icon_color_mode = 'attribute';
      } else if (hasStateColors) {
        (normalized as { icon_color_mode?: unknown }).icon_color_mode = 'state';
      } else if ((normalized as { icon_color?: unknown }).icon_color) {
        (normalized as { icon_color_mode?: unknown }).icon_color_mode = 'custom';
      } else {
        (normalized as { icon_color_mode?: unknown }).icon_color_mode = 'default';
      }
    }

    if (card.type === 'custom:swiper-card') {
      const hasSlides = Array.isArray((normalized as { slides?: unknown }).slides);
      const cards = (normalized as { cards?: unknown }).cards;
      if (!hasSlides && Array.isArray(cards)) {
        (normalized as { slides?: unknown }).slides = cards.map((child: unknown) => ({
          cards: child ? [child] : [],
          alignment: 'center',
          allow_navigation: true,
        }));
      } else if (hasSlides) {
        const slides = (normalized as { slides?: unknown }).slides as Array<Record<string, unknown>>;
        (normalized as { slides?: unknown }).slides = slides.map((slide) => ({
          alignment: slide.alignment ?? 'center',
          allow_navigation: slide.allow_navigation ?? true,
          ...slide,
        }));
      }
    }

    return normalized;
  };

  // Convert card to YAML string
  const cardToYaml = (card: Card): string => {
    try {
      return yaml.dump(card, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
        sortKeys: false,
      });
    } catch (error) {
      logger.error('Error converting card to YAML', error);
      return '';
    }
  };

  // Parse YAML string to card object
  const yamlToCard = (yamlStr: string): Card | null => {
    try {
      const parsed = yaml.load(yamlStr) as Card;
      setYamlError(null);
      return parsed;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid YAML';
      setYamlError(errorMessage);
      return null;
    }
  };

  // Format YAML (prettify)
  const formatYaml = () => {
    if (!card) return;
    const formatted = cardToYaml(card);
    setYamlContent(formatted);
    message.success('YAML formatted');
  };

  // Undo last change
  const handleUndo = () => {
    if (undoStack.length === 0) {
      message.info('Nothing to undo');
      return;
    }

    const previousCard = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));

    // Update form and YAML
    form.setFieldsValue(normalizeCardForForm(previousCard));
    setYamlContent(cardToYaml(previousCard));

    // Apply immediately and commit (explicit user action)
    onChange(previousCard);
    onCommit(previousCard);
    lastCommittedCardRef.current = previousCard;
    message.success('Undo successful');
  };

  // Save current state to undo stack
  const saveToUndoStack = (currentCard: Card) => {
    setUndoStack(prev => [...prev, { ...currentCard }].slice(-10)); // Keep last 10 states
  };

  // Check if stream component is enabled when component mounts
  useEffect(() => {
    const checkStreamComponent = async () => {
      if (haConnectionService.isConnected()) {
        const isEnabled = await haConnectionService.isStreamComponentEnabled();
        setStreamComponentEnabled(isEnabled);
      } else {
        setStreamComponentEnabled(null);
      }
    };

    checkStreamComponent();
  }, []);

  // Create Monaco editor when container is ready and YAML tab is active.
  // Uses a bounded RAF retry loop because tab content mount can lag behind tab selection.
  useEffect(() => {
    if (activeTab !== 'yaml') {
      return;
    }

    let rafId: number | null = null;
    let attempts = 0;
    const MAX_ATTEMPTS = 120; // ~2s at 60fps

    const createEditor = (container: HTMLDivElement) => {
      const editor = monaco.editor.create(container, {
        value: yamlContent,
        language: 'yaml',
        theme: 'vs-dark',
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 13,
        lineNumbers: 'on',
        wordWrap: 'on',
        automaticLayout: true,
        tabSize: 2,
        insertSpaces: true,
      });

      monacoEditorRef.current = editor;

      if (typeof window !== 'undefined') {
        const testWindow = window as MonacoTestWindow;
        testWindow.__monacoEditor = editor;
        testWindow.__monacoModel = editor.getModel();
      }

      editor.onDidChangeModelContent(() => {
        const value = editor.getValue();
        handleYamlChange(value);
      });
    };

    const ensureEditorReady = () => {
      const container = editorContainerRef.current;
      const existingEditor = monacoEditorRef.current;

      if (!container) {
        attempts += 1;
        if (attempts <= MAX_ATTEMPTS) {
          rafId = window.requestAnimationFrame(ensureEditorReady);
        }
        return;
      }

      if (existingEditor) {
        const domNode = existingEditor.getContainerDomNode?.();
        if (domNode?.isConnected) {
          existingEditor.layout();
          return;
        }

        existingEditor.dispose();
        monacoEditorRef.current = null;
      }

      createEditor(container);
    };

    ensureEditorReady();

    // Cleanup when switching away from YAML tab
    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      if (monacoEditorRef.current) {
        monacoEditorRef.current.dispose();
        monacoEditorRef.current = null;
        // Clean up global references
        if (typeof window !== 'undefined') {
          const testWindow = window as MonacoTestWindow;
          delete testWindow.__monacoEditor;
          delete testWindow.__monacoModel;
        }
      }
    };
  }, [activeTab]); // Re-check lifecycle when entering YAML

  // Update Monaco editor value when yamlContent changes externally (e.g., card selection)
  // but DON'T recreate the entire editor
  useEffect(() => {
    if (monacoEditorRef.current && activeTab === 'yaml') {
      const currentValue = monacoEditorRef.current.getValue();
      if (currentValue !== yamlContent) {
        monacoEditorRef.current.setValue(yamlContent);
      }
    }
  }, [yamlContent, activeTab]);

  // Reset form and YAML when card SELECTION changes (different card index selected).
  // IMPORTANT: Only depend on cardIndex, NOT card. With immutable state updates,
  // the card reference changes on every edit (handleCardUpdate creates new objects
  // via .map()). Including `card` in deps would cause this effect to fire during
  // normal editing, creating a feedback loop:
  //   YAML change → onChange → new card ref → useEffect → setYamlContent → Monaco
  //   update → onDidChangeModelContent → handleYamlChange → onChange → ...
  // This loop overwhelms React's render pipeline and crashes the app (white screen).
  useEffect(() => {
    if (card) {
      // Clear pending timers when switching cards
      if (yamlSyncTimerRef.current) clearTimeout(yamlSyncTimerRef.current);
      if (yamlParseTimerRef.current) clearTimeout(yamlParseTimerRef.current);
      yamlSyncTimerRef.current = null;
      yamlParseTimerRef.current = null;
      debouncedCommitRef.current?.cancel();
      lastCommittedCardRef.current = card;

      form.setFieldsValue(normalizeCardForForm(card));
      setYamlContent(cardToYaml(card));
      setUndoStack([]); // Clear undo stack when switching cards

      const styleValue = (card as { style?: string }).style ?? '';
      setBackgroundConfig(parseBackgroundConfig(styleValue));
      lastStyleValueRef.current = styleValue;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardIndex, form]);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (yamlSyncTimerRef.current) clearTimeout(yamlSyncTimerRef.current);
      if (yamlParseTimerRef.current) clearTimeout(yamlParseTimerRef.current);
      debouncedCommitRef.current?.cancel();
    };
  }, []);

  const scheduleCommit = (updatedCard: Card) => {
    if (!debouncedCommitRef.current) {
      debouncedCommitRef.current = createDebouncedCommit<Card>({
        delayMs: COMMIT_DEBOUNCE_MS,
        onBeforeCommit: () => {
          if (lastCommittedCardRef.current) {
            saveToUndoStack(lastCommittedCardRef.current);
          }
        },
        onCommit: (next) => {
          lastCommittedCardRef.current = next;
          onCommit(next);
        },
      });
    }

    debouncedCommitRef.current.schedule(updatedCard);
  };

  // Handle form value changes - sync to YAML and auto-save
  const handleValuesChange = () => {
    if (isUpdatingFromYaml.current) return;

    isUpdatingFromForm.current = true;

    const values = form.getFieldsValue();
    const updatedCard = { ...card, ...values } as Card;
    if (updatedCard.type === 'custom:swiper-card') {
      const typed = updatedCard as { slides?: unknown; cards?: unknown };
      if (Array.isArray(typed.slides) && typed.slides.length > 0) {
        delete typed.cards;
      }
    }
    const styleValue = (values.style as string | undefined) ?? '';
    if (skipStyleSyncRef.current) {
      skipStyleSyncRef.current = false;
    } else if (styleValue !== lastStyleValueRef.current) {
      setBackgroundConfig(parseBackgroundConfig(styleValue));
      lastStyleValueRef.current = styleValue;
    }

    // Apply live updates immediately for preview
    onChange(updatedCard as Card);

    // Debounce YAML serialization (expensive) while typing
    if (yamlSyncTimerRef.current) clearTimeout(yamlSyncTimerRef.current);
    yamlSyncTimerRef.current = setTimeout(() => {
      setYamlContent(cardToYaml(updatedCard as Card));
    }, YAML_SYNC_DEBOUNCE_MS);

    // Debounce commit (history/toast/etc) so typing doesn't churn
    scheduleCommit(updatedCard as Card);

    setTimeout(() => {
      isUpdatingFromForm.current = false;
    }, 0);
  };

  const handleBackgroundConfigChange = (next: BackgroundConfig) => {
    const currentStyle = form.getFieldValue('style') as string | undefined;
    const updatedStyle = applyBackgroundConfigToStyle(currentStyle, next);
    setBackgroundConfig(next);
    lastStyleValueRef.current = updatedStyle ?? '';
    skipStyleSyncRef.current = true;
    form.setFieldsValue({ style: updatedStyle });
    handleValuesChange();
  };

  // Handle YAML changes - sync to form and auto-save
  const handleYamlChange = (value: string | undefined) => {
    if (!value || isUpdatingFromForm.current) return;

    setYamlContent(value);

    if (yamlParseTimerRef.current) clearTimeout(yamlParseTimerRef.current);
    yamlParseTimerRef.current = setTimeout(() => {
      isUpdatingFromYaml.current = true;
      const parsedCard = yamlToCard(value);
      if (parsedCard) {
        form.setFieldsValue(normalizeCardForForm(parsedCard));
        onChange(parsedCard);
        scheduleCommit(parsedCard);
        const styleValue = (parsedCard as { style?: string }).style ?? '';
        setBackgroundConfig(parseBackgroundConfig(styleValue));
        lastStyleValueRef.current = styleValue;
      }
      setTimeout(() => {
        isUpdatingFromYaml.current = false;
      }, 0);
    }, YAML_PARSE_DEBOUNCE_MS);
  };

  const handleInsertEntity = (entityId: string) => {
    const editor = monacoEditorRef.current;
    if (!editor) return;

    const selection = editor.getSelection();
    const id = { major: 1, minor: 1 };
    const op = { identifier: id, range: selection, text: entityId, forceMoveMarkers: true };
    editor.executeEdits("insert-entity", [op]);
    editor.focus();

    message.success(`Inserted entity: ${entityId}`);
  };

  const handleOpenEntityBrowserClick = () => {
    if (onOpenEntityBrowser) {
      onOpenEntityBrowser(handleInsertEntity);
    }
  };

  const handleTabChange = (nextKey: string) => {
    if (activeTab === nextKey) {
      return;
    }

    if (activeTab === 'yaml' && nextKey !== 'yaml') {
      const latestYaml = monacoEditorRef.current?.getValue() ?? yamlContent;
      setYamlContent(latestYaml);
      isUpdatingFromYaml.current = true;
      const parsedCard = yamlToCard(latestYaml);
      if (parsedCard) {
        form.setFieldsValue(normalizeCardForForm(parsedCard));
        onChange(parsedCard);
        onCommit(parsedCard);
        lastCommittedCardRef.current = parsedCard;
        const styleValue = (parsedCard as { style?: string }).style ?? '';
        setBackgroundConfig(parseBackgroundConfig(styleValue));
        lastStyleValueRef.current = styleValue;
      }
      setTimeout(() => {
        isUpdatingFromYaml.current = false;
      }, 0);
    }

    setActiveTab(nextKey);
  };

  if (!card) {
    return (
      <div style={{ padding: '16px', color: 'white', height: '100%' }}>
        <Title level={4} style={{ color: 'white', marginTop: 0 }}>
          Properties
        </Title>
        <Text style={{ color: '#888' }}>
          Select a card to edit its properties
        </Text>
      </div>
    );
  }

  const cardMetadata = cardRegistry.get(card.type);
  const cardName = cardMetadata?.name || card.type;

  return (
    <div data-testid="properties-panel" style={{ padding: '16px', color: 'white', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <Title level={4} style={{ color: 'white', marginTop: 0, marginBottom: 0 }}>
          Properties
        </Title>
        <Space>
          <Tooltip title="Undo last change to card properties">
            <Button
              size="small"
              icon={<UndoOutlined />}
              onClick={handleUndo}
              disabled={undoStack.length === 0}
            >
              Undo
            </Button>
          </Tooltip>
          {activeTab === 'yaml' && (
            <Tooltip title="Auto-format YAML with proper indentation">
              <Button
                size="small"
                icon={<FormatPainterOutlined />}
                onClick={formatYaml}
              >
                Format
              </Button>
            </Tooltip>
          )}
        </Space>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <Text strong style={{ color: '#00d9ff' }}>
          {cardName}
        </Text>
        <br />
        <Text style={{ color: '#888', fontSize: '12px' }}>
          {card.type}
        </Text>
      </div>

      <Divider style={{ margin: '12px 0', borderColor: '#434343' }} />

      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={[
          {
            key: 'form',
            label: 'Form',
            children: (
              <div style={{ height: 'calc(100vh - 280px)', overflow: 'auto' }}>
                <Form
                  form={form}
                  layout="vertical"
                  onValuesChange={handleValuesChange}
                >
          {/* Common Properties */}
          {(card.type === 'entities' || card.type === 'glance') && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Title</span>}
                name="title"
              >
                <Input data-testid="card-title-input" placeholder="Card title" />
              </Form.Item>

              {/* Only show EntityMultiSelect if entities is an array */}
              {Array.isArray(card.entities) && (
                <Form.Item
                  label={<span style={{ color: 'white' }}>Entities</span>}
                  name="entities"
                  help={<span style={{ color: '#666' }}>Select entities from your Home Assistant instance</span>}
                >
                  <EntityMultiSelect data-testid="entities-multi-select" placeholder="Select entities" />
                </Form.Item>
              )}

              {/* Show warning if entities is complex object */}
              {card.entities && typeof card.entities === 'object' && !Array.isArray(card.entities) && (
                <Alert
                  title="Complex Entity Configuration"
                  description="This card uses a complex entity structure. Use the YAML editor to modify entities."
                  type="info"
                  showIcon
                  style={{ marginBottom: '16px' }}
                />
              )}
            </>
          )}

          {card.type === 'button' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Entity</span>}
                name="entity"
                rules={[{ required: true, message: 'Entity is required' }]}
              >
                <EntitySelect data-testid="entity-select" placeholder="Select entity" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Name</span>}
                name="name"
              >
                <Input data-testid="card-name-input" placeholder="Button name" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Icon</span>}
                name="icon"
              >
                <IconSelect placeholder="mdi:lightbulb" />
              </Form.Item>

          {renderSmartDefaultsConfig('button-card')}
          {renderHapticConfig('button-card')}
          {renderSoundConfig('button-card')}
        </>
      )}

      {card.type === 'markdown' && (
        <Form.Item
          label={<span style={{ color: 'white' }}>Content</span>}
          name="content"
        >
          <Input.TextArea
            placeholder="# Markdown content&#10;&#10;Your text here..."
            rows={8}
          />
        </Form.Item>
      )}

      {/* Entity context preview for any card with templated text fields */}
      <Form.Item noStyle shouldUpdate>
        {() => renderContextPreviewSection(form.getFieldsValue(true) as FormCardValues)}
      </Form.Item>

      <Form.Item noStyle shouldUpdate>
        {() => renderAttributeDisplaySection(form.getFieldsValue(true) as FormCardValues)}
      </Form.Item>

      <Form.Item noStyle shouldUpdate>
        {() => renderConditionalVisibilitySection(form.getFieldsValue(true) as FormCardValues)}
      </Form.Item>

      <Form.Item noStyle shouldUpdate>
        {() => renderStateIconMappingSection(form.getFieldsValue(true) as FormCardValues)}
      </Form.Item>

      <Form.Item noStyle shouldUpdate>
        {() => renderMultiEntitySection(form.getFieldsValue(true) as FormCardValues)}
      </Form.Item>

      {(card.type === 'sensor' || card.type === 'gauge') && (
        <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Entity</span>}
                name="entity"
                rules={[{ required: true, message: 'Entity is required' }]}
              >
                <EntitySelect data-testid="entity-select" placeholder="Select sensor" filterDomains={['sensor', 'binary_sensor']} />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Name</span>}
                name="name"
              >
                <Input data-testid="card-name-input" placeholder="Display name" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Icon</span>}
                name="icon"
              >
                <IconSelect placeholder="mdi:thermometer" />
              </Form.Item>

              {card.type === 'gauge' && (
                <>
                  <Form.Item
                    label={<span style={{ color: 'white' }}>Min</span>}
                    name="min"
                  >
                    <Input type="number" placeholder="0" />
                  </Form.Item>

                  <Form.Item
                    label={<span style={{ color: 'white' }}>Max</span>}
                    name="max"
                  >
                    <Input type="number" placeholder="100" />
                  </Form.Item>
                </>
              )}
            </>
          )}

          {card.type === 'history-graph' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Title</span>}
                name="title"
              >
                <Input placeholder="History" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Entities</span>}
                name="entities"
                help={<span style={{ color: '#666' }}>Select entities to show history for</span>}
              >
                <EntityMultiSelect placeholder="Select entities" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Hours to Show</span>}
                name="hours_to_show"
              >
                <Input type="number" placeholder="24" />
              </Form.Item>
            </>
          )}

          {card.type === 'picture' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Image URL</span>}
                name="image"
                rules={[{ required: true, message: 'Image URL is required' }]}
              >
                <Input placeholder="/local/images/dashboard.png" />
              </Form.Item>
            </>
          )}

          {card.type === 'picture-entity' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Image URL</span>}
                name="image"
                help={<span style={{ color: '#666' }}>Optional if a camera entity is set</span>}
              >
                <Input placeholder="/local/images/dashboard.png" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Entity</span>}
                name="entity"
                rules={[{ required: true, message: 'Entity is required' }]}
              >
                <EntitySelect data-testid="entity-select" placeholder="Select entity" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Camera Image</span>}
                name="camera_image"
                help={<span style={{ color: '#666' }}>Optional: Select a camera entity for live streaming</span>}
              >
                <EntitySelect placeholder="Select camera entity" filterDomains={['camera']} />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Camera View</span>}
                name="camera_view"
                help={<span style={{ color: '#666' }}>Choose between snapshot or live stream (requires camera_image)</span>}
              >
                <Select
                  placeholder="Select view mode"
                  options={[
                    { value: 'auto', label: 'Auto (Snapshot)' },
                    { value: 'live', label: 'Live (Stream)' },
                  ]}
                />
              </Form.Item>

              {/* Stream component warning */}
              {streamComponentEnabled === false && (
                <Alert
                  title="Stream Component Not Enabled"
                  description={
                    <span style={{ fontSize: '12px' }}>
                      The <code>stream:</code> component is not enabled in your Home Assistant configuration.
                      Live camera streaming requires this component. Add <code>stream:</code> to your
                      configuration.yaml and restart Home Assistant to enable live streaming.
                    </span>
                  }
                  type="warning"
                  showIcon
                  style={{ marginBottom: '16px' }}
                />
              )}

              {streamComponentEnabled === true && (
                <Alert
                  title="Stream Component Enabled"
                  description="Live camera streaming is supported on your Home Assistant instance."
                  type="success"
                  showIcon
                  style={{ marginBottom: '16px' }}
                />
              )}

              <Form.Item
                label={<span style={{ color: 'white' }}>Name</span>}
                name="name"
              >
                <Input data-testid="card-name-input" placeholder="Display name" />
              </Form.Item>
            </>
          )}

          {card.type === 'picture-glance' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Title</span>}
                name="title"
              >
                <Input data-testid="card-title-input" placeholder="Card title" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Image URL</span>}
                name="image"
                help={<span style={{ color: '#666' }}>Leave blank when using camera entity</span>}
              >
                <Input placeholder="/local/images/dashboard.png" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Camera Image</span>}
                name="camera_image"
                help={<span style={{ color: '#666' }}>Optional: Select a camera entity for live streaming</span>}
              >
                <EntitySelect placeholder="Select camera entity" filterDomains={['camera']} />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Camera View</span>}
                name="camera_view"
                help={<span style={{ color: '#666' }}>Choose between snapshot or live stream (requires camera_image)</span>}
              >
                <Select
                  placeholder="Select view mode"
                  options={[
                    { value: 'auto', label: 'Auto (Snapshot)' },
                    { value: 'live', label: 'Live (Stream)' },
                  ]}
                />
              </Form.Item>

              {/* Stream component warning */}
              {streamComponentEnabled === false && (
                <Alert
                  title="Stream Component Not Enabled"
                  description={
                    <span style={{ fontSize: '12px' }}>
                      The <code>stream:</code> component is not enabled in your Home Assistant configuration.
                      Live camera streaming requires this component. Add <code>stream:</code> to your
                      configuration.yaml and restart Home Assistant to enable live streaming.
                    </span>
                  }
                  type="warning"
                  showIcon
                  style={{ marginBottom: '16px' }}
                />
              )}

              {streamComponentEnabled === true && (
                <Alert
                  title="Stream Component Enabled"
                  description="Live camera streaming is supported on your Home Assistant instance."
                  type="success"
                  showIcon
                  style={{ marginBottom: '16px' }}
                />
              )}

              <Form.Item
                label={<span style={{ color: 'white' }}>Entities</span>}
                name="entities"
                help={<span style={{ color: '#666' }}>Select entities to display over image</span>}
              >
                <EntityMultiSelect placeholder="Select entities" />
              </Form.Item>
            </>
          )}

          {card.type === 'light' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Entity</span>}
                name="entity"
                rules={[{ required: true, message: 'Entity is required' }]}
              >
                <EntitySelect placeholder="Select light" filterDomains={['light']} />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Name</span>}
                name="name"
              >
                <Input data-testid="card-name-input" placeholder="Display name" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Icon</span>}
                name="icon"
              >
                <IconSelect placeholder="mdi:lightbulb" />
              </Form.Item>
            </>
          )}

          {card.type === 'thermostat' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Entity</span>}
                name="entity"
                rules={[{ required: true, message: 'Entity is required' }]}
              >
                <EntitySelect placeholder="Select climate entity" filterDomains={['climate']} />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Name</span>}
                name="name"
              >
                <Input data-testid="card-name-input" placeholder="Display name" />
              </Form.Item>
            </>
          )}

          {card.type === 'media-control' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Entity</span>}
                name="entity"
                rules={[{ required: true, message: 'Entity is required' }]}
              >
                <EntitySelect placeholder="Select media player" filterDomains={['media_player']} />
              </Form.Item>
            </>
          )}

          {card.type === 'weather-forecast' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Entity</span>}
                name="entity"
                rules={[{ required: true, message: 'Entity is required' }]}
              >
                <EntitySelect placeholder="Select weather entity" filterDomains={['weather']} />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Name</span>}
                name="name"
              >
                <Input data-testid="card-name-input" placeholder="Display name" />
              </Form.Item>
            </>
          )}

          {card.type === 'map' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Title</span>}
                name="title"
              >
                <Input placeholder="Map" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Entities</span>}
                name="entities"
                help={<span style={{ color: '#666' }}>Select entities to track on map</span>}
              >
                <EntityMultiSelect
                  placeholder="Select entities"
                  filterDomains={['device_tracker', 'person', 'zone']}
                />
              </Form.Item>
            </>
          )}

          {card.type === 'alarm-panel' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Entity</span>}
                name="entity"
                rules={[{ required: true, message: 'Entity is required' }]}
              >
                <EntitySelect placeholder="Select alarm panel" filterDomains={['alarm_control_panel']} />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Name</span>}
                name="name"
              >
                <Input data-testid="card-name-input" placeholder="Display name" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>States</span>}
                name="states"
                help={<span style={{ color: '#666' }}>Alarm states to display (comma-separated)</span>}
              >
                <Select
                  mode="multiple"
                  placeholder="Select states"
                  options={[
                    { value: 'armed_home', label: 'Armed Home' },
                    { value: 'armed_away', label: 'Armed Away' },
                    { value: 'armed_night', label: 'Armed Night' },
                    { value: 'armed_vacation', label: 'Armed Vacation' },
                    { value: 'armed_custom_bypass', label: 'Armed Custom Bypass' },
                    { value: 'disarmed', label: 'Disarmed' },
                  ]}
                />
              </Form.Item>
            </>
          )}

          {card.type === 'plant-status' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Entity</span>}
                name="entity"
                rules={[{ required: true, message: 'Entity is required' }]}
              >
                <EntitySelect placeholder="Select plant" filterDomains={['plant']} />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Name</span>}
                name="name"
              >
                <Input data-testid="card-name-input" placeholder="Display name" />
              </Form.Item>
            </>
          )}

          {card.type === 'custom:mini-graph-card' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Entities</span>}
                name="entities"
                rules={[{ required: true, message: 'At least one entity is required' }]}
                help={<span style={{ color: '#666' }}>Select entities to graph</span>}
              >
                <EntityMultiSelect placeholder="Select entities" filterDomains={['sensor', 'binary_sensor']} />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Name</span>}
                name="name"
              >
                <Input placeholder="Graph title" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Hours to Show</span>}
                name="hours_to_show"
              >
                <Input type="number" placeholder="24" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Points per Hour</span>}
                name="points_per_hour"
                help={<span style={{ color: '#666' }}>Data point density (default: 0.5)</span>}
              >
                <Input type="number" step="0.1" placeholder="0.5" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Line Width</span>}
                name="line_width"
              >
                <Input type="number" placeholder="5" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Animate</span>}
                name="animate"
                help={<span style={{ color: '#666' }}>Enable graph animations</span>}
              >
                <Select
                  placeholder="Select option"
                  options={[
                    { value: true, label: 'Enabled' },
                    { value: false, label: 'Disabled' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Show State</span>}
                name="show_state"
              >
                <Select
                  placeholder="Select option"
                  options={[
                    { value: true, label: 'Show' },
                    { value: false, label: 'Hide' },
                  ]}
                />
              </Form.Item>
            </>
          )}

          {card.type === 'custom:button-card' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Entity</span>}
                name="entity"
              >
                <EntitySelect placeholder="Select entity (optional for template buttons)" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Name</span>}
                name="name"
              >
                <Input data-testid="card-name-input" placeholder="Button name" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Icon</span>}
                name="icon"
              >
                <IconSelect placeholder="mdi:lightbulb" />
              </Form.Item>

              {renderSmartDefaultsConfig('custom-button-card')}
            </>
          )}

          {card.type === 'custom:mushroom-entity-card' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Entity</span>}
                name="entity"
                rules={[{ required: true, message: 'Entity is required' }]}
              >
                <EntitySelect data-testid="entity-select" placeholder="Select entity" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Name</span>}
                name="name"
              >
                <Input data-testid="card-name-input" placeholder="Display name" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Icon</span>}
                name="icon"
              >
                <IconSelect placeholder="mdi:mushroom" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Icon Color</span>}
                name="icon_color"
              >
                <ColorPickerInput
                  placeholder="Pick icon color"
                  data-testid="mushroom-entity-icon-color-input"
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Layout</span>}
                name="layout"
              >
                <Select
                  placeholder="Select layout"
                  options={[
                    { value: 'vertical', label: 'Vertical' },
                    { value: 'horizontal', label: 'Horizontal' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Fill Container</span>}
                name="fill_container"
              >
                <Select
                  placeholder="Select option"
                  options={[
                    { value: true, label: 'Yes' },
                    { value: false, label: 'No' },
                  ]}
                />
              </Form.Item>
            </>
          )}

          {card.type === 'custom:mushroom-light-card' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Entity</span>}
                name="entity"
                rules={[{ required: true, message: 'Entity is required' }]}
              >
                <EntitySelect placeholder="Select light" filterDomains={['light']} />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Name</span>}
                name="name"
              >
                <Input data-testid="card-name-input" placeholder="Display name" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Icon</span>}
                name="icon"
              >
                <IconSelect placeholder="mdi:lightbulb" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Use Light Color</span>}
                name="use_light_color"
                help={<span style={{ color: '#666' }}>Use the light's current color for the icon</span>}
              >
                <Select
                  placeholder="Select option"
                  options={[
                    { value: true, label: 'Yes' },
                    { value: false, label: 'No' },
                  ]}
                />
              </Form.Item>

              <Form.Item noStyle shouldUpdate={(prev, curr) => prev.use_light_color !== curr.use_light_color}>
                {({ getFieldValue }) => {
                  const useLightColor = getFieldValue('use_light_color');
                  const disabled = useLightColor === true;
                  return (
                    <Form.Item
                      label={<span style={{ color: 'white' }}>Icon Color</span>}
                      name="icon_color"
                      help={<span style={{ color: '#666' }}>Overrides icon color when not using the light color</span>}
                    >
                      <ColorPickerInput
                        placeholder={disabled ? 'Using light color from entity' : 'Pick icon color'}
                        disabled={disabled}
                        data-testid="mushroom-light-icon-color-input"
                      />
                    </Form.Item>
                  );
                }}
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Show Brightness Control</span>}
                name="show_brightness_control"
              >
                <Select
                  placeholder="Select option"
                  options={[
                    { value: true, label: 'Show' },
                    { value: false, label: 'Hide' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Show Color Control</span>}
                name="show_color_control"
              >
                <Select
                  placeholder="Select option"
                  options={[
                    { value: true, label: 'Show' },
                    { value: false, label: 'Hide' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Show Color Temperature Control</span>}
                name="show_color_temp_control"
              >
                <Select
                  placeholder="Select option"
                  options={[
                    { value: true, label: 'Show' },
                    { value: false, label: 'Hide' },
                  ]}
                />
              </Form.Item>
            </>
          )}

          {card.type === 'custom:mushroom-climate-card' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Entity</span>}
                name="entity"
                rules={[{ required: true, message: 'Entity is required' }]}
              >
                <EntitySelect placeholder="Select climate entity" filterDomains={['climate']} />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Name</span>}
                name="name"
              >
                <Input data-testid="card-name-input" placeholder="Display name" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Icon</span>}
                name="icon"
              >
                <IconSelect placeholder="mdi:thermostat" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Show Temperature Control</span>}
                name="show_temperature_control"
              >
                <Select
                  placeholder="Select option"
                  options={[
                    { value: true, label: 'Show' },
                    { value: false, label: 'Hide' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>HVAC Modes</span>}
                name="hvac_modes"
                help={<span style={{ color: '#666' }}>Climate modes to display</span>}
              >
                <Select
                  mode="multiple"
                  placeholder="Select modes"
                  options={[
                    { value: 'auto', label: 'Auto' },
                    { value: 'heat', label: 'Heat' },
                    { value: 'cool', label: 'Cool' },
                    { value: 'heat_cool', label: 'Heat/Cool' },
                    { value: 'dry', label: 'Dry' },
                    { value: 'fan_only', label: 'Fan Only' },
                    { value: 'off', label: 'Off' },
                  ]}
                />
              </Form.Item>
            </>
          )}

          {card.type === 'custom:mushroom-cover-card' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Entity</span>}
                name="entity"
                rules={[{ required: true, message: 'Entity is required' }]}
              >
                <EntitySelect placeholder="Select cover entity" filterDomains={['cover']} />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Name</span>}
                name="name"
              >
                <Input data-testid="card-name-input" placeholder="Display name" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Icon</span>}
                name="icon"
              >
                <IconSelect placeholder="mdi:window-shutter" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Show Position Control</span>}
                name="show_position_control"
              >
                <Select
                  placeholder="Select option"
                  options={[
                    { value: true, label: 'Show' },
                    { value: false, label: 'Hide' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Show Tilt Position Control</span>}
                name="show_tilt_position_control"
              >
                <Select
                  placeholder="Select option"
                  options={[
                    { value: true, label: 'Show' },
                    { value: false, label: 'Hide' },
                  ]}
                />
              </Form.Item>
            </>
          )}

          {card.type === 'custom:mushroom-fan-card' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Entity</span>}
                name="entity"
                rules={[{ required: true, message: 'Entity is required' }]}
              >
                <EntitySelect placeholder="Select fan entity" filterDomains={['fan']} />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Name</span>}
                name="name"
              >
                <Input data-testid="card-name-input" placeholder="Display name" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Icon</span>}
                name="icon"
              >
                <IconSelect placeholder="mdi:fan" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Icon Animation</span>}
                name="icon_animation"
                help={<span style={{ color: '#666' }}>Animate icon when fan is on</span>}
              >
                <Select
                  placeholder="Select option"
                  options={[
                    { value: true, label: 'Enabled' },
                    { value: false, label: 'Disabled' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Show Percentage Control</span>}
                name="show_percentage_control"
              >
                <Select
                  placeholder="Select option"
                  options={[
                    { value: true, label: 'Show' },
                    { value: false, label: 'Hide' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Show Oscillate Control</span>}
                name="show_oscillate_control"
              >
                <Select
                  placeholder="Select option"
                  options={[
                    { value: true, label: 'Show' },
                    { value: false, label: 'Hide' },
                  ]}
                />
              </Form.Item>
            </>
          )}

          {card.type === 'custom:mushroom-switch-card' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Entity</span>}
                name="entity"
                rules={[{ required: true, message: 'Entity is required' }]}
              >
                <EntitySelect placeholder="Select switch entity" filterDomains={['switch', 'input_boolean']} />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Name</span>}
                name="name"
              >
                <Input data-testid="card-name-input" placeholder="Display name" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Icon</span>}
                name="icon"
              >
                <IconSelect placeholder="mdi:light-switch" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Icon Color</span>}
                name="icon_color"
              >
                <ColorPickerInput
                  placeholder="Pick icon color"
                  data-testid="mushroom-switch-icon-color-input"
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Layout</span>}
                name="layout"
              >
                <Select
                  placeholder="Select layout"
                  options={[
                    { value: 'vertical', label: 'Vertical' },
                    { value: 'horizontal', label: 'Horizontal' },
                  ]}
                />
              </Form.Item>
            </>
          )}

          {(card.type === 'horizontal-stack' || card.type === 'vertical-stack') && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Title</span>}
                name="title"
              >
                <Input placeholder="Stack title (optional)" />
              </Form.Item>

              <Alert
                title="Nested Cards Configuration"
                description="This stack contains other cards. Add or edit cards using the canvas. The cards are stacked in the order they appear in the YAML."
                type="info"
                showIcon
                style={{ marginBottom: '16px' }}
              />
            </>
          )}

          {card.type === 'grid' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Title</span>}
                name="title"
              >
                <Input placeholder="Grid title (optional)" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Columns</span>}
                name="columns"
                help={<span style={{ color: '#666' }}>Number of columns in the grid</span>}
              >
                <Input type="number" placeholder="3" min={1} max={12} />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Square</span>}
                name="square"
                help={<span style={{ color: '#666' }}>Force square aspect ratio</span>}
              >
                <Select
                  placeholder="Select option"
                  options={[
                    { value: true, label: 'Yes' },
                    { value: false, label: 'No' },
                  ]}
                />
              </Form.Item>

              <Alert
                title="Nested Cards Configuration"
                description="This grid contains other cards. Add or edit cards using the canvas. The cards will be arranged in a grid layout."
                type="info"
                showIcon
                style={{ marginBottom: '16px' }}
              />
            </>
          )}

          {card.type === 'custom:swiper-card' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Title</span>}
                name="title"
              >
                <Input placeholder="Carousel title (optional)" />
              </Form.Item>

              <Divider />
              <Text strong style={{ color: 'white' }}>Carousel Controls</Text>

              <Form.Item
                label={<span style={{ color: 'white' }}>Pagination Type</span>}
                name={['pagination', 'type']}
              >
                <Select
                  placeholder="Select pagination type"
                  options={[
                    { value: 'bullets', label: 'Bullets' },
                    { value: 'fraction', label: 'Fraction' },
                    { value: 'progressbar', label: 'Progress Bar' },
                    { value: 'custom', label: 'Custom' },
                  ]}
                  data-testid="swiper-pagination-type"
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Pagination Clickable</span>}
                name={['pagination', 'clickable']}
                valuePropName="checked"
              >
                <Switch data-testid="swiper-pagination-clickable" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Navigation Arrows</span>}
                name="navigation"
                valuePropName="checked"
              >
                <Switch data-testid="swiper-navigation-toggle" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Autoplay</span>}
                name={['autoplay', 'enabled']}
                valuePropName="checked"
              >
                <Switch data-testid="swiper-autoplay-toggle" />
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prev, curr) => prev.autoplay?.enabled !== curr.autoplay?.enabled}
              >
                {() => {
                  const autoplayEnabled = Boolean(form.getFieldValue(['autoplay', 'enabled']));
                  return (
                    <>
                      <Form.Item
                        label={<span style={{ color: 'white' }}>Autoplay Delay (ms)</span>}
                        name={['autoplay', 'delay']}
                      >
                        <InputNumber min={0} style={{ width: '100%' }} disabled={!autoplayEnabled} data-testid="swiper-autoplay-delay" />
                      </Form.Item>

                      <Form.Item
                        label={<span style={{ color: 'white' }}>Pause on Interaction</span>}
                        name={['autoplay', 'pause_on_interaction']}
                        valuePropName="checked"
                      >
                        <Switch disabled={!autoplayEnabled} data-testid="swiper-autoplay-pause" />
                      </Form.Item>

                      <Form.Item
                        label={<span style={{ color: 'white' }}>Stop on Last Slide</span>}
                        name={['autoplay', 'stop_on_last_slide']}
                        valuePropName="checked"
                      >
                        <Switch disabled={!autoplayEnabled} data-testid="swiper-autoplay-stop-last" />
                      </Form.Item>
                    </>
                  );
                }}
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Transition Effect</span>}
                name="effect"
              >
                <Select
                  placeholder="Select effect"
                  options={[
                    { value: 'slide', label: 'Slide' },
                    { value: 'fade', label: 'Fade' },
                    { value: 'cube', label: 'Cube' },
                    { value: 'coverflow', label: 'Coverflow' },
                    { value: 'flip', label: 'Flip' },
                  ]}
                  data-testid="swiper-effect"
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Slides Per View</span>}
                name="slides_per_view"
              >
                <Select
                  placeholder="Select slides per view"
                  options={[
                    { value: 1, label: '1' },
                    { value: 2, label: '2' },
                    { value: 3, label: '3' },
                    { value: 4, label: '4' },
                    { value: 'auto', label: 'Auto' },
                  ]}
                  data-testid="swiper-slides-per-view"
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Space Between (px)</span>}
                name="space_between"
              >
                <InputNumber min={0} style={{ width: '100%' }} data-testid="swiper-space-between" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Loop Slides</span>}
                name="loop"
                valuePropName="checked"
              >
                <Switch data-testid="swiper-loop-toggle" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Direction</span>}
                name="direction"
              >
                <Select
                  placeholder="Select direction"
                  options={[
                    { value: 'horizontal', label: 'Horizontal' },
                    { value: 'vertical', label: 'Vertical' },
                  ]}
                  data-testid="swiper-direction"
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Centered Slides</span>}
                name="centered_slides"
                valuePropName="checked"
              >
                <Switch data-testid="swiper-centered-toggle" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Free Mode</span>}
                name="free_mode"
                valuePropName="checked"
              >
                <Switch data-testid="swiper-free-mode-toggle" />
              </Form.Item>

              <Divider />
              <Text strong style={{ color: 'white' }}>Slides</Text>

              <Form.List name="slides">
                {(fields, { add, remove }) => (
                  <Space direction="vertical" style={{ width: '100%' }} size="large">
                    {fields.map((field, index) => (
                      <div
                        key={field.key}
                        style={{
                          padding: '12px',
                          border: '1px solid #2a2a2a',
                          borderRadius: '8px',
                          background: '#1a1a1a',
                        }}
                      >
                        <Text style={{ color: '#bfbfbf', fontSize: '12px' }}>
                          Slide {index + 1}
                        </Text>

                        <Form.Item
                          label={<span style={{ color: 'white' }}>Alignment</span>}
                          name={[field.name, 'alignment']}
                        >
                          <Select
                            placeholder="Select alignment"
                            options={[
                              { value: 'top', label: 'Top' },
                              { value: 'center', label: 'Center' },
                              { value: 'bottom', label: 'Bottom' },
                            ]}
                            data-testid={`swiper-slide-${index}-alignment`}
                          />
                        </Form.Item>

                        <Form.Item
                          label={<span style={{ color: 'white' }}>Allow Navigation</span>}
                          name={[field.name, 'allow_navigation']}
                          valuePropName="checked"
                        >
                          <Switch data-testid={`swiper-slide-${index}-allow-navigation`} />
                        </Form.Item>

                        <Form.Item
                          label={<span style={{ color: 'white' }}>Autoplay Delay Override (ms)</span>}
                          name={[field.name, 'autoplay_delay']}
                        >
                          <InputNumber min={0} style={{ width: '100%' }} data-testid={`swiper-slide-${index}-autoplay-delay`} />
                        </Form.Item>

                        <Form.Item shouldUpdate>
                          {() => {
                            const slideBackground = form.getFieldValue(['slides', field.name, 'background']);
                            const hasCustomBackground = Boolean(slideBackground);
                            return (
                              <>
                                <Form.Item label={<span style={{ color: 'white' }}>Custom Background</span>} colon={false}>
                                  <Switch
                                    checked={hasCustomBackground}
                                    onChange={(checked) => {
                                      const slides = form.getFieldValue('slides') || [];
                                      const updatedSlides = [...slides];
                                      const currentSlide = updatedSlides[field.name] || {};
                                      if (checked) {
                                        updatedSlides[field.name] = {
                                          ...currentSlide,
                                          background: currentSlide.background || { ...DEFAULT_BACKGROUND_CONFIG },
                                        };
                                      } else {
                                        const { background, ...rest } = currentSlide;
                                        updatedSlides[field.name] = rest;
                                      }
                                      form.setFieldsValue({ slides: updatedSlides });
                                      handleValuesChange();
                                    }}
                                    data-testid={`swiper-slide-${index}-background-toggle`}
                                  />
                                </Form.Item>

                                {hasCustomBackground && (
                                  <Form.Item
                                    name={[field.name, 'background']}
                                    valuePropName="value"
                                    trigger="onChange"
                                  >
                                    <BackgroundCustomizer />
                                  </Form.Item>
                                )}
                              </>
                            );
                          }}
                        </Form.Item>

                        <Button
                          danger
                          onClick={() => {
                            remove(field.name);
                            handleValuesChange();
                          }}
                          data-testid={`swiper-slide-${index}-remove`}
                        >
                          Remove Slide
                        </Button>
                      </div>
                    ))}

                    <Button
                      type="dashed"
                      onClick={() => {
                        add({
                          alignment: 'center',
                          allow_navigation: true,
                        });
                        handleValuesChange();
                      }}
                      data-testid="swiper-slide-add"
                    >
                      Add Slide
                    </Button>
                  </Space>
                )}
              </Form.List>

              <Alert
                title="Nested Cards Configuration"
                description="Each slide can contain one or more cards. Use the YAML editor to add cards under slides[].cards for full control."
                type="info"
                showIcon
                style={{ marginTop: '16px' }}
              />
            </>
          )}

          {card.type === 'conditional' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Entity</span>}
                name={['conditions', 0, 'entity']}
                help={<span style={{ color: '#666' }}>Entity to check condition on</span>}
              >
                <EntitySelect data-testid="entity-select" placeholder="Select entity" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>State</span>}
                name={['conditions', 0, 'state']}
                help={<span style={{ color: '#666' }}>Show card when entity matches this state</span>}
              >
                <Input placeholder="on" />
              </Form.Item>

              <Alert
                title="Complex Conditional Configuration"
                description="For advanced conditions (multiple conditions, state_not, etc.), use the YAML editor. This form supports basic single-condition configuration."
                type="info"
                showIcon
                style={{ marginBottom: '16px' }}
              />
            </>
          )}

          {card.type === 'custom:apexcharts-card' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Graph Span</span>}
                name="graph_span"
                help={<span style={{ color: '#666' }}>Time span to display (e.g., 1h, 12h, 1d, 1w)</span>}
              >
                <Input placeholder="1d" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Header Title</span>}
                name={['header', 'title']}
              >
                <Input placeholder="Chart title" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Show Header</span>}
                name={['header', 'show']}
              >
                <Select
                  placeholder="Select option"
                  options={[
                    { value: true, label: 'Show' },
                    { value: false, label: 'Hide' },
                  ]}
                />
              </Form.Item>

              <Alert
                title="Advanced Chart Configuration"
                description="ApexCharts cards require series configuration. Use the YAML editor to configure chart series, entities, and advanced options."
                type="info"
                showIcon
                style={{ marginBottom: '16px' }}
              />
            </>
          )}

          {card.type === 'custom:bubble-card' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Card Type</span>}
                name="card_type"
                rules={[{ required: true, message: 'Card type is required' }]}
                help={<span style={{ color: '#666' }}>Type of bubble card</span>}
              >
                <Select
                  placeholder="Select card type"
                  options={[
                    { value: 'button', label: 'Button' },
                    { value: 'cover', label: 'Cover' },
                    { value: 'empty-column', label: 'Empty Column' },
                    { value: 'horizontal-buttons-stack', label: 'Horizontal Buttons Stack' },
                    { value: 'pop-up', label: 'Pop-up' },
                    { value: 'separator', label: 'Separator' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Entity</span>}
                name="entity"
              >
                <EntitySelect placeholder="Select entity (if applicable)" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Name</span>}
                name="name"
              >
                <Input data-testid="card-name-input" placeholder="Display name" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Icon</span>}
                name="icon"
              >
                <IconSelect placeholder="mdi:bubble" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Show State</span>}
                name="show_state"
              >
                <Select
                  placeholder="Select option"
                  options={[
                    { value: true, label: 'Show' },
                    { value: false, label: 'Hide' },
                  ]}
                />
              </Form.Item>
            </>
          )}

          {card.type === 'custom:better-thermostat-ui-card' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Entity</span>}
                name="entity"
                rules={[{ required: true, message: 'Entity is required' }]}
              >
                <EntitySelect placeholder="Select climate entity" filterDomains={['climate']} />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Name</span>}
                name="name"
              >
                <Input data-testid="card-name-input" placeholder="Display name" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Disable Window</span>}
                name="disable_window"
                help={<span style={{ color: '#666' }}>Hide window open indicator</span>}
              >
                <Select
                  placeholder="Select option"
                  options={[
                    { value: true, label: 'Yes' },
                    { value: false, label: 'No' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Disable Summer</span>}
                name="disable_summer"
                help={<span style={{ color: '#666' }}>Hide summer mode indicator</span>}
              >
                <Select
                  placeholder="Select option"
                  options={[
                    { value: true, label: 'Yes' },
                    { value: false, label: 'No' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Disable Heat</span>}
                name="disable_heat"
                help={<span style={{ color: '#666' }}>Hide heating indicator</span>}
              >
                <Select
                  placeholder="Select option"
                  options={[
                    { value: true, label: 'Yes' },
                    { value: false, label: 'No' },
                  ]}
                />
              </Form.Item>
            </>
          )}

          {(card.type === 'custom:power-flow-card' || card.type === 'custom:power-flow-card-plus') && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Grid Entity</span>}
                name={['entities', 'grid', 'entity']}
                help={<span style={{ color: '#666' }}>Entity showing grid power consumption</span>}
              >
                <EntitySelect placeholder="Select grid entity" filterDomains={['sensor']} />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Solar Entity</span>}
                name={['entities', 'solar', 'entity']}
                help={<span style={{ color: '#666' }}>Entity showing solar power production</span>}
              >
                <EntitySelect placeholder="Select solar entity" filterDomains={['sensor']} />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Battery Entity</span>}
                name={['entities', 'battery', 'entity']}
                help={<span style={{ color: '#666' }}>Entity showing battery power</span>}
              >
                <EntitySelect placeholder="Select battery entity" filterDomains={['sensor']} />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Home Entity</span>}
                name={['entities', 'home', 'entity']}
                help={<span style={{ color: '#666' }}>Entity showing home power consumption</span>}
              >
                <EntitySelect placeholder="Select home entity" filterDomains={['sensor']} />
              </Form.Item>

              <Alert
                title="Complex Entity Configuration"
                description="Power Flow cards support many entity configurations including individual devices. Use the YAML editor to configure individual appliances, state_of_charge sensors, display options, and advanced settings."
                type="info"
                showIcon
                style={{ marginBottom: '16px' }}
              />
            </>
          )}

          {card.type === 'custom:webrtc-camera' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>URL</span>}
                name="url"
                rules={[{ required: true, message: 'URL is required' }]}
                help={<span style={{ color: '#666' }}>WebRTC stream URL</span>}
              >
                <Input placeholder="rtsp://camera.local/stream" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Entity</span>}
                name="entity"
                help={<span style={{ color: '#666' }}>Camera entity (optional)</span>}
              >
                <EntitySelect placeholder="Select camera entity" filterDomains={['camera']} />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Poster</span>}
                name="poster"
                help={<span style={{ color: '#666' }}>Poster image URL (shown before stream loads)</span>}
              >
                <Input placeholder="/local/camera-poster.jpg" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Muted</span>}
                name="muted"
              >
                <Select
                  placeholder="Select option"
                  options={[
                    { value: true, label: 'Muted' },
                    { value: false, label: 'Unmuted' },
                  ]}
                />
              </Form.Item>
            </>
          )}

          {card.type === 'custom:surveillance-card' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Title</span>}
                name="title"
              >
                <Input placeholder="Surveillance" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Update Interval</span>}
                name="update_interval"
                help={<span style={{ color: '#666' }}>Update interval in seconds</span>}
              >
                <Input type="number" placeholder="1" />
              </Form.Item>

              <Alert
                title="Camera Configuration"
                description="Surveillance cards require a cameras array. Use the YAML editor to configure multiple camera entities and their display options."
                type="info"
                showIcon
                style={{ marginBottom: '16px' }}
              />
            </>
          )}

          {card.type === 'custom:frigate-card' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Frigate URL</span>}
                name="frigate_url"
                help={<span style={{ color: '#666' }}>URL to your Frigate instance</span>}
              >
                <Input placeholder="http://frigate.local:5000" />
              </Form.Item>

              <Alert
                title="Camera Configuration"
                description="Frigate cards require cameras array and advanced configuration. Use the YAML editor to configure camera entities, views, live providers, and other Frigate-specific options."
                type="info"
                showIcon
                style={{ marginBottom: '16px' }}
              />
            </>
          )}

          {card.type === 'custom:camera-card' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Entity</span>}
                name="entity"
                rules={[{ required: true, message: 'Entity is required' }]}
              >
                <EntitySelect placeholder="Select camera entity" filterDomains={['camera']} />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Title</span>}
                name="title"
              >
                <Input placeholder="Camera name" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Camera View</span>}
                name="camera_view"
                help={<span style={{ color: '#666' }}>Display mode for camera feed</span>}
              >
                <Select
                  placeholder="Select view mode"
                  options={[
                    { value: 'auto', label: 'Auto' },
                    { value: 'live', label: 'Live' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Show State</span>}
                name="show_state"
              >
                <Select
                  placeholder="Select option"
                  options={[
                    { value: true, label: 'Show' },
                    { value: false, label: 'Hide' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Show Name</span>}
                name="show_name"
              >
                <Select
                  placeholder="Select option"
                  options={[
                    { value: true, label: 'Show' },
                    { value: false, label: 'Hide' },
                  ]}
                />
              </Form.Item>
            </>
          )}

          {/* New Mushroom Cards */}
          {card.type === 'custom:mushroom-title-card' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Title</span>}
                name="title"
                help={<span style={{ color: '#666' }}>Section title text</span>}
              >
                <Input placeholder="Enter title" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Subtitle</span>}
                name="subtitle"
                help={<span style={{ color: '#666' }}>Optional subtitle text</span>}
              >
                <Input placeholder="Enter subtitle" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Alignment</span>}
                name="alignment"
                help={<span style={{ color: '#666' }}>Text alignment</span>}
              >
                <Select
                  placeholder="Select alignment"
                  options={[
                    { value: 'start', label: 'Left' },
                    { value: 'center', label: 'Center' },
                    { value: 'end', label: 'Right' },
                  ]}
                />
              </Form.Item>
            </>
          )}

          {(card.type === 'custom:mushroom-select-card' ||
            card.type === 'custom:mushroom-number-card' ||
            card.type === 'custom:mushroom-person-card' ||
            card.type === 'custom:mushroom-media-player-card' ||
            card.type === 'custom:mushroom-lock-card' ||
            card.type === 'custom:mushroom-alarm-control-panel-card' ||
            card.type === 'custom:mushroom-vacuum-card') && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Entity</span>}
                name="entity"
                help={<span style={{ color: '#666' }}>Entity to control</span>}
              >
                <EntitySelect data-testid="entity-select" placeholder="Select entity" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Name</span>}
                name="name"
                help={<span style={{ color: '#666' }}>Override entity name</span>}
              >
                <Input placeholder="Card name (optional)" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Icon</span>}
                name="icon"
                help={<span style={{ color: '#666' }}>Override entity icon</span>}
              >
                <IconSelect placeholder="Select icon" />
              </Form.Item>
            </>
          )}

          {/* Tier 1 Cards */}
          {card.type === 'custom:mini-media-player' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Entity</span>}
                name="entity"
                help={<span style={{ color: '#666' }}>Media player entity</span>}
              >
                <EntitySelect placeholder="Select media player" filterDomains={['media_player']} />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Name</span>}
                name="name"
                help={<span style={{ color: '#666' }}>Override entity name</span>}
              >
                <Input placeholder="Card name (optional)" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Icon</span>}
                name="icon"
                help={<span style={{ color: '#666' }}>Override entity icon</span>}
              >
                <IconSelect placeholder="Select icon" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Show Source</span>}
                name="hide_source"
                help={<span style={{ color: '#666' }}>Show source selection</span>}
              >
                <Select
                  placeholder="Select option"
                  options={[
                    { value: false, label: 'Show' },
                    { value: true, label: 'Hide' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Show Volume</span>}
                name="hide_volume"
                help={<span style={{ color: '#666' }}>Show volume slider</span>}
              >
                <Select
                  placeholder="Select option"
                  options={[
                    { value: false, label: 'Show' },
                    { value: true, label: 'Hide' },
                  ]}
                />
              </Form.Item>

              <Alert
                title="Advanced Configuration"
                description="Use the YAML editor for advanced options like shortcuts, artwork, and sound modes."
                type="info"
                showIcon
                style={{ marginTop: '16px' }}
              />
            </>
          )}

          {card.type === 'custom:slider-entity-row' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Entity</span>}
                name="entity"
                help={<span style={{ color: '#666' }}>Entity to control with slider</span>}
              >
                <EntitySelect data-testid="entity-select" placeholder="Select entity" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Name</span>}
                name="name"
                help={<span style={{ color: '#666' }}>Override entity name</span>}
              >
                <Input placeholder="Entity name (optional)" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Minimum</span>}
                name="min"
                help={<span style={{ color: '#666' }}>Minimum slider value</span>}
              >
                <Input type="number" placeholder="0" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Maximum</span>}
                name="max"
                help={<span style={{ color: '#666' }}>Maximum slider value</span>}
              >
                <Input type="number" placeholder="100" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Step</span>}
                name="step"
                help={<span style={{ color: '#666' }}>Slider step increment</span>}
              >
                <Input type="number" placeholder="1" />
              </Form.Item>
            </>
          )}

          {card.type === 'custom:battery-state-card' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Title</span>}
                name="title"
                help={<span style={{ color: '#666' }}>Card title</span>}
              >
                <Input placeholder="Battery Levels" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Entities</span>}
                name="entities"
                help={<span style={{ color: '#666' }}>Battery entities to monitor</span>}
              >
                <EntityMultiSelect placeholder="Select battery entities" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Sort By Level</span>}
                name="sort_by_level"
                help={<span style={{ color: '#666' }}>Sort entities by battery level</span>}
              >
                <Select
                  placeholder="Select sort order"
                  options={[
                    { value: 'asc', label: 'Ascending (Low to High)' },
                    { value: 'desc', label: 'Descending (High to Low)' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Collapse</span>}
                name="collapse"
                help={<span style={{ color: '#666' }}>Number of entities to show (rest are collapsed)</span>}
              >
                <Input type="number" placeholder="5" />
              </Form.Item>

              <Alert
                title="Battery Monitoring"
                description="This card automatically detects battery level attributes. Use filter patterns in YAML for advanced entity filtering."
                type="info"
                showIcon
                style={{ marginTop: '16px' }}
              />
            </>
          )}

          {card.type === 'custom:card-mod' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Style (CSS)</span>}
                name="style"
                help={<span style={{ color: '#666' }}>Custom CSS styling for the card</span>}
              >
                <Input.TextArea
                  placeholder="ha-card { ... }"
                  rows={6}
                  style={{ fontFamily: 'monospace' }}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Style Color</span>}
                help={<span style={{ color: '#666' }}>Insert or update the CSS color value within the style block</span>}
              >
                <Form.Item noStyle shouldUpdate>
                  {({ getFieldValue, setFieldsValue }) => (
                    <ColorPickerInput
                      value={extractStyleColor(getFieldValue('style'))}
                      onChange={(newColor) => {
                        const updatedStyle = upsertStyleColor(getFieldValue('style'), newColor);
                        setFieldsValue({ style: updatedStyle });
                        handleValuesChange();
                      }}
                      placeholder="Pick a CSS color"
                      data-testid="card-mod-style-color-input"
                    />
                  )}
                </Form.Item>
              </Form.Item>

              <Alert
                title="CSS Styling"
                description="Card-mod allows you to apply custom CSS to any card. Use the YAML editor for complex card configurations with nested card_mod."
                type="info"
                showIcon
                style={{ marginTop: '16px' }}
              />
            </>
          )}

          {(card.type === 'custom:vertical-stack-in-card' || card.type === 'custom:simple-swipe-card') && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Title</span>}
                name="title"
                help={<span style={{ color: '#666' }}>Card title (optional)</span>}
              >
                <Input placeholder="Enter title" />
              </Form.Item>

              <Alert
                title="Container Card"
                description={`This card contains other cards. Use the YAML editor to add and configure nested cards in the "cards" array.`}
                type="info"
                showIcon
              />
            </>
          )}

          {card.type === 'custom:auto-entities' && (
            <>
              <Alert
                title="Auto-Entities Card"
                description="This card automatically populates entities based on filter criteria. Use the YAML editor to configure include/exclude filters, sorting, and the card type to display."
                type="info"
                showIcon
              />

              <Alert
                title="Example Configuration"
                description={
                  <div style={{ fontFamily: 'monospace', fontSize: '11px', marginTop: '8px' }}>
                    filter:<br />
                    &nbsp;&nbsp;include:<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;- domain: light<br />
                    &nbsp;&nbsp;exclude:<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;- state: unavailable<br />
                    card:<br />
                    &nbsp;&nbsp;type: entities
                  </div>
                }
                type="info"
                showIcon
                style={{ marginTop: '12px' }}
              />
            </>
          )}

          {card.type === 'custom:multiple-entity-row' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Entity</span>}
                name="entity"
                help={<span style={{ color: '#666' }}>Primary entity</span>}
              >
                <EntitySelect data-testid="entity-select" placeholder="Select entity" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Name</span>}
                name="name"
                help={<span style={{ color: '#666' }}>Override entity name</span>}
              >
                <Input placeholder="Entity name (optional)" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Secondary Info</span>}
                name="secondary_info"
                help={<span style={{ color: '#666' }}>Secondary information to display</span>}
              >
                <Select
                  placeholder="Select secondary info"
                  options={[
                    { value: 'entity-id', label: 'Entity ID' },
                    { value: 'last-changed', label: 'Last Changed' },
                    { value: 'last-updated', label: 'Last Updated' },
                  ]}
                />
              </Form.Item>

              <Alert
                title="Multiple Entities"
                description="Use the YAML editor to add additional entities in the 'entities' array to display multiple entity states on a single row."
                type="info"
                showIcon
                style={{ marginTop: '16px' }}
              />
            </>
          )}

          {card.type === 'custom:fold-entity-row' && (
            <>
              <Alert
                title="Collapsible Row"
                description="This creates a collapsible section in an entities card. Use the YAML editor to configure the 'head' entity and 'items' array."
                type="info"
                showIcon
              />

              <Alert
                title="Example Configuration"
                description={
                  <div style={{ fontFamily: 'monospace', fontSize: '11px', marginTop: '8px' }}>
                    head:<br />
                    &nbsp;&nbsp;type: section<br />
                    &nbsp;&nbsp;label: Living Room<br />
                    items:<br />
                    &nbsp;&nbsp;- entity: light.living_room<br />
                    &nbsp;&nbsp;- entity: switch.tv
                  </div>
                }
                type="info"
                showIcon
                style={{ marginTop: '12px' }}
              />
            </>
          )}

          {card.type === 'custom:decluttering-card' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Template Name</span>}
                name="template"
                help={<span style={{ color: '#666' }}>Name of the template to use</span>}
              >
                <Input placeholder="template_name" />
              </Form.Item>

              <Alert
                title="Template Card"
                description="Decluttering card uses templates defined in your dashboard configuration. Use the YAML editor to pass variables to the template."
                type="info"
                showIcon
                style={{ marginTop: '16px' }}
              />
            </>
          )}

          {card.type === 'custom:mushroom-chips-card' && (
            <>
              <Alert
                title="Chips Card"
                description="Mushroom Chips card displays compact chip-style controls. Use the YAML editor to configure the 'chips' array with various chip types (entity, back, spacer, weather, etc.)."
                type="info"
                showIcon
              />

              <Alert
                title="Example Configuration"
                description={
                  <div style={{ fontFamily: 'monospace', fontSize: '11px', marginTop: '8px' }}>
                    chips:<br />
                    &nbsp;&nbsp;- type: entity<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;entity: light.kitchen<br />
                    &nbsp;&nbsp;- type: weather<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;entity: weather.home
                  </div>
                }
                type="info"
                showIcon
                style={{ marginTop: '12px' }}
              />
            </>
          )}

          {card.type === 'custom:mushroom-template-card' && (
            <>
              <Form.Item
                label={<span style={{ color: 'white' }}>Primary Text</span>}
                name="primary"
                help={<span style={{ color: '#666' }}>Primary text (supports templates)</span>}
              >
                <Input placeholder="Template text" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Secondary Text</span>}
                name="secondary"
                help={<span style={{ color: '#666' }}>Secondary text (supports templates)</span>}
              >
                <Input placeholder="Template text" />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'white' }}>Icon</span>}
                name="icon"
                help={<span style={{ color: '#666' }}>Icon to display</span>}
              >
                <IconSelect placeholder="Select icon" />
              </Form.Item>

              <Alert
                title="Template Card"
                description="Template card supports Jinja2 templates for dynamic content. Use the YAML editor for advanced templating with entity states and attributes."
                type="info"
                showIcon
                style={{ marginTop: '16px' }}
              />
            </>
          )}

          {card.type === 'spacer' && (
            <Alert
              title="Spacer Card"
              description="This is an empty spacer card used for layout. It has no configurable properties."
              type="info"
              showIcon
            />
          )}

          {/* Generic fallback for layout cards and other types */}
          {!['entities', 'glance', 'button', 'markdown', 'sensor', 'gauge', 'history-graph', 'picture', 'picture-entity', 'picture-glance', 'light', 'thermostat', 'media-control', 'weather-forecast', 'map', 'alarm-panel', 'plant-status', 'custom:mini-graph-card', 'custom:button-card', 'custom:mushroom-entity-card', 'custom:mushroom-light-card', 'custom:mushroom-climate-card', 'custom:mushroom-cover-card', 'custom:mushroom-fan-card', 'custom:mushroom-switch-card', 'custom:mushroom-chips-card', 'custom:mushroom-title-card', 'custom:mushroom-template-card', 'custom:mushroom-select-card', 'custom:mushroom-number-card', 'custom:mushroom-person-card', 'custom:mushroom-media-player-card', 'custom:mushroom-lock-card', 'custom:mushroom-alarm-control-panel-card', 'custom:mushroom-vacuum-card', 'horizontal-stack', 'vertical-stack', 'grid', 'conditional', 'spacer', 'custom:swiper-card', 'custom:apexcharts-card', 'custom:bubble-card', 'custom:better-thermostat-ui-card', 'custom:power-flow-card', 'custom:power-flow-card-plus', 'custom:webrtc-camera', 'custom:surveillance-card', 'custom:frigate-card', 'custom:camera-card', 'custom:card-mod', 'custom:auto-entities', 'custom:vertical-stack-in-card', 'custom:mini-media-player', 'custom:multiple-entity-row', 'custom:fold-entity-row', 'custom:slider-entity-row', 'custom:battery-state-card', 'custom:simple-swipe-card', 'custom:decluttering-card'].includes(card.type) && (
            <div style={{ color: '#888', fontSize: '12px' }}>
              <Text style={{ color: '#888' }}>
                Property editor for {card.type} cards is not yet implemented.
              </Text>
              <br />
              <Text style={{ color: '#666' }}>
                {['horizontal-stack', 'vertical-stack', 'grid'].includes(card.type)
                  ? 'Layout cards contain other cards. Edit the YAML file directly to configure nested cards.'
                  : 'Edit the YAML file directly to modify this card.'}
              </Text>
            </div>
          )}
                </Form>
              </div>
            ),
          },
          {
            key: 'style',
            label: 'Advanced Options',
            children: (
              <div style={{ height: 'calc(100vh - 280px)', overflow: 'auto' }}>
                <Form
                  form={form}
                  layout="vertical"
                  onValuesChange={handleValuesChange}
                >
                  {card.type === 'custom:button-card' && (
                    <>
                      <Form.Item
                        label={<span style={{ color: 'white' }}>Color Type</span>}
                        name="color_type"
                        help={<span style={{ color: '#666' }}>How to color the button</span>}
                      >
                        <Select
                          placeholder="Select color type"
                          options={[
                            { value: 'icon', label: 'Icon' },
                            { value: 'card', label: 'Card' },
                            { value: 'label-card', label: 'Label Card' },
                          ]}
                        />
                      </Form.Item>

                      <Form.Item
                        label={<span style={{ color: 'white' }}>Color</span>}
                        name="color"
                        help={<span style={{ color: '#666' }}>Button color (type 'auto' or pick a custom color)</span>}
                      >
                        <ColorPickerInput
                          placeholder="auto or pick a color"
                          data-testid="button-card-color-input"
                        />
                      </Form.Item>

                      <Form.Item
                        label={<span style={{ color: 'white' }}>Icon Color</span>}
                        help={<span style={{ color: '#666' }}>Configure icon color behavior</span>}
                      >
                        <Space direction="vertical" style={{ width: '100%' }} size="small">
                          <div data-testid="button-card-icon-color-mode">
                            <Form.Item name="icon_color_mode" noStyle>
                              <Select
                                placeholder="Select icon color mode"
                                options={[
                                  { value: 'default', label: 'Default (follow button)' },
                                  { value: 'custom', label: 'Custom' },
                                  { value: 'state', label: 'State-based' },
                                  { value: 'attribute', label: 'Attribute-based' },
                                ]}
                              />
                            </Form.Item>
                          </div>
                          <Form.Item noStyle shouldUpdate={(prev, curr) => prev.icon_color_mode !== curr.icon_color_mode}>
                            {({ getFieldValue }) => {
                              const mode = getFieldValue('icon_color_mode') as string | undefined;
                              if (mode === 'state') {
                                return (
                                  <Space direction="vertical" style={{ width: '100%' }}>
                                    <Form.Item name={['icon_color_states', 'on']} label="On" colon={false}>
                                      <ColorPickerInput data-testid="button-card-icon-color-state-on" />
                                    </Form.Item>
                                    <Form.Item name={['icon_color_states', 'off']} label="Off" colon={false}>
                                      <ColorPickerInput data-testid="button-card-icon-color-state-off" />
                                    </Form.Item>
                                    <Form.Item name={['icon_color_states', 'unavailable']} label="Unavailable" colon={false}>
                                      <ColorPickerInput data-testid="button-card-icon-color-state-unavailable" />
                                    </Form.Item>
                                  </Space>
                                );
                              }
                              if (mode === 'attribute') {
                                return (
                                  <Form.Item
                                    name="icon_color_attribute"
                                    label={<span style={{ color: 'white' }}>Attribute</span>}
                                    help={<span style={{ color: '#666' }}>Attribute value must be a valid color string</span>}
                                    colon={false}
                                  >
                                    <Input placeholder="e.g. icon_color" data-testid="button-card-icon-color-attribute" />
                                  </Form.Item>
                                );
                              }
                              if (mode === 'custom') {
                                return (
                                  <Form.Item
                                    name="icon_color"
                                    label={<span style={{ color: 'white' }}>Custom Icon Color</span>}
                                    colon={false}
                                  >
                                    <ColorPickerInput
                                      placeholder="Pick icon color"
                                      data-testid="button-card-icon-color-input"
                                    />
                                  </Form.Item>
                                );
                              }
                              return null;
                            }}
                          </Form.Item>
                        </Space>
                      </Form.Item>

                      <Form.Item
                        label={<span style={{ color: 'white' }}>Size</span>}
                        name="size"
                        help={<span style={{ color: '#666' }}>Button size percentage</span>}
                      >
                        <Input placeholder="40%" />
                      </Form.Item>

                      <Form.Item
                        label={<span style={{ color: 'white' }}>Show Name</span>}
                        name="show_name"
                      >
                        <Select
                          placeholder="Select option"
                          options={[
                            { value: true, label: 'Show' },
                            { value: false, label: 'Hide' },
                          ]}
                        />
                      </Form.Item>

                      <Form.Item
                        label={<span style={{ color: 'white' }}>Show State</span>}
                        name="show_state"
                      >
                        <Select
                          placeholder="Select option"
                          options={[
                            { value: true, label: 'Show' },
                            { value: false, label: 'Hide' },
                          ]}
                        />
                      </Form.Item>

                      <Form.Item
                        label={<span style={{ color: 'white' }}>Show Icon</span>}
                        name="show_icon"
                      >
                        <Select
                          placeholder="Select option"
                          options={[
                            { value: true, label: 'Show' },
                            { value: false, label: 'Hide' },
                          ]}
                        />
                      </Form.Item>

                      {renderHapticConfig('custom-button-card')}
                      {renderSoundConfig('custom-button-card')}
                    </>
                  )}

                  <Form.Item
                    label={<span style={{ color: 'white' }}>Background</span>}
                    colon={false}
                  >
                    <BackgroundCustomizer
                      value={backgroundConfig}
                      onChange={handleBackgroundConfigChange}
                    />
                  </Form.Item>

                  <Form.Item
                    label={<span style={{ color: 'white' }}>Style (CSS)</span>}
                    name="style"
                    help={<span style={{ color: '#666' }}>CSS applied to the card (background, color, padding, etc.)</span>}
                  >
                    <Input.TextArea
                      placeholder="background: linear-gradient(...);"
                      rows={6}
                      style={{ fontFamily: 'monospace' }}
                    />
                  </Form.Item>
                </Form>
              </div>
            ),
          },
          {
            key: 'yaml',
            label: 'YAML',
            children: (
              <div>
                <div style={{ marginBottom: '12px' }}>
                  <Button
                    data-testid="properties-yaml-insert-entity-button"
                    icon={<DatabaseOutlined />}
                    onClick={handleOpenEntityBrowserClick}
                    disabled={!onOpenEntityBrowser}
                    size="small"
                  >
                    Insert Entity
                  </Button>
                </div>
                {yamlError && (
                  <Alert
                    title="YAML Error"
                    description={yamlError}
                    type="error"
                    showIcon
                    style={{ marginBottom: '12px' }}
                  />
                )}
                <div
                  data-testid="yaml-editor-container"
                  ref={editorContainerRef}
                  style={{
                    height: 'calc(100vh - 280px)',
                    border: '1px solid #434343',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};
