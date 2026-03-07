const { buildReactDoctorMarkdownReport } = require('../../../scripts/react-doctor-report-formatter');

describe('buildReactDoctorMarkdownReport', () => {
    it('renders score, summary, and findings as markdown tables', () => {
        const output = `react-doctor v0.0.30

✔ Running lint checks.
✔ Detecting dead code.
  ✗ Component "Wrapper" defined inside "WithMemoryRouter" — creates new instance every render, destroying state
  ⚠ Unused file (12)
  ⚠ Array index "index" used as key — causes bugs when list is reordered or filtered (2)

  │ ✗ 1 error  ⚠ 29 warnings  across 24/160 files  in 502ms │
`;

        const report = buildReactDoctorMarkdownReport({
            score: 94,
            threshold: 90,
            rawOutput: output,
        });

        expect(report).toContain('## 🩺 React Doctor Report');
        expect(report).toContain('**Score:** 94 / 100');
        expect(report).toContain('### Summary');
        expect(report).toContain('| Metric | Value |');
        expect(report).toContain('| Status | ✅ Pass |');
        expect(report).toContain('| Errors | 1 |');
        expect(report).toContain('| Warnings | 29 |');
        expect(report).toContain('| Files With Findings | 24/160 |');
        expect(report).toContain('### Findings');
        expect(report).toContain('| Severity | Finding | Count |');
        expect(report).toContain('| Error | Component "Wrapper" defined inside "WithMemoryRouter" — creates new instance every render, destroying state | 1 |');
        expect(report).toContain('| Warning | Unused file | 12 |');
        expect(report).toContain('| Warning | Array index "index" used as key — causes bugs when list is reordered or filtered | 2 |');
    });

    it('renders a warning status when score is below threshold', () => {
        const report = buildReactDoctorMarkdownReport({
            score: 82,
            threshold: 90,
            rawOutput: '  │ ✗ 0 errors  ⚠ 5 warnings  across 3/160 files  in 450ms │',
        });

        expect(report).toContain('| Status | ⚠️ Below Threshold |');
        expect(report).toContain('| Threshold | 90 |');
    });
});