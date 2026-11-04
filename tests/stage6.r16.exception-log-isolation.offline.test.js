'use strict';

// Stage 6 R16 — isolated offline log-disclosure probe.
// Reads the original logger.js, but redirects its file transports to OS temporary
// storage in an IN-MEMORY copy of that source. The WA project is never written.
// Child processes deliberately raise synthetic exceptions; the parent process
// remains alive. No network, MySQL, email, server, or genuine secrets are used.

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const projectRoot = path.resolve(__dirname, '..');
const loggerFile = path.join(projectRoot, 'logger.js');
const source = fs.readFileSync(loggerFile, 'utf8');
const pattern = /path\.join\(__dirname,\s*['"]logs['"],/g;
const matches = source.match(pattern) || [];

// Only the intended destination substitution is allowed. If logger.js changes
// its logging paths or transport declarations, fail closed rather than write to
// the application's normal logs.
assert.equal(matches.length, 4, 'Refusing to run: expected four known logger transport paths');
assert.match(source, /exceptionHandlers\s*:/, 'Exception handler missing');
assert.match(source, /rejectionHandlers\s*:/, 'Rejection handler missing');

const worker = String.raw`
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const filename = process.env.WA_R16_LOGGER_FILE;
const original = fs.readFileSync(filename, 'utf8');
const pattern = /path\.join\(__dirname,\s*['"]logs['"],/g;
const count = (original.match(pattern) || []).length;
if (count !== 4) process.exit(93);
const isolated = original.replace(pattern, "path.join(process.env.WA_R16_LOG_SANDBOX,");
const loaded = new Module(filename, module);
loaded.filename = filename;
loaded.paths = Module._nodeModulePaths(path.dirname(filename));
loaded._compile(isolated, filename);
const synthetic = process.env.WA_R16_SYNTHETIC_MARKER;
if (process.env.WA_R16_SCENARIO === 'exception') {
  setImmediate(() => { throw new Error('SYNTHETIC_R16_TEST_SECRET=' + synthetic); });
} else if (process.env.WA_R16_SCENARIO === 'rejection') {
  Promise.reject(new Error('SYNTHETIC_R16_TEST_SECRET=' + synthetic));
} else {
  process.exit(92);
}
`;

function runScenario(kind, logName) {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'wa-r16-logger-probe-'));
    const marker = `FAKE_NOT_REAL_${kind.toUpperCase()}_R16_12345`;
    try {
        const result = spawnSync(process.execPath, ['-e', worker], {
            cwd: temp,
            timeout: 12000,
            maxBuffer: 2 * 1024 * 1024,
            encoding: 'utf8',
            windowsHide: true,
            env: {
                ...process.env,
                WA_R16_LOGGER_FILE: loggerFile,
                WA_R16_LOG_SANDBOX: temp,
                WA_R16_SCENARIO: kind,
                WA_R16_SYNTHETIC_MARKER: marker
            }
        });
        assert.equal(result.error, undefined, `${kind} worker failed to execute`);
        assert.notEqual(result.status, 92, `${kind} scenario was not recognized`);
        assert.notEqual(result.status, 93, 'Worker refused unsafe path substitution');
        const logPath = path.join(temp, logName);
        assert.ok(fs.existsSync(logPath), `${logName} was not created in sandbox`);
        const data = fs.readFileSync(logPath, 'utf8');
        assert.ok(data.includes('SYNTHETIC_R16_TEST_SECRET='),
            `The synthetic exception text was not found in ${logName}; investigate before interpreting outcome`);
        const exposed = data.includes(marker);
        // Intentionally report a finding rather than asserting "safe". This is a
        // diagnostic test: the current logger is expected to reproduce leakage.
        console.log(`R16 ${kind}: synthetic marker written to ${logName}: ${exposed ? 'YES — RISK REPRODUCED' : 'NO — NOT REPRODUCED'}`);
        assert.equal(exposed, true,
            `${kind} no longer reproduces the original disclosure behavior; review as potential mitigation`);
    } finally {
        fs.rmSync(temp, { recursive: true, force: true });
    }
}

test('R16: exception handler writes a synthetic secret to its isolated log', () => {
    runScenario('exception', 'exceptions.log');
});

test('R16: rejection handler writes a synthetic secret to its isolated log', () => {
    runScenario('rejection', 'rejections.log');
});
