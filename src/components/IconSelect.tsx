import React, { useState, useMemo } from 'react';
import { Select, Space, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface IconSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  allowClear?: boolean;
}

/**
 * Icon selector with visual preview of Material Design Icons
 * Shows icon preview alongside icon name for better UX
 */
export const IconSelect: React.FC<IconSelectProps> = ({
  value,
  onChange,
  placeholder = 'mdi:home',
  allowClear = true,
}) => {
  const [searchText, setSearchText] = useState('');

  // Common Home Assistant icons
  const commonIcons = [
    'mdi:home',
    'mdi:lightbulb',
    'mdi:thermometer',
    'mdi:water-percent',
    'mdi:fan',
    'mdi:blinds',
    'mdi:door',
    'mdi:window-open',
    'mdi:lock',
    'mdi:shield-home',
    'mdi:cctv',
    'mdi:motion-sensor',
    'mdi:smoke-detector',
    'mdi:fire',
    'mdi:weather-sunny',
    'mdi:weather-cloudy',
    'mdi:weather-rainy',
    'mdi:weather-snowy',
    'mdi:power',
    'mdi:power-plug',
    'mdi:battery',
    'mdi:solar-panel',
    'mdi:flash',
    'mdi:speaker',
    'mdi:television',
    'mdi:music',
    'mdi:video',
    'mdi:phone',
    'mdi:cellphone',
    'mdi:laptop',
    'mdi:router-wireless',
    'mdi:network',
    'mdi:alarm',
    'mdi:clock',
    'mdi:calendar',
    'mdi:bell',
    'mdi:garage',
    'mdi:car',
    'mdi:washing-machine',
    'mdi:dishwasher',
    'mdi:fridge',
    'mdi:stove',
    'mdi:microwave',
    'mdi:coffee-maker',
    'mdi:robot-vacuum',
    'mdi:air-conditioner',
    'mdi:radiator',
    'mdi:valve',
    'mdi:pipe',
    'mdi:water-pump',
    'mdi:sprinkler',
    'mdi:pool',
    'mdi:hot-tub',
    'mdi:sofa',
    'mdi:bed',
    'mdi:lamp',
    'mdi:ceiling-light',
    'mdi:floor-lamp',
    'mdi:wall-sconce',
    'mdi:led-strip',
    'mdi:lightbulb-group',
    'mdi:light-switch',
    'mdi:spotlight',
    'mdi:chandelier',
  ];

  // Filter icons based on search
  const filteredIcons = useMemo(() => {
    if (!searchText) return commonIcons;
    const lowerSearch = searchText.toLowerCase();
    return commonIcons.filter(icon =>
      icon.toLowerCase().includes(lowerSearch)
    );
  }, [searchText, commonIcons]);

  // Create options with icon preview
  const options = useMemo(() => {
    return filteredIcons.map(iconName => {
      const iconClass = iconName.replace('mdi:', 'mdi-');

      return {
        value: iconName,
        label: (
          <Space align="center">
            <span
              className={`mdi ${iconClass}`}
              style={{
                fontSize: '20px',
                color: '#00d9ff',
                width: '24px',
                display: 'inline-block'
              }}
            />
            <Text style={{ fontSize: '13px' }}>{iconName}</Text>
          </Space>
        ),
        searchText: iconName.toLowerCase(),
      };
    });
  }, [filteredIcons]);

  // Render current icon preview
  const renderIconPreview = () => {
    if (!value) return null;

    const iconClass = value.replace('mdi:', 'mdi-');

    return (
      <div style={{
        marginTop: '8px',
        padding: '12px',
        background: '#1f1f1f',
        border: '1px solid #2a2a2a',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span
          className={`mdi ${iconClass}`}
          style={{
            fontSize: '32px',
            color: '#00d9ff'
          }}
        />
        <div>
          <Text style={{ color: '#888', fontSize: '11px', display: 'block' }}>Selected Icon:</Text>
          <Text style={{ color: '#fff', fontSize: '13px' }}>{value}</Text>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Select
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        allowClear={allowClear}
        showSearch
        filterOption={(input, option) => {
          if (!option?.searchText) return false;
          return option.searchText.includes(input.toLowerCase());
        }}
        onSearch={setSearchText}
        options={options}
        style={{ width: '100%' }}
        popupClassName="icon-select-dropdown"
        styles={{
          dropdown: {
            backgroundColor: '#1f1f1f',
          },
        }}
        suffixIcon={<SearchOutlined />}
        notFoundContent={
          <div style={{ padding: '12px', textAlign: 'center' }}>
            <Text type="secondary">
              No icons found. Try typing a custom icon name like "mdi:custom-icon"
            </Text>
          </div>
        }
      />
      {renderIconPreview()}

      <div style={{
        marginTop: '8px',
        padding: '8px',
        background: '#1a1a1a',
        borderRadius: '4px'
      }}>
        <Text style={{ color: '#666', fontSize: '11px' }}>
          💡 Tip: You can also type custom MDI icon names (e.g., mdi:custom-icon)
        </Text>
      </div>
    </div>
  );
};
