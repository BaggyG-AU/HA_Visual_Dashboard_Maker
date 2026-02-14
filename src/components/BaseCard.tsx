import React, { useEffect, useState } from 'react';
import { Card } from '../types/dashboard';
import { EntitiesCardRenderer } from './cards/EntitiesCardRenderer';
import { ButtonCardRenderer } from './cards/ButtonCardRenderer';
import { GlanceCardRenderer } from './cards/GlanceCardRenderer';
import { MarkdownCardRenderer } from './cards/MarkdownCardRenderer';
import { ApexChartsCardRenderer } from './cards/ApexChartsCardRenderer';
import { PowerFlowCardRenderer } from './cards/PowerFlowCardRenderer';
import { ThermostatCardRenderer } from './cards/ThermostatCardRenderer';
import { BetterThermostatCardRenderer } from './cards/BetterThermostatCardRenderer';
import { HorizontalStackCardRenderer } from './cards/HorizontalStackCardRenderer';
import { VerticalStackCardRenderer } from './cards/VerticalStackCardRenderer';
import { GridCardRenderer } from './cards/GridCardRenderer';
import { MushroomCardRenderer } from './cards/MushroomCardRenderer';
import { MiniGraphCardRenderer } from './cards/MiniGraphCardRenderer';
import { BubbleCardRenderer } from './cards/BubbleCardRenderer';
import { GaugeCardRenderer } from './cards/GaugeCardRenderer';
import { LightCardRenderer } from './cards/LightCardRenderer';
import { SensorCardRenderer } from './cards/SensorCardRenderer';
import { ConditionalCardRenderer } from './cards/ConditionalCardRenderer';
import { HistoryGraphCardRenderer } from './cards/HistoryGraphCardRenderer';
import { WeatherForecastCardRenderer } from './cards/WeatherForecastCardRenderer';
import { MapCardRenderer } from './cards/MapCardRenderer';
import { PictureCardRenderer } from './cards/PictureCardRenderer';
import { PictureEntityCardRenderer } from './cards/PictureEntityCardRenderer';
import { PictureGlanceCardRenderer } from './cards/PictureGlanceCardRenderer';
import { MediaPlayerCardRenderer } from './cards/MediaPlayerCardRenderer';
import { AlarmPanelCardRenderer } from './cards/AlarmPanelCardRenderer';
import { PlantStatusCardRenderer } from './cards/PlantStatusCardRenderer';
import { CardModCardRenderer } from './cards/CardModCardRenderer';
import { AutoEntitiesCardRenderer } from './cards/AutoEntitiesCardRenderer';
import { VerticalStackInCardRenderer } from './cards/VerticalStackInCardRenderer';
import { CustomButtonCardRenderer } from './cards/CustomButtonCardRenderer';
import { SurveillanceCardRenderer } from './cards/SurveillanceCardRenderer';
import { SwiperCardRenderer } from './cards/SwiperCardRenderer';
import { ExpanderCardRenderer } from './cards/ExpanderCardRenderer';
import { TabsCardRenderer } from './cards/TabsCardRenderer';
import { PopupTriggerCardRenderer } from './cards/PopupTriggerCardRenderer';
import { NativeGraphsCardRenderer } from './cards/NativeGraphsCardRenderer';
import { UnsupportedCard } from './cards/UnsupportedCard';
import { useHAEntities } from '../contexts/HAEntityContext';
import { evaluateVisibilityConditions } from '../services/conditionalVisibility';
import { popupStackService, resolvePopupFromAction } from '../features/popup/popupService';
import { resolveCardSpacingStyles } from '../services/cardSpacing';

interface BaseCardProps {
  card: Card;
  isSelected?: boolean;
  onClick?: (event?: React.MouseEvent<HTMLElement>) => void;
}

const VISIBILITY_TRANSITION_MS = 250;

const isTestEnv = (): boolean => {
  if (typeof process !== 'undefined' && (process.env.NODE_ENV === 'test' || process.env.E2E === '1')) {
    return true;
  }
  if (typeof window !== 'undefined') {
    const testWindow = window as Window & { E2E?: string | boolean; PLAYWRIGHT_TEST?: string | boolean };
    return Boolean(testWindow.E2E || testWindow.PLAYWRIGHT_TEST);
  }
  return false;
};

/**
 * BaseCard component - routes to the appropriate card renderer
 * Supported cards get their specific renderer, unsupported cards get a placeholder
 */
export const BaseCard: React.FC<BaseCardProps> = ({ card, isSelected = false, onClick }) => {
  const { entities } = useHAEntities();
  const isVisible = evaluateVisibilityConditions(card.visibility_conditions, entities);
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      return;
    }

    if (isTestEnv()) {
      setShouldRender(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      setShouldRender(false);
    }, VISIBILITY_TRANSITION_MS);

    return () => window.clearTimeout(timeout);
  }, [isVisible]);

  if (!shouldRender) {
    return null;
  }

  const transitionMs = isTestEnv() ? 0 : VISIBILITY_TRANSITION_MS;
  const transitionStyle: React.CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(4px)',
    pointerEvents: isVisible ? 'auto' : 'none',
    transition: `opacity ${transitionMs}ms ease, transform ${transitionMs}ms ease`,
    height: '100%',
  };
  const spacingStyle = resolveCardSpacingStyles(card);

  // Check if this is a spacer card
  const isSpacer = card.type === 'spacer' || '_isSpacer' in card;

  if (isSpacer) {
    return (
      <div data-testid="conditional-visibility-wrapper" data-visible={isVisible ? 'true' : 'false'} style={transitionStyle}>
        <div
          style={{
            height: '100%',
            border: isSelected ? '2px dashed #00d9ff' : '1px dashed #434343',
            backgroundColor: isSelected ? 'rgba(0, 217, 255, 0.05)' : 'transparent',
            cursor: 'pointer',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
            fontSize: '12px',
            transition: 'all 0.3s ease',
          }}
          onClick={onClick}
        >
          {isSelected ? 'Spacer (Empty)' : ''}
        </div>
      </div>
    );
  }

  const handleCardClick = (event?: React.MouseEvent<HTMLElement>) => {
    onClick?.(event);
    const popupAction = resolvePopupFromAction(card.tap_action);
    if (popupAction) {
      popupStackService.open(popupAction);
    }
  };

  let renderedCard: React.ReactNode;

  switch (card.type) {
    case 'entities':
      renderedCard = <EntitiesCardRenderer card={card as React.ComponentProps<typeof EntitiesCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;
    case 'button':
      renderedCard = <ButtonCardRenderer card={card as React.ComponentProps<typeof ButtonCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;
    case 'glance':
      renderedCard = <GlanceCardRenderer card={card as React.ComponentProps<typeof GlanceCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;
    case 'markdown':
      renderedCard = <MarkdownCardRenderer card={card as React.ComponentProps<typeof MarkdownCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;
    case 'gauge':
      renderedCard = <GaugeCardRenderer card={card as React.ComponentProps<typeof GaugeCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;
    case 'light':
      renderedCard = <LightCardRenderer card={card as React.ComponentProps<typeof LightCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;
    case 'sensor':
      renderedCard = <SensorCardRenderer card={card as React.ComponentProps<typeof SensorCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;
    case 'thermostat':
      renderedCard = <ThermostatCardRenderer card={card as React.ComponentProps<typeof ThermostatCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;
    case 'conditional':
      renderedCard = <ConditionalCardRenderer card={card as React.ComponentProps<typeof ConditionalCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;
    case 'history-graph':
      renderedCard = <HistoryGraphCardRenderer card={card as React.ComponentProps<typeof HistoryGraphCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;
    case 'weather-forecast':
      renderedCard = <WeatherForecastCardRenderer card={card as React.ComponentProps<typeof WeatherForecastCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;
    case 'map':
      renderedCard = <MapCardRenderer card={card as React.ComponentProps<typeof MapCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;
    case 'picture':
      renderedCard = <PictureCardRenderer card={card as React.ComponentProps<typeof PictureCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;
    case 'picture-entity':
      renderedCard = <PictureEntityCardRenderer card={card as React.ComponentProps<typeof PictureEntityCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;
    case 'picture-glance':
      renderedCard = <PictureGlanceCardRenderer card={card as React.ComponentProps<typeof PictureGlanceCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;
    case 'media-control':
      renderedCard = <MediaPlayerCardRenderer card={card as React.ComponentProps<typeof MediaPlayerCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;
    case 'alarm-panel':
      renderedCard = <AlarmPanelCardRenderer card={card as React.ComponentProps<typeof AlarmPanelCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;
    case 'plant-status':
      renderedCard = <PlantStatusCardRenderer card={card as React.ComponentProps<typeof PlantStatusCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;
    case 'horizontal-stack':
      renderedCard = <HorizontalStackCardRenderer card={card as React.ComponentProps<typeof HorizontalStackCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;
    case 'vertical-stack':
      renderedCard = <VerticalStackCardRenderer card={card as React.ComponentProps<typeof VerticalStackCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;
    case 'grid':
      renderedCard = <GridCardRenderer card={card as React.ComponentProps<typeof GridCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;
    case 'custom:apexcharts-card':
      renderedCard = <ApexChartsCardRenderer card={card as React.ComponentProps<typeof ApexChartsCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;
    case 'custom:native-graph-card':
      renderedCard = <NativeGraphsCardRenderer card={card as React.ComponentProps<typeof NativeGraphsCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;
    case 'custom:power-flow-card-plus':
    case 'custom:power-flow-card':
      renderedCard = <PowerFlowCardRenderer card={card as React.ComponentProps<typeof PowerFlowCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;
    case 'custom:better-thermostat-ui-card':
      renderedCard = <BetterThermostatCardRenderer card={card as React.ComponentProps<typeof BetterThermostatCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;
    case 'custom:mini-graph-card':
      renderedCard = <MiniGraphCardRenderer card={card as React.ComponentProps<typeof MiniGraphCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;
    case 'custom:bubble-card':
      renderedCard = <BubbleCardRenderer card={card as React.ComponentProps<typeof BubbleCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;

    // Mushroom cards
    case 'custom:mushroom-entity-card':
    case 'custom:mushroom-light-card':
    case 'custom:mushroom-fan-card':
    case 'custom:mushroom-cover-card':
    case 'custom:mushroom-climate-card':
    case 'custom:mushroom-media-player-card':
    case 'custom:mushroom-lock-card':
    case 'custom:mushroom-alarm-control-panel-card':
    case 'custom:mushroom-template-card':
    case 'custom:mushroom-title-card':
    case 'custom:mushroom-chips-card':
    case 'custom:mushroom-person-card':
    case 'custom:mushroom-switch-card':
    case 'custom:mushroom-number-card':
    case 'custom:mushroom-select-card':
    case 'custom:mushroom-vacuum-card':
      renderedCard = <MushroomCardRenderer card={card as React.ComponentProps<typeof MushroomCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;

    case 'custom:card-mod':
      renderedCard = <CardModCardRenderer card={card as React.ComponentProps<typeof CardModCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;
    case 'custom:auto-entities':
      renderedCard = <AutoEntitiesCardRenderer card={card as React.ComponentProps<typeof AutoEntitiesCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;
    case 'custom:vertical-stack-in-card':
      renderedCard = <VerticalStackInCardRenderer card={card as React.ComponentProps<typeof VerticalStackInCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;
    case 'custom:button-card':
      renderedCard = <CustomButtonCardRenderer card={card as React.ComponentProps<typeof CustomButtonCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;
    case 'custom:swipe-card':
      renderedCard = <SwiperCardRenderer card={card as React.ComponentProps<typeof SwiperCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;
    case 'custom:expander-card':
      renderedCard = <ExpanderCardRenderer card={card as React.ComponentProps<typeof ExpanderCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;
    case 'custom:tabbed-card':
      renderedCard = <TabsCardRenderer card={card as React.ComponentProps<typeof TabsCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;
    case 'custom:popup-card':
      renderedCard = <PopupTriggerCardRenderer card={card as React.ComponentProps<typeof PopupTriggerCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;

    // Surveillance/Camera cards
    case 'custom:surveillance-card':
    case 'custom:frigate-card':
    case 'custom:camera-card':
    case 'custom:webrtc-camera':
      renderedCard = <SurveillanceCardRenderer card={card as React.ComponentProps<typeof SurveillanceCardRenderer>['card']} isSelected={isSelected} onClick={handleCardClick} />;
      break;

    default:
      renderedCard = <UnsupportedCard card={card} isSelected={isSelected} onClick={handleCardClick} />;
      break;
  }

  return (
    <div
      data-testid="conditional-visibility-wrapper"
      data-visible={isVisible ? 'true' : 'false'}
      style={{ ...transitionStyle, ...spacingStyle }}
    >
      {renderedCard}
    </div>
  );
};
