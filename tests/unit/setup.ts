import '@testing-library/jest-dom';

// jsdom does not implement matchMedia; antd's responsive components call it on
// render. Provide the standard no-op polyfill so component tests can mount them.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

// Same story as matchMedia: jsdom does not implement ResizeObserver, and antd
// v6 mounts @rc-component/resize-observer inside several card renderers. Without
// this, any test that renders a real card through BaseCard dies in a passive
// effect with "ResizeObserver is not defined" — which reads like a component
// bug and is not one.
if (typeof globalThis !== 'undefined' && !('ResizeObserver' in globalThis)) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = ResizeObserverStub;
}
