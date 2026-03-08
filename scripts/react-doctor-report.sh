#!/bin/bash
set -e

OUTPUT_FILE=${REACT_DOCTOR_OUTPUT_FILE:-"react-doctor-output.txt"}
THRESHOLD=${REACT_DOCTOR_THRESHOLD:-90}

# Check if output file already exists (from previous check run)
if [ ! -f "$OUTPUT_FILE" ]; then
    # If not, run the check command which will generate it
    echo "Output file not found. Running react-doctor check..."
    npm run react-doctor || true
fi

# Extract score from output - handle both "94/100" and "94 / 100" formats
SCORE=$(grep -o '[0-9][0-9]* */ *100' "$OUTPUT_FILE" | sed 's/ *\/ *100//' | tail -1 || echo "0")

# Generate the markdown report
REACT_DOCTOR_SCORE="$SCORE" REACT_DOCTOR_THRESHOLD="$THRESHOLD" REACT_DOCTOR_OUTPUT_FILE="$OUTPUT_FILE" REACT_DOCTOR_GITHUB_REPOSITORY="${GITHUB_REPOSITORY:-}" REACT_DOCTOR_GITHUB_SHA="${GITHUB_SHA:-}" node -e '
const fs = require("fs");
const { buildReactDoctorMarkdownReport } = require("./scripts/react-doctor-report-formatter");

const score = Number(process.env.REACT_DOCTOR_SCORE || 0);
const threshold = Number(process.env.REACT_DOCTOR_THRESHOLD || 90);
const rawOutput = fs.readFileSync(process.env.REACT_DOCTOR_OUTPUT_FILE, "utf8");

const report = buildReactDoctorMarkdownReport({
    score,
    threshold,
    rawOutput,
    repository: process.env.REACT_DOCTOR_GITHUB_REPOSITORY || "",
    commitSha: process.env.REACT_DOCTOR_GITHUB_SHA || "",
});

process.stdout.write(report);
'
