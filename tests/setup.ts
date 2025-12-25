import '@testing-library/jest-dom';
import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import 'fake-indexeddb/auto';

// Mock localStorage for tests
class LocalStorageMock {
  store: { [key: string]: string } = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

global.localStorage = new LocalStorageMock() as Storage;

// Clear localStorage before each test
beforeEach(() => {
  global.localStorage.clear();
});

// Cleanup after each test case
afterEach(() => {
  cleanup();
});
