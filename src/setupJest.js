// This file runs before any test files and sets up import.meta mock
// Must be plain JS since it runs before TypeScript transformation

// Mock import.meta for Jest (required for Vite's asset URL handling)
global.importMeta = {
    url: 'file:///mock-path/',
};
