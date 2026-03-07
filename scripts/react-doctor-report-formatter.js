function stripAnsi(value) {
    return value.replace(/\u001b\[[0-9;]*m/g, '');
}

function normalizeSpaces(value) {
    return value.replace(/\s+/g, ' ').trim();
}

function escapeTable(value) {
    return value.replace(/\|/g, '\\|');
}

function parseSummary(rawOutput) {
    const summaryMatch = rawOutput.match(/✗\s*(\d+)\s*error[s]?\s*⚠\s*(\d+)\s*warning[s]?\s*across\s*(\d+\/\d+)\s*files/i);

    if (!summaryMatch) {
        return {
            errors: 0,
            warnings: 0,
            filesWithFindings: '0/0',
        };
    }

    return {
        errors: Number(summaryMatch[1]),
        warnings: Number(summaryMatch[2]),
        filesWithFindings: summaryMatch[3],
    };
}

function parseFindings(rawOutput) {
    const lines = stripAnsi(rawOutput).split('\n');
    const findings = [];

    for (const line of lines) {
        const markerMatch = line.match(/^\s*([✗⚠])\s+(.+)$/);

        if (markerMatch) {
            const marker = markerMatch[1];
            const severity = marker === '✗' ? 'Error' : 'Warning';
            let message = markerMatch[2].trim();
            let count = 1;

            const countMatch = message.match(/\((\d+)\)\s*$/);
            if (countMatch) {
                count = Number(countMatch[1]);
                message = message.replace(/\(\d+\)\s*$/, '').trim();
            }

            message = normalizeSpaces(message.split(/\s{2,}/)[0] || message);

            findings.push({ severity, message, count });
            continue;
        }
    }

    return findings;
}

function buildReactDoctorMarkdownReport({ score, threshold, rawOutput }) {
    const summary = parseSummary(rawOutput);
    const findings = parseFindings(rawOutput);
    const status = score >= threshold ? '✅ Pass' : '⚠️ Below Threshold';
    const reportLines = [
        '## 🩺 React Doctor Report',
        '',
        `**Score:** ${score} / 100`,
        '',
        '### Summary',
        '',
        '| Metric | Value |',
        '| --- | --- |',
        `| Status | ${status} |`,
        `| Threshold | ${threshold} |`,
        `| Errors | ${summary.errors} |`,
        `| Warnings | ${summary.warnings} |`,
        `| Files With Findings | ${summary.filesWithFindings} |`,
        '',
        '### Findings',
        '',
    ];

    if (findings.length === 0) {
        reportLines.push('No findings detected.');
        return `${reportLines.join('\n')}\n`;
    }

    reportLines.push('| Severity | Finding | Count |');
    reportLines.push('| --- | --- | --- |');

    for (const finding of findings) {
        reportLines.push(
            `| ${finding.severity} | ${escapeTable(finding.message)} | ${finding.count} |`,
        );
    }

    return `${reportLines.join('\n')}\n`;
}

module.exports = {
    buildReactDoctorMarkdownReport,
};