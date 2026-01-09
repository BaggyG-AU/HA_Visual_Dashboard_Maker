# Card Background Customization Guide

Card background customization lets you style a card’s background directly from the Properties Panel with solid colors, gradients, images, or frosted glass effects.

## Where to find it
- Properties Panel → **Advanced Styling** tab → **Background** section.

## Background types

### 1) Solid color
- Select **Solid color**
- Pick a color
- Adjust **Background Opacity**

YAML example:
```yaml
style: |
  background: rgba(255, 0, 0, 0.7);
```

### 2) Gradient
- Select **Gradient**
- Open the Gradient Editor and choose a preset or build your own
- Adjust **Background Opacity**

YAML example:
```yaml
style: |
  background: linear-gradient(90deg, rgba(255, 0, 0, 0.5) 0%, rgba(0, 0, 255, 0.5) 100%);
```

### 3) Image
- Select **Image**
- Provide an image URL
- Set position, size, repeat
- Adjust **Image Opacity** and **Image Blur**
- Optional: set **Blend Mode** and **Overlay Tint**

YAML example:
```yaml
style: |
  background-image: linear-gradient(rgba(17, 34, 51, 0.25), rgba(17, 34, 51, 0.25)), url("https://example.com/background.jpg");
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  background-blend-mode: normal;
  filter: blur(4px);
```

### 4) Frosted glass (Backdrop blur)
- Select **Frosted glass**
- Adjust **Backdrop Blur** and **Tint**

YAML example:
```yaml
style: |
  background-color: rgba(51, 68, 85, 0.35);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
```

## Notes
- All background settings are persisted in YAML under the card’s `style` field.
- The editor preview reflects the background settings immediately.
