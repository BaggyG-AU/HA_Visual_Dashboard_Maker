/**
 * Template selection dialog — UAT card FILE-03.
 *
 * ⚠ What this replaces: `handleCreateFromTemplate` in `src/App.tsx` was a
 * three-line stub that emitted `message.info('Template selection coming soon! For
 * now, creating a blank dashboard.')` and then called `createNewDashboard()`. The
 * round-1 tester saw exactly that.
 *
 * ⭐ This is WIRING, not a new feature. `src/services/templateService.ts` was
 * already complete — and had ZERO importers anywhere in the repo, so it had never
 * once executed. Per `ai_rules.md` §1 Immutable Reuse this dialog calls that
 * service and adds no second copy of template discovery, search or loading.
 *
 * ⚠ antd v6 notes applied here deliberately:
 *  - the testid for the search box sits on a WRAPPER `<div>`, because a
 *    `data-testid` on an antd component does not reliably reach the DOM node the
 *    test needs to type into;
 *  - `getByTestId` on a Modal is always reported hidden (antd puts it on
 *    `.ant-modal-root` while the visible node is `.ant-modal-wrap`), so the
 *    dialog's own "am I open" marker is `template-selection-content`, a plain
 *    `<div>` in the modal body;
 *  - every colour comes from a theme token. Hard-coded greys are what produced the
 *    round-1 dark-on-dark failures (`#666` recurs through `NewDashboardDialog`).
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Card, Row, Col, Input, Tag, Button, Spin, Alert, Empty, theme } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { templateService } from '../services/templateService';
import type { DashboardTemplate, TemplateCategory } from '../types/templates';
import { logger } from '../services/logger';

interface TemplateSelectionDialogProps {
  visible: boolean;
  onClose: () => void;
  /** Called with the chosen template's id; the caller loads it onto the canvas. */
  onSelect: (templateId: string) => void;
}

const DIFFICULTY_COLOUR: Record<string, string> = {
  beginner: 'green',
  intermediate: 'blue',
  advanced: 'volcano',
};

export const TemplateSelectionDialog: React.FC<TemplateSelectionDialogProps> = ({
  visible,
  onClose,
  onSelect,
}) => {
  const { token } = theme.useToken();
  const [templates, setTemplates] = useState<DashboardTemplate[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [matches, setMatches] = useState<DashboardTemplate[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load on every open rather than once on mount: a mount-only ([]) data load
  // would serve a stale — or, on the very first open, an empty — list forever.
  useEffect(() => {
    if (!visible) return;

    let cancelled = false;
    setLoading(true);
    setLoaded(false);
    setQuery('');

    void (async () => {
      try {
        const [loadedTemplates, loadedCategories] = await Promise.all([
          templateService.getTemplates(),
          templateService.getCategories(),
        ]);
        if (cancelled) return;
        setTemplates(loadedTemplates);
        setCategories(loadedCategories);
        setMatches(loadedTemplates);
      } catch (error) {
        // templateService.loadMetadata already swallows read failures and returns
        // empty metadata, so this is belt-and-braces; either way the empty list
        // below is reported honestly rather than shown as "no templates".
        if (cancelled) return;
        logger.error('Failed to load dashboard templates', error);
        setTemplates([]);
        setCategories([]);
        setMatches([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoaded(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [visible]);

  // Search runs through the SERVICE, not a copy of its logic re-written here.
  // The spec this card cited used to filter `templates.json` with an expression
  // written inline in the test body and assert its own reimplementation, while
  // `templateService.searchTemplates()` was never called by anything.
  useEffect(() => {
    if (!visible || !loaded) return;

    let cancelled = false;
    void (async () => {
      const trimmed = query.trim();
      const result =
        trimmed.length === 0 ? templates : await templateService.searchTemplates(trimmed);
      if (!cancelled) setMatches(result);
    })();

    return () => {
      cancelled = true;
    };
  }, [query, visible, loaded, templates]);

  const categoryNames = useMemo(() => {
    const byId = new Map(categories.map((c) => [c.id, c.name]));
    return byId;
  }, [categories]);

  const handleSelect = useCallback(
    (templateId: string) => {
      onSelect(templateId);
      onClose();
    },
    [onSelect, onClose],
  );

  // ⚠ Seven templates always ship, so an EMPTY list after a completed load can
  // only mean the metadata could not be read — which is precisely the packaging
  // failure this slice fixes. Reporting it as "no templates" would be the
  // dishonest-failure pattern; it gets a named error instead.
  const loadFailed = loaded && !loading && templates.length === 0;
  const noMatches = loaded && !loading && templates.length > 0 && matches.length === 0;

  return (
    <Modal
      title="Choose a Template"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      data-testid="template-selection-dialog"
      rootClassName="template-selection-dialog"
    >
      <div data-testid="template-selection-content">
        <p style={{ fontSize: 14, color: token.colorTextSecondary, marginTop: 0 }}>
          Pick a starting point. Every template is fully editable once it is on the canvas.
        </p>

        <div data-testid="template-selection-search" style={{ marginBottom: 12 }}>
          <Input
            allowClear
            placeholder="Search templates by name, description, tag or feature"
            prefix={<SearchOutlined />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search templates"
          />
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <Spin />
          </div>
        )}

        {loadFailed && (
          <div data-testid="template-selection-load-error">
            <Alert
              type="error"
              showIcon
              title="Could not load the dashboard templates"
              description={
                'The template files could not be read from this installation. ' +
                'You can still create a blank or sections dashboard.'
              }
            />
          </div>
        )}

        {!loading && !loadFailed && (
          <>
            <div
              data-testid="template-selection-count"
              style={{ marginBottom: 12, color: token.colorTextSecondary, fontSize: 13 }}
            >
              {`Showing ${matches.length} of ${templates.length}`}
            </div>

            {noMatches ? (
              <div data-testid="template-selection-no-matches">
                <Empty description={`No templates match "${query.trim()}"`} />
              </div>
            ) : (
              <Row gutter={[16, 16]}>
                {matches.map((template) => (
                  <Col xs={24} md={8} key={template.id}>
                    {/* The testid and the id live on a plain wrapper so the tile is
                        addressable and enumerable regardless of antd's internals. */}
                    <div
                      data-testid={`template-option-${template.id}`}
                      data-template-id={template.id}
                      style={{ height: '100%' }}
                    >
                      <Card
                        hoverable
                        onClick={() => handleSelect(template.id)}
                        style={{ height: '100%', cursor: 'pointer' }}
                        styles={{ body: { padding: 16 } }}
                      >
                        <h3
                          data-testid="template-option-name"
                          style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 600 }}
                        >
                          {template.name}
                        </h3>
                        <div style={{ marginBottom: 8 }}>
                          <Tag>{categoryNames.get(template.category) ?? template.category}</Tag>
                          <Tag color={DIFFICULTY_COLOUR[template.difficulty]}>
                            {template.difficulty}
                          </Tag>
                        </div>
                        <p
                          style={{
                            margin: 0,
                            color: token.colorTextSecondary,
                            fontSize: 13,
                          }}
                        >
                          {template.description}
                        </p>
                        {template.features.length > 0 && (
                          <p
                            style={{
                              margin: '8px 0 0 0',
                              color: token.colorTextTertiary,
                              fontSize: 12,
                            }}
                          >
                            {`${template.features.length} features`}
                          </p>
                        )}
                      </Card>
                    </div>
                  </Col>
                ))}
              </Row>
            )}
          </>
        )}

        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <Button data-testid="template-selection-cancel" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};
