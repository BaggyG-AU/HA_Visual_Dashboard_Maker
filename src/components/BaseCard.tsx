import React from 'react';
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
import { UnsupportedCard } from './cards/UnsupportedCard';

interface BaseCardProps {
  card: Card;
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * BaseCard component - routes to the appropriate card renderer
 * Supported cards get their specific renderer, unsupported cards get a placeholder
 */
export const BaseCard: React.FC<BaseCardProps> = ({ card, isSelected = false, onClick }) => {
  // Check if this is a spacer card
  const isSpacer = card.type === 'spacer' || '_isSpacer' in card;

  if (isSpacer) {
    // Render spacer as a semi-transparent placeholder
    return (
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
    );
  }

  // Route to appropriate renderer based on card type
  switch (card.type) {
    case 'entities':
      return <EntitiesCardRenderer card={card as React.ComponentProps<typeof EntitiesCardRenderer>['card']} isSelected={isSelected} onClick={onClick} />;

    case 'button':
      return <ButtonCardRenderer card={card as React.ComponentProps<typeof ButtonCardRenderer>['card']} isSelected={isSelected} onClick={onClick} />;

    case 'glance':
      return <GlanceCardRenderer card={card as React.ComponentProps<typeof GlanceCardRenderer>['card']} isSelected={isSelected} onClick={onClick} />;

    case 'markdown':
      return <MarkdownCardRenderer card={card as React.ComponentProps<typeof MarkdownCardRenderer>['card']} isSelected={isSelected} onClick={onClick} />;

    case 'gauge':
      return <GaugeCardRenderer card={card as React.ComponentProps<typeof GaugeCardRenderer>['card']} isSelected={isSelected} onClick={onClick} />;

    case 'light':
      return <LightCardRenderer card={card as React.ComponentProps<typeof LightCardRenderer>['card']} isSelected={isSelected} onClick={onClick} />;

    case 'sensor':
      return <SensorCardRenderer card={card as React.ComponentProps<typeof SensorCardRenderer>['card']} isSelected={isSelected} onClick={onClick} />;

    case 'thermostat':
      return <ThermostatCardRenderer card={card as React.ComponentProps<typeof ThermostatCardRenderer>['card']} isSelected={isSelected} onClick={onClick} />;

    case 'conditional':
      return <ConditionalCardRenderer card={card as React.ComponentProps<typeof ConditionalCardRenderer>['card']} isSelected={isSelected} onClick={onClick} />;

    case 'history-graph':
      return <HistoryGraphCardRenderer card={card as React.ComponentProps<typeof HistoryGraphCardRenderer>['card']} isSelected={isSelected} onClick={onClick} />;

    case 'weather-forecast':
      return <WeatherForecastCardRenderer card={card as React.ComponentProps<typeof WeatherForecastCardRenderer>['card']} isSelected={isSelected} onClick={onClick} />;

    case 'map':
      return <MapCardRenderer card={card as React.ComponentProps<typeof MapCardRenderer>['card']} isSelected={isSelected} onClick={onClick} />;

    case 'picture':
      return <PictureCardRenderer card={card as React.ComponentProps<typeof PictureCardRenderer>['card']} isSelected={isSelected} onClick={onClick} />;

    case 'picture-entity':
      return <PictureEntityCardRenderer card={card as React.ComponentProps<typeof PictureEntityCardRenderer>['card']} isSelected={isSelected} onClick={onClick} />;

    case 'picture-glance':
      return <PictureGlanceCardRenderer card={card as React.ComponentProps<typeof PictureGlanceCardRenderer>['card']} isSelected={isSelected} onClick={onClick} />;

    case 'media-control':
      return <MediaPlayerCardRenderer card={card as React.ComponentProps<typeof MediaPlayerCardRenderer>['card']} isSelected={isSelected} onClick={onClick} />;

    case 'alarm-panel':
      return <AlarmPanelCardRenderer card={card as React.ComponentProps<typeof AlarmPanelCardRenderer>['card']} isSelected={isSelected} onClick={onClick} />;

    case 'plant-status':
      return <PlantStatusCardRenderer card={card as React.ComponentProps<typeof PlantStatusCardRenderer>['card']} isSelected={isSelected} onClick={onClick} />;

    case 'horizontal-stack':
      return <HorizontalStackCardRenderer card={card as React.ComponentProps<typeof HorizontalStackCardRenderer>['card']} isSelected={isSelected} onClick={onClick} />;

    case 'vertical-stack':
      return <VerticalStackCardRenderer card={card as React.ComponentProps<typeof VerticalStackCardRenderer>['card']} isSelected={isSelected} onClick={onClick} />;

    case 'grid':
      return <GridCardRenderer card={card as React.ComponentProps<typeof GridCardRenderer>['card']} isSelected={isSelected} onClick={onClick} />;

    case 'custom:apexcharts-card':
      return <ApexChartsCardRenderer card={card as React.ComponentProps<typeof ApexChartsCardRenderer>['card']} isSelected={isSelected} onClick={onClick} />;

    case 'custom:power-flow-card-plus':
    case 'custom:power-flow-card':
      return <PowerFlowCardRenderer card={card as React.ComponentProps<typeof PowerFlowCardRenderer>['card']} isSelected={isSelected} onClick={onClick} />;

    case 'custom:better-thermostat-ui-card':
      return <BetterThermostatCardRenderer card={card as React.ComponentProps<typeof BetterThermostatCardRenderer>['card']} isSelected={isSelected} onClick={onClick} />;

    case 'custom:mini-graph-card':
      return <MiniGraphCardRenderer card={card as React.ComponentProps<typeof MiniGraphCardRenderer>['card']} isSelected={isSelected} onClick={onClick} />;

    case 'custom:bubble-card':
      return <BubbleCardRenderer card={card as React.ComponentProps<typeof BubbleCardRenderer>['card']} isSelected={isSelected} onClick={onClick} />;

    // Mushroom cards - handle all mushroom card types
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
      return <MushroomCardRenderer card={card as React.ComponentProps<typeof MushroomCardRenderer>['card']} isSelected={isSelected} onClick={onClick} />;

    // Custom card-mod styling layer
    case 'custom:card-mod':
      return <CardModCardRenderer card={card as React.ComponentProps<typeof CardModCardRenderer>['card']} isSelected={isSelected} onClick={onClick} />;

    // Custom auto-entities
    case 'custom:auto-entities':
      return <AutoEntitiesCardRenderer card={card as React.ComponentProps<typeof AutoEntitiesCardRenderer>['card']} isSelected={isSelected} onClick={onClick} />;

    // Custom vertical-stack-in-card
    case 'custom:vertical-stack-in-card':
      return <VerticalStackInCardRenderer card={card as React.ComponentProps<typeof VerticalStackInCardRenderer>['card']} isSelected={isSelected} onClick={onClick} />;

    // Custom button-card (distinct from built-in button)
    case 'custom:button-card':
      return <CustomButtonCardRenderer card={card as React.ComponentProps<typeof CustomButtonCardRenderer>['card']} isSelected={isSelected} onClick={onClick} />;

    // Surveillance/Camera cards
    case 'custom:surveillance-card':
    case 'custom:frigate-card':
    case 'custom:camera-card':
    case 'custom:webrtc-camera':
      return <SurveillanceCardRenderer card={card as React.ComponentProps<typeof SurveillanceCardRenderer>['card']} isSelected={isSelected} onClick={onClick} />;

    default:
      // Unsupported card type - show placeholder
      return <UnsupportedCard card={card} isSelected={isSelected} onClick={onClick} />;
  }
};
