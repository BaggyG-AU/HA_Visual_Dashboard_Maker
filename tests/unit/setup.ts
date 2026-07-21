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
