// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import 'jest-canvas-mock';
import './__mocks__/fs-api.mock';
import './__mocks__/utils/image.mock';
import './__mocks__/broadcast.mock';
import './__mocks__/window.mock';

import { TextEncoder } from 'text-encoding';
import { webcrypto } from 'crypto';

jest.disableAutomock();

global.TextEncoder = TextEncoder;

// Polyfill crypto.getRandomValues for uuid package
if (!global.crypto) {
    (global as any).crypto = webcrypto;
}

// Mock createImageBitmap - not available in jsdom
global.createImageBitmap = jest.fn().mockResolvedValue({
    width: 100,
    height: 100,
    close: jest.fn(),
});

// Setup feature flags for tests - can be overridden in individual tests
// Usage in tests:
//   beforeEach(() => { (global as any).__FEATURE_FLAGS__ = { ADD_COMPONENTS: true }; });
(global as any).__FEATURE_FLAGS__ = {
    ADD_COMPONENTS: false,
};

// jest.mock('@sparkengine')

