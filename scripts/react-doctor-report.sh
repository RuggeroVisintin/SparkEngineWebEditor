#!/bin/bash
set -e

# Get score first
SCORE=$(npx react-doctor --offline -y --score 2>&1 | tail -1)

# Run react-doctor and capture full output to a file
OUTPUT_FILE="react-doctor-output.txt"
npx react-doctor --offline -y > "$OUTPUT_FILE" 2>&1 || true

# Create PR comment format
echo "## 🩺 React Doctor Report"
echo ""
echo "**Score:** $SCORE / 100"
echo ""

# Check if score is below threshold
THRESHOLD=${REACT_DOCTOR_THRESHOLD:-90}
if [ "$SCORE" -lt "$THRESHOLD" ]; then
    echo "⚠️ **Score is below threshold ($THRESHOLD)**"
    echo ""
fi

# Extract and format diagnostics - get everything after "Running lint checks"
echo "### Findings"
echo ""
echo '```'
# Extract the relevant section from output, removing the last line
sed -n '/Running lint checks/,/Full diagnostics written to/p' "$OUTPUT_FILE" | sed '$d'
echo '```'

# Cleanup
rm -f "$OUTPUT_FILE"
