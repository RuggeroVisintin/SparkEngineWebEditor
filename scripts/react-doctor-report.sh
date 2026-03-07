#!/bin/bash
set -e

# Get score first
SCORE=$(npx react-doctor --offline -y --score 2>&1 | tail -1)

# Run react-doctor and capture full output to a file
OUTPUT_FILE="react-doctor-output.txt"
npx react-doctor --offline -y > "$OUTPUT_FILE" 2>&1 || true

THRESHOLD=${REACT_DOCTOR_THRESHOLD:-90}

REACT_DOCTOR_SCORE="$SCORE" REACT_DOCTOR_THRESHOLD="$THRESHOLD" REACT_DOCTOR_OUTPUT_FILE="$OUTPUT_FILE" node -e '
const fs = require("fs");
const { buildReactDoctorMarkdownReport } = require("./scripts/react-doctor-report-formatter");

const score = Number(process.env.REACT_DOCTOR_SCORE || 0);
const threshold = Number(process.env.REACT_DOCTOR_THRESHOLD || 90);
const rawOutput = fs.readFileSync(process.env.REACT_DOCTOR_OUTPUT_FILE, "utf8");

const report = buildReactDoctorMarkdownReport({
    score,
    threshold,
    rawOutput,
});

process.stdout.write(report);
'

# Cleanup
rm -f "$OUTPUT_FILE"
