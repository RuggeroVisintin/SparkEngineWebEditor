const cracoConfig = require('./craco.config.js');

// Get the base config from react-scripts
const createJestConfig = require('react-scripts/scripts/utils/createJestConfig');
const path = require('path');

// Create base Jest config with proper paths
const rootDir = path.resolve(__dirname);
const jestConfig = createJestConfig(
    relativePath => path.resolve(rootDir, 'node_modules/react-scripts', relativePath),
    rootDir,
    false
);

// Apply craco Jest configuration
const cracoJestConfig = cracoConfig.jest.configure(jestConfig);

// Export the final configuration
module.exports = cracoJestConfig;
