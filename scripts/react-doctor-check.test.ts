import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';

describe('react-doctor-check.sh', () => {
    it('writes ANSI-clean output to REACT_DOCTOR_OUTPUT_FILE', () => {
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rd-check-test-'));
        const fakeBinDir = path.join(tempDir, 'bin');
        const outputFile = path.join(tempDir, 'react-doctor-output.txt');

        fs.mkdirSync(fakeBinDir, { recursive: true });
        fs.writeFileSync(
            path.join(fakeBinDir, 'npx'),
            '#!/bin/bash\n' +
            'printf "react-doctor v0.0.30\\n"\n' +
            'printf "\\033[32m✔\\033[0m Running lint checks.\\n"\n' +
            'printf "  │ \\033[31m94 / 100\\033[0m Great │\\n"\n' +
            'exit 0\n',
            { mode: 0o755 },
        );

        const scriptPath = path.join(__dirname, 'react-doctor-check.sh');
        const result = spawnSync('bash', [scriptPath], {
            encoding: 'utf8',
            env: {
                ...process.env,
                PATH: `${fakeBinDir}:${process.env.PATH || ''}`,
                REACT_DOCTOR_OUTPUT_FILE: outputFile,
                REACT_DOCTOR_THRESHOLD: '90',
            },
        });

        expect(result.status).toBe(0);
        const persistedOutput = fs.readFileSync(outputFile, 'utf8');
        expect(persistedOutput).toContain('94 / 100');
        expect(persistedOutput).not.toContain('\u001b[');
    });
});
