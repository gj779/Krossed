// Browser global polyfill for Node.js compatibility
if (typeof global === 'undefined') {
  (window as any).global = globalThis;
}

export {};