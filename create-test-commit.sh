#!/bin/bash

# Create a test commit with Feature-Flag footer to verify the system works

echo "🧪 Creating test commit with Feature-Flag footer"
echo "=========================================="
echo ""

# Check current flag status
echo "📋 Current .env.production status:"
grep "FEATURE_ADD_COMPONENTS" .env.production
echo ""

# Create a dummy file for the test commit
TEST_FILE="test-feature-flag-commit.txt"
echo "This is a test file to verify feature flag filtering works" > $TEST_FILE

# Stage the file
git add $TEST_FILE

# Create commit with Feature-Flag footer
git commit -m "test: verify feature flag filter plugin

This is a test commit to verify that the release-please plugin
correctly filters commits based on feature flags.

Feature-Flag: ADD_COMPONENTS"

echo ""
echo "✅ Test commit created!"
echo ""
echo "📌 Next steps:"
echo "   1. Push this commit: git push origin main"
echo "   2. Go to GitHub Actions: https://github.com/RuggeroVisintin/spark-engine-web-editor/actions"
echo "   3. Watch the 'Publish' job run"
echo "   4. Check if release-please creates/updates a PR"
echo ""
echo "🔍 Expected behavior:"
if grep -q "FEATURE_ADD_COMPONENTS=true" .env.production; then
    echo "   ✓ Flag is ENABLED - commit should appear in changelog"
else
    echo "   ✓ Flag is DISABLED - commit should be filtered out"
fi
echo ""
echo "💡 To undo this test commit: git reset --soft HEAD~1"
