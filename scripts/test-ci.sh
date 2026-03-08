#!/bin/bash
set -e

npm run test -- \
    --collectCoverage \
    --coverageDirectory=.coverage \
    --watch=false \
    --watchAll=false \
    --coverageReporters=json \
    --coverageReporters=text \
    --coverageReporters=json-summary \

npm run test:scripts -- \
    --collectCoverage \
    --coverageDirectory=.coverage-scripts \
    --watch=false \
    --watchAll=false \
    --coverageReporters=json \
    --coverageReporters=text \
    --coverageReporters=json-summary