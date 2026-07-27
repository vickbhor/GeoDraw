// OpenLayers' Map constructor observes its target element's size via ResizeObserver.
// Real browsers provide this natively; JSDOM (used to run these unit tests) does not,
// so tests that mount <app-map-view> would otherwise crash with
// "ReferenceError: ResizeObserver is not defined". This is a test-environment-only stub.
if (typeof (globalThis as any).ResizeObserver === 'undefined') {
  (globalThis as any).ResizeObserver = class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
