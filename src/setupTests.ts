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

// jest.mock('@sparkengine')

