module.exports = {
    browsers: ['chromium'],
    launchOptions: {
        headless: false, // Change to false for debugging
        slowMo: 100
    },
    contextOptions: {
        viewport: { width: 1280, height: 720 }
    },
    serverOptions: {
        command: 'npm start',
        port: 3000,
        launchTimeout: 30000, // Increase timeout
        debug: true
    }
};