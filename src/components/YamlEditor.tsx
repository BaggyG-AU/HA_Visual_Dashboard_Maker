import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Alert, Space, Button, Tooltip } from 'antd';
import { FormatPainterOutlined, AlignLeftOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import * as monaco from 'monaco-editor';
import { configureYamlSchema } from '../monaco-setup';
import { yamlService } from '../services/yamlService';
import { ENTITY_CONTEXT_REGEX } from '../services/entityContext';

type TestWindow = Window & {
  E2E?: string;
  PLAYWRIGHT_TEST?: string;
  __monacoEditor?: monaco.editor.IStandaloneCodeEditor;
  __monacoModel?: monaco.editor.ITextModel | null;
  __bypassYamlValidation?: boolean;
};

const getTestWindow = (): TestWindow | undefined => {
  if (typeof window === 'undefined') return undefined;
  return window as TestWindow;
};

const shouldBypassValidation = (isTestEnv: boolean): boolean => {
  const testWindow = getTestWindow();
  return Boolean(isTestEnv && testWindow?.__bypassYamlValidation);
};

export interface YamlEditorProps {
  /** Initial YAML content */
  value: string;

  /** Callback when Monaco editor is ready (provides editor instance) */
  onEditorReady?: (editor: monaco.editor.IStandaloneCodeEditor) => void;

  /** Callback when YAML content changes (debounced) */
  onChange?: (value: string) => void;

  /** Callback when validation status changes */
  onValidationChange?: (isValid: boolean, error: string | null) => void;

  /** Height of the editor */
  height?: string | number;

  /** Whether to show validation alerts */
  showValidationAlerts?: boolean;

  /** Whether to show formatting controls */
  showFormattingControls?: boolean;

  /** Read-only mode */
  readOnly?: boolean;

  /** Debounce delay for onChange (ms) */
  debounceDelay?: number;

  /** Selected card position to jump to (viewIndex, cardIndex) */
  jumpToCard?: { viewIndex: number; cardIndex: number } | null;
}

const detectTestEnv = (): boolean => {
  const importMetaEnvHolder =
    typeof import.meta !== 'undefined' ? (import.meta as unknown as { env?: Record<string, string | undefined> }) : undefined;
  const importMetaEnv: Record<string, string | undefined> = importMetaEnvHolder?.env ?? {};

  return (
    (typeof process !== 'undefined' &&
      (process.env.NODE_ENV === 'test' || process.env.E2E === '1' || process.env.PLAYWRIGHT_TEST === '1')) ||
    (typeof navigator !== 'undefined' && /Playwright/i.test(navigator.userAgent)) ||
    (() => {
      const testWindow = getTestWindow();
      return Boolean(testWindow?.E2E || testWindow?.PLAYWRIGHT_TEST);
    })() ||
    importMetaEnv.E2E === '1' ||
    importMetaEnv.PLAYWRIGHT_TEST === '1'
  );
};

let entityContextCompletionRegistered = false;

const registerEntityContextCompletions = () => {
  if (entityContextCompletionRegistered) return;

  monaco.languages.registerCompletionItemProvider('yaml', {
    triggerCharacters: ['[', '{'],
    provideCompletionItems: () => {
      const suggestions: monaco.languages.CompletionItem[] = [
        {
          label: '[[entity.state]]',
          kind: monaco.languages.CompletionItemKind.Variable,
          insertText: '[[entity.state]]',
          documentation: 'Entity state value',
        },
        {
          label: '[[entity.friendly_name]]',
          kind: monaco.languages.CompletionItemKind.Variable,
          insertText: '[[entity.friendly_name]]',
          documentation: 'Entity friendly name',
        },
        {
          label: '[[entity.entity_id]]',
          kind: monaco.languages.CompletionItemKind.Variable,
          insertText: '[[entity.entity_id]]',
          documentation: 'Entity ID',
        },
        {
          label: '[[entity.domain]]',
          kind: monaco.languages.CompletionItemKind.Variable,
          insertText: '[[entity.domain]]',
          documentation: 'Entity domain (light, switch, etc.)',
        },
        {
          label: '[[entity.attributes.battery]]',
          kind: monaco.languages.CompletionItemKind.Variable,
          insertText: '[[entity.attributes.battery]]',
          documentation: 'Entity attribute access',
        },
        {
          label: '[[light.living_room.state]]',
          kind: monaco.languages.CompletionItemKind.Variable,
          insertText: '[[light.living_room.state]]',
          documentation: 'Explicit entity reference',
        },
        {
          label: '[[entity.state|upper]]',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: '[[entity.state|upper]]',
          documentation: 'Uppercase formatting',
        },
        {
          label: '[[entity.state|lower]]',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: '[[entity.state|lower]]',
          documentation: 'Lowercase formatting',
        },
        {
          label: '[[entity.attributes.temperature|round(1)]]',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: '[[entity.attributes.temperature|round(1)]]',
          documentation: 'Round to 1 decimal',
        },
        {
          label: '[[entity.state|default(\'Unknown\')]]',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: '[[entity.state|default(\'Unknown\')]]',
          documentation: 'Fallback value when empty',
        },
      ];

      return { suggestions };
    },
  });

  entityContextCompletionRegistered = true;
};

/**
 * Reusable YAML Editor Component
 *
 * Features:
 * - Monaco Editor with YAML syntax highlighting
 * - Real-time validation with inline markers
 * - Autocomplete using HA dashboard schema
 * - Formatting controls (pretty-print, indent)
 * - Jump to card functionality
 * - Debounced onChange for performance
 */
export const YamlEditor: React.FC<YamlEditorProps> = ({
  value,
  onEditorReady,
  onChange,
  onValidationChange,
  height = '500px',
  showValidationAlerts = true,
  showFormattingControls = true,
  readOnly = false,
  debounceDelay = 300,
  jumpToCard = null,
}) => {
  const isTestEnv = detectTestEnv();
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const schemaConfiguredRef = useRef(false);
  const contextDecorationsRef = useRef<string[]>([]);

  // Configure YAML schema once
  useEffect(() => {
    if (!schemaConfiguredRef.current) {
      configureYamlSchema()
        .then(() => {
          schemaConfiguredRef.current = true;
        })
        .catch((error) => {
          // Schema configuration failed, but YAML editor will still work
          // Just won't have autocomplete/schema validation
          console.warn('YAML schema autocomplete unavailable:', error.message);
          schemaConfiguredRef.current = true; // Mark as configured to avoid retry
        });
    }
  }, []);

  // Create Monaco editor
  useEffect(() => {
    if (!editorContainerRef.current) return;

    const editor = monaco.editor.create(editorContainerRef.current, {
      value,
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
      readOnly,
      formatOnPaste: true,
      formatOnType: true,
    });

    monacoEditorRef.current = editor;
    onEditorReady?.(editor);
    registerEntityContextCompletions();

    const applyContextDecorations = () => {
      const model = editor.getModel();
      if (!model) return;

      const text = model.getValue();
      const regex = new RegExp(ENTITY_CONTEXT_REGEX.source, 'g');
      const decorations: monaco.editor.IModelDeltaDecoration[] = [];
      let match: RegExpExecArray | null;

      while ((match = regex.exec(text)) !== null) {
        const start = model.getPositionAt(match.index);
        const end = model.getPositionAt(match.index + match[0].length);
        decorations.push({
          range: new monaco.Range(start.lineNumber, start.column, end.lineNumber, end.column),
          options: { inlineClassName: 'entity-context-token' },
        });
      }

      contextDecorationsRef.current = editor.deltaDecorations(contextDecorationsRef.current, decorations);
    };

    applyContextDecorations();

    // Expose for tests
    if (isTestEnv) {
      const testWindow = getTestWindow();
      if (testWindow) {
        testWindow.__monacoEditor = editor;
        testWindow.__monacoModel = editor.getModel();
      }
    }

    // Add aria-label for accessibility
    const domNode = editor.getDomNode();
    const textarea = domNode?.querySelector('textarea');
    if (textarea) {
      textarea.setAttribute('aria-label', 'YAML editor');
    }

    // Listen for content changes with debouncing
    const disposable = editor.onDidChangeModelContent(() => {
      const newValue = editor.getValue();

      applyContextDecorations();

      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Validate immediately (for UI feedback)
      validateYaml(newValue);

      // Debounce onChange callback
      if (onChange) {
        debounceTimerRef.current = setTimeout(() => {
          onChange(newValue);
        }, debounceDelay);
      }
    });

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      disposable.dispose();
      editor.dispose();
      monacoEditorRef.current = null;
      contextDecorationsRef.current = [];

      if (isTestEnv) {
        const testWindow = getTestWindow();
        if (testWindow) {
          delete testWindow.__monacoEditor;
          delete testWindow.__monacoModel;
        }
      }
    };
  }, [readOnly]); // Only recreate when readOnly changes

  // Update editor value when prop changes (external updates)
  useEffect(() => {
    if (monacoEditorRef.current) {
      const currentValue = monacoEditorRef.current.getValue();
      if (currentValue !== value) {
        monacoEditorRef.current.setValue(value);
        validateYaml(value);
      }
    }
  }, [value]);

  // Validate YAML
  const validateYaml = useCallback((yaml: string) => {
    const bypassValidation = shouldBypassValidation(isTestEnv);

    try {
      const syntax = yamlService.validateYAMLSyntax(yaml);
      if (!syntax.valid) {
        setValidationError(syntax.error ?? 'Invalid YAML syntax');
        setIsValid(false);
        onValidationChange?.(false, syntax.error ?? 'Invalid YAML syntax');
        return;
      }

      if (bypassValidation) {
        setValidationError(null);
        setIsValid(true);
        onValidationChange?.(true, null);
        return;
      }

      const result = yamlService.parseDashboard(yaml);
      if (!result.success) {
        setValidationError(result.error ?? 'Invalid dashboard structure');
        setIsValid(false);
        onValidationChange?.(false, result.error ?? 'Invalid dashboard structure');
      } else {
        setValidationError(null);
        setIsValid(true);
        onValidationChange?.(true, null);
      }
    } catch (error) {
      const errMsg = (error as Error).message;
      setValidationError(errMsg);
      setIsValid(false);
      onValidationChange?.(false, errMsg);
    }
  }, [onValidationChange]);

  // Jump to card in YAML
  useEffect(() => {
    if (!jumpToCard || !monacoEditorRef.current) return;

    const editor = monacoEditorRef.current;
    const model = editor.getModel();
    if (!model) return;

    try {
      // Parse current YAML to find card position
      const yaml = editor.getValue();
      const result = yamlService.parseDashboard(yaml);

      if (!result.success || !result.data) return;

      const { viewIndex, cardIndex } = jumpToCard;
      const view = result.data.views[viewIndex];
      if (!view || !view.cards || !view.cards[cardIndex]) return;

      // Search for the card in the YAML text
      // This is a simple approach - we look for the card type line
      const card = view.cards[cardIndex];
      const searchText = `type: ${card.type}`;

      // Find all matches and pick the one at the right position
      const lines = yaml.split('\n');
      let cardOccurrence = 0;
      let targetLine = -1;

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(searchText)) {
          if (cardOccurrence === cardIndex) {
            targetLine = i + 1; // Monaco uses 1-based line numbers
            break;
          }
          cardOccurrence++;
        }
      }

      if (targetLine > 0) {
        // Jump to line and highlight
        editor.revealLineInCenter(targetLine);
        editor.setSelection(new monaco.Selection(targetLine, 1, targetLine, lines[targetLine - 1].length + 1));
        editor.focus();
      }
    } catch (error) {
      console.error('Failed to jump to card:', error);
    }
  }, [jumpToCard]);

  // Format YAML (pretty-print)
  const handleFormat = useCallback(() => {
    if (!monacoEditorRef.current) return;

    const editor = monacoEditorRef.current;
    const currentValue = editor.getValue();
    const formatted = yamlService.formatYAML(currentValue);

    if (formatted) {
      editor.setValue(formatted);
      setValidationError(null);
      setIsValid(true);
    }
  }, []);

  // Fix indentation
  const handleFixIndent = useCallback(() => {
    if (!monacoEditorRef.current) return;

    const editor = monacoEditorRef.current;

    // Trigger Monaco's built-in formatting
    editor.getAction('editor.action.formatDocument')?.run();
  }, []);

  return (
    <div data-testid="yaml-editor-component">
      {showFormattingControls && (
        <div style={{ marginBottom: '8px' }}>
          <Space>
            <Tooltip title="Format YAML with consistent indentation and spacing">
              <Button
                size="small"
                icon={<FormatPainterOutlined />}
                onClick={handleFormat}
                disabled={readOnly}
              >
                Format YAML
              </Button>
            </Tooltip>
            <Tooltip title="Fix indentation using 2-space tabs">
              <Button
                size="small"
                icon={<AlignLeftOutlined />}
                onClick={handleFixIndent}
                disabled={readOnly}
              >
                Fix Indent
              </Button>
            </Tooltip>
            {isValid && (
              <span style={{ color: '#52c41a', fontSize: '12px' }}>
                <CheckCircleOutlined /> Valid YAML
              </span>
            )}
            {!isValid && validationError && (
              <span style={{ color: '#ff4d4f', fontSize: '12px' }}>
                <ExclamationCircleOutlined /> Validation Error
              </span>
            )}
          </Space>
        </div>
      )}

      {showValidationAlerts && validationError && (
        <Alert
          data-testid="yaml-validation-error"
          title="YAML Validation Error"
          description={validationError}
          type="error"
          showIcon
          closable
          onClose={() => setValidationError(null)}
          style={{ marginBottom: '8px' }}
        />
      )}

      <div
        data-testid="yaml-editor-monaco"
        ref={editorContainerRef}
        style={{
          border: '1px solid #434343',
          borderRadius: '4px',
          height: typeof height === 'number' ? `${height}px` : height,
          overflow: 'hidden',
        }}
      />
    </div>
  );
};
