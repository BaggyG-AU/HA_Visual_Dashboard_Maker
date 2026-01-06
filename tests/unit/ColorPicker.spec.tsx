/**
 * Unit tests for ColorPicker component
 *
 * Tests rendering, user interactions, format toggle, and recent colors
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ColorPicker } from '../../src/components/ColorPicker';

describe('ColorPicker', () => {
  // Mock localStorage before each test
  beforeEach(() => {
    const localStorageMock: { [key: string]: string } = {};
    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    } as Storage;
  });

  describe('rendering', () => {
    it('should render color picker with default props', () => {
      render(<ColorPicker />);
      expect(screen.getByTestId('color-picker')).toBeInTheDocument();
    });

    it('should render with custom testId', () => {
      render(<ColorPicker data-testid="custom-picker" />);
      expect(screen.getByTestId('custom-picker')).toBeInTheDocument();
    });

    it('should render format toggle button when showFormatToggle is true', () => {
      render(<ColorPicker showFormatToggle={true} />);
      expect(screen.getByTestId('color-picker-format-toggle')).toBeInTheDocument();
    });

    it('should not render format toggle button when showFormatToggle is false', () => {
      render(<ColorPicker showFormatToggle={false} />);
      expect(screen.queryByTestId('color-picker-format-toggle')).not.toBeInTheDocument();
    });

    it('should render input field', () => {
      render(<ColorPicker />);
      expect(screen.getByTestId('color-picker-input')).toBeInTheDocument();
    });

    it('should render color preview', () => {
      render(<ColorPicker />);
      expect(screen.getByTestId('color-picker-preview')).toBeInTheDocument();
    });

    it('should display current color value in input', () => {
      render(<ColorPicker value="#FF0000" />);
      const input = screen.getByTestId('color-picker-input') as HTMLInputElement;
      expect(input.value).toBe('#FF0000');
    });
  });

  describe('format toggle', () => {
    it('should start with hex format by default', () => {
      render(<ColorPicker />);
      const toggle = screen.getByTestId('color-picker-format-toggle');
      expect(toggle.textContent).toBe('HEX');
    });

    it('should start with specified initial format', () => {
      render(<ColorPicker format="rgb" />);
      const toggle = screen.getByTestId('color-picker-format-toggle');
      expect(toggle.textContent).toBe('RGB');
    });

    it('should toggle format from hex to rgb to hsl', async () => {
      const onChange = vi.fn();
      render(<ColorPicker value="#FF0000" onChange={onChange} />);
      const toggle = screen.getByTestId('color-picker-format-toggle');

      // Initial: HEX
      expect(toggle.textContent).toBe('HEX');

      // Click to toggle to RGB
      fireEvent.click(toggle);
      await waitFor(() => {
        expect(toggle.textContent).toBe('RGB');
      });

      // Click to toggle to HSL
      fireEvent.click(toggle);
      await waitFor(() => {
        expect(toggle.textContent).toBe('HSL');
      });

      // Click to toggle back to HEX
      fireEvent.click(toggle);
      await waitFor(() => {
        expect(toggle.textContent).toBe('HEX');
      });
    });

    it('should convert color value when format changes', async () => {
      const onChange = vi.fn();
      render(<ColorPicker value="#FF0000" onChange={onChange} />);
      const toggle = screen.getByTestId('color-picker-format-toggle');

      // Toggle to RGB
      fireEvent.click(toggle);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
        const calls = onChange.mock.calls;
        const lastCall = calls[calls.length - 1][0];
        expect(lastCall).toContain('rgb');
      });
    });
  });

  describe('input field', () => {
    it('should update input value when typing', () => {
      render(<ColorPicker />);
      const input = screen.getByTestId('color-picker-input') as HTMLInputElement;

      fireEvent.change(input, { target: { value: '#00FF00' } });
      expect(input.value).toBe('#00FF00');
    });

    it('should call onChange when valid hex is entered', () => {
      const onChange = vi.fn();
      render(<ColorPicker onChange={onChange} />);
      const input = screen.getByTestId('color-picker-input') as HTMLInputElement;

      fireEvent.change(input, { target: { value: '#00FF00' } });
      fireEvent.blur(input);

      expect(onChange).toHaveBeenCalled();
    });

    it('should normalize hex on blur', () => {
      const onChange = vi.fn();
      render(<ColorPicker onChange={onChange} />);
      const input = screen.getByTestId('color-picker-input') as HTMLInputElement;

      fireEvent.change(input, { target: { value: '#f00' } });
      fireEvent.blur(input);

      expect(input.value).toBe('#FF0000');
    });

    it('should handle Enter key to confirm', () => {
      const onChange = vi.fn();
      render(<ColorPicker onChange={onChange} />);
      const input = screen.getByTestId('color-picker-input') as HTMLInputElement;

      fireEvent.change(input, { target: { value: '#00FF00' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onChange).toHaveBeenCalled();
    });

    it('should handle Escape key to revert', () => {
      render(<ColorPicker value="#FF0000" />);
      const input = screen.getByTestId('color-picker-input') as HTMLInputElement;

      fireEvent.change(input, { target: { value: '#00FF00' } });
      fireEvent.keyDown(input, { key: 'Escape' });

      expect(input.value).toBe('#FF0000');
    });
  });

  describe('recent colors', () => {
    it('should not show recent colors section when showRecentColors is false', () => {
      render(<ColorPicker showRecentColors={false} />);
      expect(screen.queryByText('Recent Colors')).not.toBeInTheDocument();
    });

    it('should not show recent colors section when no colors in history', () => {
      render(<ColorPicker showRecentColors={true} />);
      expect(screen.queryByText('Recent Colors')).not.toBeInTheDocument();
    });

    it('should show clear button when recent colors exist', async () => {
      // Pre-populate localStorage with colors
      const storedData = {
        colors: ['#FF0000', '#00FF00'],
        lastUpdated: Date.now(),
      };
      localStorage.setItem('havdm-recent-colors', JSON.stringify(storedData));

      render(<ColorPicker showRecentColors={true} />);

      await waitFor(() => {
        expect(screen.getByText('Recent Colors')).toBeInTheDocument();
        expect(screen.getByTestId('color-picker-clear-recent')).toBeInTheDocument();
      });
    });

    it('should clear recent colors when clear button is clicked', async () => {
      const storedData = {
        colors: ['#FF0000'],
        lastUpdated: Date.now(),
      };
      localStorage.setItem('havdm-recent-colors', JSON.stringify(storedData));

      render(<ColorPicker showRecentColors={true} />);

      await waitFor(() => {
        expect(screen.getByText('Recent Colors')).toBeInTheDocument();
      });

      const clearButton = screen.getByTestId('color-picker-clear-recent');
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(screen.queryByText('Recent Colors')).not.toBeInTheDocument();
      });
    });
  });

  describe('disabled state', () => {
    it('should disable all controls when disabled prop is true', () => {
      render(<ColorPicker disabled={true} />);

      const toggle = screen.getByTestId('color-picker-format-toggle');
      const input = screen.getByTestId('color-picker-input');

      expect(toggle).toBeDisabled();
      expect(input).toBeDisabled();
    });

    it('should not call onChange when disabled', () => {
      const onChange = vi.fn();
      render(<ColorPicker disabled={true} onChange={onChange} />);

      const input = screen.getByTestId('color-picker-input') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '#00FF00' } });

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have aria-label on main container', () => {
      render(<ColorPicker ariaLabel="Test picker" />);
      const picker = screen.getByTestId('color-picker');
      expect(picker).toHaveAttribute('aria-label', 'Test picker');
    });

    it('should have aria-label on input field', () => {
      render(<ColorPicker />);
      const input = screen.getByTestId('color-picker-input');
      expect(input).toHaveAttribute('aria-label');
    });

    it('should have aria-label on color preview', () => {
      render(<ColorPicker />);
      const preview = screen.getByTestId('color-picker-preview');
      expect(preview).toHaveAttribute('aria-label', 'Color preview');
    });

    it('should have role="list" on recent colors container', async () => {
      const storedData = {
        colors: ['#FF0000'],
        lastUpdated: Date.now(),
      };
      localStorage.setItem('havdm-recent-colors', JSON.stringify(storedData));

      render(<ColorPicker showRecentColors={true} />);

      await waitFor(() => {
        const list = screen.getByRole('list', { name: /recent colors/i });
        expect(list).toBeInTheDocument();
      });
    });
  });

  describe('color preview', () => {
    it('should display preview with current color', () => {
      render(<ColorPicker value="#FF0000" />);
      const preview = screen.getByTestId('color-picker-preview');
      expect(preview).toHaveStyle({ background: '#FF0000' });
    });

    it('should update preview when color changes', async () => {
      const { rerender } = render(<ColorPicker value="#FF0000" />);
      const preview = screen.getByTestId('color-picker-preview');
      expect(preview).toHaveStyle({ background: '#FF0000' });

      rerender(<ColorPicker value="#00FF00" />);
      expect(preview).toHaveStyle({ background: '#00FF00' });
    });
  });

  describe('integration', () => {
    it('should work with all features enabled', () => {
      render(
        <ColorPicker
          value="#FF0000"
          format="hex"
          showAlpha={true}
          showFormatToggle={true}
          showRecentColors={true}
          maxRecentColors={10}
          disabled={false}
        />
      );

      expect(screen.getByTestId('color-picker')).toBeInTheDocument();
      expect(screen.getByTestId('color-picker-format-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('color-picker-input')).toBeInTheDocument();
      expect(screen.getByTestId('color-picker-preview')).toBeInTheDocument();
    });

    it('should work with minimal features', () => {
      render(
        <ColorPicker
          value="#FF0000"
          showFormatToggle={false}
          showRecentColors={false}
        />
      );

      expect(screen.getByTestId('color-picker')).toBeInTheDocument();
      expect(screen.queryByTestId('color-picker-format-toggle')).not.toBeInTheDocument();
      expect(screen.getByTestId('color-picker-input')).toBeInTheDocument();
      expect(screen.getByTestId('color-picker-preview')).toBeInTheDocument();
    });
  });
});
