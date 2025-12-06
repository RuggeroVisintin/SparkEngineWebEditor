#!/bin/bash

# Test release-please locally with the feature flag plugin

echo "🧪 Testing release-please with feature-flag-filter plugin"
echo "=========================================="
echo ""

# Create a test commit with Feature-Flag footer
TEST_FILE=".test-release-please-commit.txt"
echo "This is a temporary test file for release-please dry-run" > $TEST_FILE
git add $TEST_FILE

echo "📝 Creating test commit with Feature-Flag footer..."
git commit -m "test: verify release-please plugin integration

This is a test commit to verify the feature flag filter plugin.

Feature-Flag: ADD_COMPONENTS" --no-verify

echo ""

# Install release-please CLI if not already installed
if ! command -v release-please &> /dev/null; then
    echo "📦 Installing release-please CLI..."
    npm install -g release-please
fi

# Install the plugin locally
echo "📦 Installing feature-flag-filter plugin..."
npm install --no-save ./release-please-plugin-feature-flags

echo ""
echo "🔍 Running release-please in dry-run mode..."
echo ""

# Run release-please to see what it would do
# This won't create a PR, just shows what would happen
npx release-please release-pr \
  --repo-url=RuggeroVisintin/spark-engine-web-editor \
  --target-branch=main \
  --dry-run \
  --debug

echo ""
echo "=========================================="
echo "✅ Check the output above to see:"
echo "   - Which commits were included"
echo "   - Which commits were filtered out"
echo "   - What the changelog would look like"
echo ""

# Clean up test commit
echo "🧹 Removing test commit..."
git reset --soft HEAD~1
rm -f $TEST_FILE
git reset HEAD $TEST_FILE 2>/dev/null
rm -f $TEST_FILE

echo "✅ Test commit removed"
