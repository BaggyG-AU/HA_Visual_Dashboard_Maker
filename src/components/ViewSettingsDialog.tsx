import React from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Space,
  Typography,
  Divider,
  Alert,
} from 'antd';
import { DeleteOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import type { View } from '../types/dashboard';
import {
  normalizeViewType,
  STANDARD_VIEW_TYPES,
  type ViewPropsPatch,
  type ViewGridPatch,
} from '../utils/viewsLayout';
import { isLayoutCardViewType } from '../services/haExportContract';

const { Text } = Typography;

/** Human labels for the real HA view types offered in the type editor. */
const VIEW_TYPE_LABELS: Record<string, string> = {
  masonry: 'Masonry',
  sections: 'Sections',
  panel: 'Panel',
  sidebar: 'Sidebar',
};

/**
 * The layout-card grid type the editor offers as a conversion target (slice
 * 4.7b). Deliberately NOT added to `STANDARD_VIEW_TYPES` — that constant is the
 * set of real Home Assistant BUILT-IN view types, and layout-card is a HACS
 * custom card that may not be installed. The label carries the raw type string
 * so the user can see exactly what will deploy.
 */
const LAYOUT_CARD_GRID_TYPE = 'custom:grid-layout';
const LAYOUT_CARD_GRID_LABEL = 'Layout card grid (custom:grid-layout)';

interface ViewSettingsFormValues {
  title?: string;
  path?: string;
  icon?: string;
  viewType?: string;
  panel?: boolean;
  subview?: boolean;
  back_path?: string;
  visibleInNav?: boolean;
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridGap?: string;
}

/**
 * What Save emits: the identity patch, the chosen (normalised) view type, and —
 * for a layout-card view — the grid patch (slice 4.7b).
 */
export interface ViewSettingsChange {
  patch: ViewPropsPatch;
  type: string;
  grid?: ViewGridPatch;
}

interface ViewSettingsDialogProps {
  open: boolean;
  /** The view being edited (the currently-selected view). */
  view: View | null;
  /** Its index, and the total view count — drive the position/reorder controls. */
  viewIndex: number | null;
  viewCount: number;
  onClose: () => void;
  /** Commit the identity-property patch + chosen view type (the parent orchestrates any conversion). */
  onSubmit: (change: ViewSettingsChange) => void;
  /** Delete this view (the parent decides on confirmation + selection fix-up). */
  onDelete: () => void;
  /** Reorder this view one slot left (-1) or right (+1). */
  onMove: (direction: -1 | 1) => void;
}

/**
 * View-level properties editor (Tier 4, slice 4.6a).
 *
 * A self-contained antd Modal — deliberately SEPARATE from the card
 * `PropertiesPanel`, whose form↔card↔Monaco feedback cycle has historically
 * blanked the app (React #185 + root unmount). This dialog renders in a portal
 * (out-of-flow, so it never shifts the flat canvas and can't break the
 * position-sensitive layout.visual clip), holds only local antd form state, and
 * commits once via a pure helper on Save. `destroyOnHidden` remounts the form on
 * every open so it can never show a stale value from a previous view.
 */
export const ViewSettingsDialog: React.FC<ViewSettingsDialogProps> = ({
  open,
  view,
  viewIndex,
  viewCount,
  onClose,
  onSubmit,
  onDelete,
  onMove,
}) => {
  const [form] = Form.useForm<ViewSettingsFormValues>();

  // `visible` may be a conditions array (advanced). A boolean toggle can't
  // represent that, so we only edit `visible` when it is boolean|absent, and
  // leave a conditional `visible` untouched.
  const visibleIsConditional = Array.isArray(view?.visible);

  // The current (normalised) view type — HAVDM's canvas scaffold reads as
  // masonry. Slice 4.7a: a user's REAL custom:grid-layout view reads as itself.
  const currentType = view ? normalizeViewType(view) : 'masonry';

  // The type options: the four real HA types, the layout-card grid type (slice
  // 4.7b — choosing it CONVERTS this view into a real layout-card view), plus
  // the current type if it is some other real layout-card (custom:*-layout) so
  // it stays selectable and is never silently converted.
  const typeOptions = [
    ...(STANDARD_VIEW_TYPES as readonly string[]).map((t) => ({
      value: t,
      label: VIEW_TYPE_LABELS[t] ?? t,
    })),
    { value: LAYOUT_CARD_GRID_TYPE, label: LAYOUT_CARD_GRID_LABEL },
    ...((STANDARD_VIEW_TYPES as readonly string[]).includes(currentType) ||
    currentType === LAYOUT_CARD_GRID_TYPE
      ? []
      : [{ value: currentType, label: `Custom layout (${currentType})` }]),
  ];

  // Slice 4.7b: the grid fields are raw CSS strings, so any layout-card grid —
  // `1fr 2fr 1fr`, `minmax(...)`, named areas — round-trips instead of being
  // rewritten by a numeric control that could not model it.
  const initialGrid = {
    gridTemplateColumns: view?.layout?.grid_template_columns ?? '',
    gridTemplateRows: view?.layout?.grid_template_rows ?? '',
    gridGap: view?.layout?.grid_gap ?? '',
  };

  const initialValues: ViewSettingsFormValues = {
    title: view?.title ?? '',
    path: view?.path ?? '',
    icon: view?.icon ?? '',
    viewType: currentType,
    panel: view?.panel ?? false,
    subview: view?.subview ?? false,
    back_path: view?.back_path ?? '',
    visibleInNav: view?.visible === false ? false : true,
    ...initialGrid,
  };

  // A live warning for structural (potentially lossy) type changes. The visible
  // warning + an explicit Save is the FR-026 confirmation — never a silent loss.
  const pendingType = (Form.useWatch('viewType', form) as string | undefined) ?? currentType;
  let typeChangeWarning: string | null = null;
  if (pendingType !== currentType) {
    if (pendingType === 'sections') {
      typeChangeWarning =
        'Converting to Sections moves all cards into one section; card positions reset to full width. Cards are preserved.';
    } else if (currentType === 'sections') {
      typeChangeWarning =
        'Converting away from Sections flattens all cards into a single list (preserved). Each section heading becomes a Markdown card.';
    } else if (isLayoutCardViewType(currentType) && !isLayoutCardViewType(pendingType)) {
      // Slice 4.7a: leaving a layout-card view for a standard HA type. The grid
      // config is KEPT in HAVDM (switch back and it returns) but Home Assistant
      // ignores it on this type, so it will not be deployed. Saying so is the
      // FR-026 confirmation — nothing is destroyed silently.
      typeChangeWarning =
        'This view uses a layout-card grid. Home Assistant ignores that grid on the new type, so it will not be deployed — the configuration is kept in HAVDM if you switch back.';
    } else if (!isLayoutCardViewType(currentType) && isLayoutCardViewType(pendingType)) {
      // Slice 4.7b: converting INTO a real layout-card view. layout-card is a
      // HACS custom card, not a built-in HA view type — if it is not installed
      // the view will not render at all. HAVDM cannot verify that from here, so
      // it must be said plainly before the user saves.
      typeChangeWarning =
        'This converts the view into a real layout-card view and deploys it as custom:grid-layout. Home Assistant needs the layout-card custom card installed, or this view will not render.';
    }
  }

  // The grid editor applies to any layout-card view — the one being edited, or
  // the one the user is about to convert this into.
  const showGridEditor = isLayoutCardViewType(pendingType);

  const handleSave = () => {
    const values = form.getFieldsValue();
    const patch: ViewPropsPatch = {
      title: values.title,
      path: values.path,
      icon: values.icon,
      // Unchecked toggles clear the key (undefined) so we never deploy a noisy
      // `panel: false` / `subview: false`.
      panel: values.panel ? true : undefined,
      subview: values.subview ? true : undefined,
      // back_path only means anything for a subview; drop it otherwise.
      back_path: values.subview ? values.back_path : undefined,
    };
    if (!visibleIsConditional) {
      // Checked (default) => clear the key (visible by default); unchecked =>
      // `visible: false` (hidden from navigation).
      patch.visible = values.visibleInNav ? undefined : false;
    }

    const nextType = values.viewType ?? currentType;

    // Slice 4.7b: only emit a grid patch for a layout-card view, and only for
    // fields the user actually touched. An empty field means "leave this alone"
    // UNLESS it had a value on open — that is a deliberate clear. Omitting empty
    // untouched fields is what stops a fresh conversion from immediately wiping
    // the default grid it was just given.
    let grid: ViewGridPatch | undefined;
    if (isLayoutCardViewType(nextType)) {
      const next: ViewGridPatch = {};
      const apply = (key: keyof ViewGridPatch, value: string | undefined, initial: string) => {
        const trimmed = (value ?? '').trim();
        if (trimmed) next[key] = trimmed;
        else if (initial) next[key] = '';
      };
      apply('grid_template_columns', values.gridTemplateColumns, initialGrid.gridTemplateColumns);
      apply('grid_template_rows', values.gridTemplateRows, initialGrid.gridTemplateRows);
      apply('grid_gap', values.gridGap, initialGrid.gridGap);
      if (Object.keys(next).length > 0) grid = next;
    }

    onSubmit({ patch, type: nextType, grid });
  };

  const canMoveLeft = viewIndex !== null && viewIndex > 0;
  const canMoveRight = viewIndex !== null && viewIndex < viewCount - 1;

  return (
    <Modal
      title="View settings"
      open={open}
      onCancel={onClose}
      destroyOnHidden
      width={480}
      data-testid="view-settings-dialog"
      rootClassName="view-settings-dialog"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={onDelete}
            disabled={viewCount <= 1}
            data-testid="view-settings-delete"
          >
            Delete view
          </Button>
          <Space>
            <Button onClick={onClose} data-testid="view-settings-cancel">
              Cancel
            </Button>
            <Button type="primary" onClick={handleSave} data-testid="view-settings-save">
              Save
            </Button>
          </Space>
        </div>
      }
    >
      <Form form={form} layout="vertical" initialValues={initialValues} preserve={false}>
        <Form.Item label="Title" name="title">
          <Input placeholder="Home" data-testid="view-settings-title" />
        </Form.Item>
        <Form.Item
          label="Path"
          name="path"
          help="URL segment for this view (must be unique across the dashboard)."
        >
          <Input placeholder="home" data-testid="view-settings-path" />
        </Form.Item>
        <Form.Item label="Icon" name="icon" help="Material Design Icon, e.g. mdi:home.">
          <Input placeholder="mdi:home" data-testid="view-settings-icon" />
        </Form.Item>

        <Form.Item
          label="View type"
          name="viewType"
          help="How Home Assistant lays this view out. Sections is the modern grid; masonry/panel/sidebar are flat layouts."
        >
          <Select options={typeOptions} data-testid="view-settings-type" />
        </Form.Item>
        {typeChangeWarning && (
          <Alert
            type="warning"
            showIcon
            message={typeChangeWarning}
            style={{ marginBottom: 16 }}
            data-testid="view-settings-type-warning"
          />
        )}

        {showGridEditor && (
          <div data-testid="view-settings-grid-editor">
            {/* antd v6: section titles are placed with `titlePlacement`; the v5
                `orientation="left"` now means the divider's own axis. */}
            <Divider style={{ margin: '12px 0' }} titlePlacement="start">
              <Text type="secondary" style={{ fontSize: 12 }}>
                Layout-card grid
              </Text>
            </Divider>
            <Form.Item
              label="Columns"
              name="gridTemplateColumns"
              help="CSS grid-template-columns, e.g. repeat(12, 1fr) or 1fr 2fr 1fr. The canvas renders this column count."
            >
              <Input
                placeholder="repeat(12, 1fr)"
                data-testid="view-settings-grid-columns"
                autoComplete="off"
              />
            </Form.Item>
            <Form.Item
              label="Row height"
              name="gridTemplateRows"
              help="CSS grid-template-rows, e.g. repeat(auto-fill, 56px). A pixel row height is mirrored on the canvas."
            >
              <Input
                placeholder="repeat(auto-fill, 56px)"
                data-testid="view-settings-grid-rows"
                autoComplete="off"
              />
            </Form.Item>
            <Form.Item label="Gap" name="gridGap" help="CSS grid-gap, e.g. 8px.">
              <Input placeholder="8px" data-testid="view-settings-grid-gap" autoComplete="off" />
            </Form.Item>
          </div>
        )}

        <Divider style={{ margin: '12px 0' }} />

        <Form.Item
          label="Panel mode"
          name="panel"
          valuePropName="checked"
          help="Render a single card at full width."
        >
          <Switch data-testid="view-settings-panel" />
        </Form.Item>
        <Form.Item
          label="Subview"
          name="subview"
          valuePropName="checked"
          help="Hide from the navigation bar and show a back button."
        >
          <Switch data-testid="view-settings-subview" />
        </Form.Item>
        <Form.Item noStyle shouldUpdate={(prev, next) => prev.subview !== next.subview}>
          {({ getFieldValue }) =>
            getFieldValue('subview') ? (
              <Form.Item
                label="Back path"
                name="back_path"
                help="Where the back button returns to, e.g. /lovelace/0."
              >
                <Input placeholder="/lovelace/0" data-testid="view-settings-back-path" />
              </Form.Item>
            ) : null
          }
        </Form.Item>
        <Form.Item
          label="Visible in navigation"
          name="visibleInNav"
          valuePropName="checked"
          help={
            visibleIsConditional
              ? 'This view uses conditional visibility — edit it in the YAML editor.'
              : 'Uncheck to hide this view from the navigation bar.'
          }
        >
          <Switch disabled={visibleIsConditional} data-testid="view-settings-visible" />
        </Form.Item>
      </Form>

      <Divider style={{ margin: '12px 0' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Text type="secondary">
          Position: view {viewIndex === null ? '?' : viewIndex + 1} of {viewCount}
        </Text>
        <Space>
          <Button
            size="small"
            icon={<LeftOutlined />}
            onClick={() => onMove(-1)}
            disabled={!canMoveLeft}
            data-testid="view-settings-move-left"
          >
            Move left
          </Button>
          <Button
            size="small"
            icon={<RightOutlined />}
            onClick={() => onMove(1)}
            disabled={!canMoveRight}
            data-testid="view-settings-move-right"
          >
            Move right
          </Button>
        </Space>
      </div>
    </Modal>
  );
};
