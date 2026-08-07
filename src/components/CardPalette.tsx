import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Collapse, Input, Badge, Tooltip, theme } from 'antd';
import {
  AppstoreOutlined,
  DashboardOutlined,
  ControlOutlined,
  PlayCircleOutlined,
  InfoCircleOutlined,
  ApiOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { cardRegistry, CardCategory, CardTypeMetadata } from '../services/cardRegistry';
import { SHORTCUT_PASSTHROUGH_ATTR } from '../utils/keyboardShortcuts';
import { resolveCardState } from '../services/capability/cardAvailability';
import { useCapabilityProfile } from '../contexts/CapabilityProfileContext';
import { capturedAtLabel } from '../utils/capabilityLabel';

/**
 * F5 §7.1: the type marker a palette drag carries alongside `text/plain`, so a
 * drop target can identify a palette drag from `dataTransfer.types` alone during
 * `dragover`. Exported because `SectionsCanvas` is the consumer; it lives here,
 * with the producer of the payload, so there is one definition rather than two
 * string literals that can drift apart.
 */
export const PALETTE_CARD_MIME = 'application/x-havdm-palette-card';

interface CardPaletteProps {
  onCardAdd: (cardType: string) => void;
}

// Map category to icon and label
const categoryConfig: Record<
  CardCategory,
  { icon: React.ReactNode; label: string; color: string }
> = {
  layout: {
    icon: <AppstoreOutlined />,
    label: 'Layout',
    color: '#1890ff',
  },
  sensor: {
    icon: <DashboardOutlined />,
    label: 'Sensors & Display',
    color: '#52c41a',
  },
  control: {
    icon: <ControlOutlined />,
    label: 'Controls',
    color: '#fa8c16',
  },
  media: {
    icon: <PlayCircleOutlined />,
    label: 'Media',
    color: '#eb2f96',
  },
  information: {
    icon: <InfoCircleOutlined />,
    label: 'Information',
    color: '#13c2c2',
  },
  custom: {
    icon: <ApiOutlined />,
    label: 'Custom Cards',
    color: '#722ed1',
  },
};

export const CardPalette: React.FC<CardPaletteProps> = ({ onCardAdd }) => {
  // Correct here (unlike in App.tsx, which renders the ConfigProvider itself):
  // this component is a CHILD of the provider, so useToken sees the active theme.
  const { token } = theme.useToken();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const previousActiveKeysRef = useRef<string[] | null>(null);

  // The persisted capability profile — the OFFLINE source of truth for card
  // availability, never a live query at render time (standalone principle).
  //
  // ⭐ EXPORT-04 defect 1. This used to be a local `useState` filled by a
  // `useEffect(..., [])` with an EMPTY dependency array, which meant a capture
  // performed mid-session NEVER reached an already-open palette — the user
  // connected, HAVDM inventoried their instance, and this list went on showing
  // the never-connected permissive answer until the app restarted. The profile
  // now has one owner that can be refreshed, and `App.captureCapabilityProfile`
  // refreshes it the moment a capture lands.
  // ⚠ Outside a provider this is the permissive default, which is what keeps a
  // bare unit render honest rather than crashing.
  const profile = useCapabilityProfile();

  // Get all cards and group by category
  const allCards = cardRegistry.getAll();
  const cardsByCategory = allCards.reduce(
    (acc, card) => {
      if (!acc[card.category]) {
        acc[card.category] = [];
      }
      acc[card.category].push(card);
      return acc;
    },
    {} as Record<CardCategory, CardTypeMetadata[]>,
  );

  // Filter cards by search term
  const filteredCardsByCategory = Object.entries(cardsByCategory).reduce(
    (acc, [category, cards]) => {
      const filtered = cards.filter(
        (card) =>
          card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      if (filtered.length > 0) {
        acc[category as CardCategory] = filtered;
      }
      return acc;
    },
    {} as Record<CardCategory, CardTypeMetadata[]>,
  );
  const filteredCategoryKeys = useMemo(
    () => Object.keys(filteredCardsByCategory),
    [filteredCardsByCategory],
  );

  const areKeysEqual = (a: string[], b: string[]) =>
    a.length === b.length && a.every((value, index) => value === b[index]);

  useEffect(() => {
    const hasSearch = searchTerm.trim().length > 0;
    if (hasSearch) {
      if (previousActiveKeysRef.current === null) {
        previousActiveKeysRef.current = activeKeys;
      }
      if (!areKeysEqual(activeKeys, filteredCategoryKeys)) {
        setActiveKeys(filteredCategoryKeys);
      }
      return;
    }

    if (previousActiveKeysRef.current) {
      const previousKeys = previousActiveKeysRef.current;
      if (!areKeysEqual(activeKeys, previousKeys)) {
        setActiveKeys(previousKeys);
      }
      previousActiveKeysRef.current = null;
    }
  }, [activeKeys, filteredCategoryKeys, searchTerm]);

  const handleCardClick = (cardType: string) => {
    onCardAdd(cardType);
  };

  const handleDragStart = (e: React.DragEvent, cardType: string) => {
    const payload = JSON.stringify({ cardType });
    // RGL looks for "text/plain" by default
    e.dataTransfer.setData('text/plain', payload);
    // F5 §7.1: the SAME body under a marker MIME, so a drop target can recognise
    // a palette drag during `dragover`. There the drag data store is in
    // PROTECTED MODE — `getData()` returns '' and only `dataTransfer.types` is
    // readable — so a target that must decide whether to `preventDefault()` has
    // nothing but the type list to go on. Discriminating on `text/plain` instead
    // would accept any stray text drag (a selection dragged out of the Monaco
    // YAML editor, say), which would then fail to parse at drop time and no-op:
    // the "gesture that silently does nothing" failure VIEWS-04 is about.
    //
    // Additive by design — `text/plain` above is untouched, so GridCanvas's flat
    // drop path and react-grid-layout both read exactly what they read before.
    e.dataTransfer.setData(PALETTE_CARD_MIME, payload);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      data-testid="card-palette"
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ padding: '16px', paddingBottom: '12px' }}>
        <h3 style={{ color: token.colorText, marginBottom: '12px', marginTop: 0 }}>Card Palette</h3>
        <Input
          data-testid="card-search"
          // CANVAS-07: this box is a transient FILTER, not an edited document,
          // so Ctrl+Z here must undo the user's last CARD action rather than a
          // character of their search term. See src/utils/keyboardShortcuts.ts.
          {...{ [SHORTCUT_PASSTHROUGH_ATTR]: '' }}
          placeholder="Search cards..."
          prefix={<SearchOutlined style={{ color: token.colorTextTertiary }} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginBottom: '12px' }}
        />

        {/*
          ⭐⭐ EXPORT-04 defect 2 — THE NOTICE LIVES HERE, ABOVE THE SCROLL AREA.
          It used to sit in the palette FOOTER, below a `flex: 1` scroll region.
          That is structurally sound on its own, but the Sider around it was
          `height: 100vh` under a 64px Header with `overflow: hidden`, so the
          footer was clipped 64px below the viewport and the user never saw it
          (`App.tsx`, the Sider comment). The Sider is fixed too — this move is
          belt-and-braces, and it is the better home regardless: an explanation
          of what the list below MEANS belongs before the list, not after it.

          ⚠ TWO STATES, AND THE PERMISSIVE ONE IS NOT A DEFECT. Never-connected
          shows everything as available BY DESIGN (ratified vision answer 5) — the
          failure this text fixes is silence, not permissiveness. An unexplained
          default is indistinguishable from a broken one: the user cannot tell
          "everything really is installed" from "HAVDM has no idea what you have".
          Once a capture exists, ruling R1 makes the marks reflect the LAST
          CAPTURE even after disconnect, so the honest thing is to say when that
          was rather than imply it is live.

          ⚠ Canvas-only cards are unaffected in both states and stay marked:
          `resolveCardState` checks that profile-independent set FIRST.
        */}
        {profile.haVersion === null ? (
          <div
            data-testid="palette-availability-notice"
            style={{ color: token.colorTextTertiary, fontSize: '11px' }}
          >
            Not connected to Home Assistant — every card is shown as available. Connect to see which
            are actually installed on your instance.
          </div>
        ) : (
          <div
            data-testid="palette-availability-freshness"
            style={{ color: token.colorTextTertiary, fontSize: '11px' }}
          >
            Availability as of the last capture, {capturedAtLabel(profile.capturedAt)}.
          </div>
        )}
      </div>

      <div
        style={{
          flex: 1,
          overflow: 'auto',
          paddingLeft: '16px',
          paddingRight: '16px',
          paddingBottom: '16px',
        }}
      >
        <Collapse
          activeKey={activeKeys}
          onChange={(keys) => setActiveKeys(keys as string[])}
          ghost
          style={{ background: 'transparent' }}
          items={Object.entries(filteredCardsByCategory).map(([category, cards]) => {
            const config = categoryConfig[category as CardCategory];
            return {
              key: category,
              label: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: config.color }}>{config.icon}</span>
                  <span style={{ color: token.colorText, fontWeight: 500 }}>{config.label}</span>
                  <Badge
                    count={cards.length}
                    style={{
                      backgroundColor: config.color,
                      marginLeft: '4px',
                    }}
                  />
                </div>
              ),
              style: {
                borderBottom: `1px solid ${token.colorBorder}`,
                marginBottom: '4px',
              },
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {cards.map((card) => {
                    const availability = resolveCardState(
                      card.type,
                      { isCustom: card.isCustom },
                      profile,
                    );
                    return (
                      <Tooltip key={card.type} title={card.description} placement="right">
                        <div
                          data-testid={`palette-card-${card.type}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, card.type)}
                          onDoubleClick={() => handleCardClick(card.type)}
                          style={{
                            padding: '12px',
                            background: token.colorBgElevated,
                            borderRadius: '6px',
                            cursor: 'grab',
                            border: `1px solid ${token.colorBorder}`,
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = token.colorBgTextHover;
                            e.currentTarget.style.borderColor = config.color;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = token.colorBgElevated;
                            e.currentTarget.style.borderColor = token.colorBorder;
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: config.color, fontSize: '16px' }}>
                              {config.icon}
                            </span>
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  color: token.colorText,
                                  fontSize: '13px',
                                  fontWeight: 500,
                                }}
                              >
                                {card.name}
                              </div>
                              <div
                                style={{
                                  color: token.colorTextSecondary,
                                  fontSize: '11px',
                                  marginTop: '2px',
                                }}
                              >
                                {card.type}
                              </div>
                            </div>
                            {card.isCustom && (
                              <Badge
                                count="Custom"
                                style={{
                                  backgroundColor: '#722ed1',
                                  fontSize: '10px',
                                  height: '18px',
                                  lineHeight: '18px',
                                }}
                              />
                            )}
                            {availability === 'havdm-only' && (
                              <Tooltip
                                title="HAVDM canvas-only card — on deploy it becomes a 'Card Not Available' placeholder in Home Assistant"
                                placement="top"
                              >
                                <Badge
                                  count="HAVDM-only"
                                  style={{
                                    backgroundColor: '#d46b08',
                                    fontSize: '10px',
                                    height: '18px',
                                    lineHeight: '18px',
                                  }}
                                />
                              </Tooltip>
                            )}
                            {availability === 'not-available' && (
                              <Tooltip
                                title="Not installed on your Home Assistant — this card won't render until you install it (via HACS). You can still design with it."
                                placement="top"
                              >
                                <Badge
                                  count="Not Available"
                                  style={{
                                    backgroundColor: '#8c8c8c',
                                    fontSize: '10px',
                                    height: '18px',
                                    lineHeight: '18px',
                                  }}
                                />
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      </Tooltip>
                    );
                  })}
                </div>
              ),
            };
          })}
        />
      </div>

      <div
        style={{
          padding: '12px 16px',
          borderTop: `1px solid ${token.colorBorder}`,
          color: token.colorTextTertiary,
          fontSize: '11px',
        }}
      >
        {allCards.length} cards available
        {searchTerm && ` (${Object.values(filteredCardsByCategory).flat().length} shown)`}
      </div>
    </div>
  );
};
