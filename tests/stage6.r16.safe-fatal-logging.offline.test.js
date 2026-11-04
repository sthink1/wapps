"use strict";
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'logger.js');
const marker = 'R16_SYNTHETIC_SECRET_NEVER_REAL_9bc1b6';

function scenario(kind) {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'wa-r16-fatal-'));
    try {
        fs.mkdirSync(path.join(temp, 'logs'));
        fs.copyFileSync(source, path.join(temp, 'logger.js'));
        const code = kind === 'exception'
            ? `require('./logger'); throw new Error(${JSON.stringify(marker)});`
            : kind === 'rejection'
                ? `require('./logger'); Promise.reject(new Error(${JSON.stringify(marker)}));`
                : `const fs = require('node:fs');
                   const path = require('node:path');
                   const logger = require('./logger');
                   logger.info('R16 ordinary informational event');
                   logger.error('R16 ordinary error event');
                   const started = Date.now();
                   const timer = setInterval(() => {
                     const read = (name) => {
                       try { return fs.readFileSync(path.join(__dirname, 'logs', name), 'utf8'); }
                       catch (_) { return ''; }
                     };
                     const combined = read('combined.log');
                     const errors = read('error.log');
                     if (combined.includes('R16 ordinary informational event') &&
                         combined.includes('R16 ordinary error event') &&
                         errors.includes('R16 ordinary error event')) {
                       clearInterval(timer);
                       process.exit(0);
                     }
                     if (Date.now() - started > 4000) {
                       clearInterval(timer);
                       process.exit(2);
                     }
                   }, 25);`;
        const childFile = path.join(temp, 'child.js');
        fs.writeFileSync(childFile, code);
        const env = { ...process.env, NODE_PATH: [path.join(root, 'node_modules'), process.env.NODE_PATH || ''].filter(Boolean).join(path.delimiter) };
        const child = spawnSync(process.execPath, [childFile], {
            cwd: temp,
            env,
            encoding: 'utf8',
            timeout: 10000,
            maxBuffer: 512 * 1024,
        });
        assert.ifError(child.error);
        const logs = {};
        for (const file of ['exceptions.log', 'rejections.log', 'combined.log', 'error.log']) {
            const filepath = path.join(temp, 'logs', file);
            logs[file] = fs.existsSync(filepath) ? fs.readFileSync(filepath, 'utf8') : '';
        }
        const output = (child.stdout || '') + (child.stderr || '');
        const all = output + Object.values(logs).join('');
        assert.equal(all.includes(marker), false, `${kind}: fabricated marker appeared in logs or output`);
        if (kind === 'exception') {
            assert.equal(child.status, 1, 'Uncaught exception must exit nonzero');
            assert.match(logs['exceptions.log'], /Uncaught exception \(details omitted\)/);
            assert.equal(logs['rejections.log'], '');
        } else if (kind === 'rejection') {
            assert.equal(child.status, 1, 'Unhandled rejection must exit nonzero');
            assert.match(logs['rejections.log'], /Unhandled promise rejection \(details omitted\)/);
            assert.equal(logs['exceptions.log'], '');
        } else {
            assert.equal(child.status, 0, 'Normal logging must complete');
            assert.match(logs['combined.log'], /R16 ordinary informational event/);
            assert.match(logs['combined.log'], /R16 ordinary error event/);
            assert.match(logs['error.log'], /R16 ordinary error event/);
        }
        console.log(`R16 ${kind}: secret absent; required output verified`);
    } finally {
        fs.rmSync(temp, { recursive: true, force: true });
    }
}

test('R16: uncaught exception is replaced with safe fixed diagnostic', () => scenario('exception'));
test('R16: unhandled rejection is replaced with safe fixed diagnostic', () => scenario('rejection'));
test('R16: ordinary Winston logs retain existing transports', () => scenario('normal'));
