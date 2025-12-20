import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock IndexedDB
const indexedDB = {
  open: () => ({
    onsuccess: null,
    onerror: null,
    result: {
      transaction: () => ({
        objectStore: () => ({
          get: () => ({}),
          put: () => ({}),
          add: () => ({}),
          delete: () => ({}),
        }),
      }),
    },
  }),
};

global.indexedDB = indexedDB as any;
