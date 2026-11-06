// Stage 6 R16: isolated contact-form security regression, no network or DB.
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');

function loadEmail({ providerThrows = false } = {}) {
  const sent = [];
  const logs = [];
  const mockResend = class {
    constructor() {}
    emails = {
      send: async payload => {
        if (providerThrows) throw Error('SECRET PROVIDER INTERNAL ERROR');
        sent.push(payload);
        return { id: 'test-only' };
      }
    };
  };
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'send_email.js'), 'utf8'), {
    require(name) {
      if (name === 'resend') return { Resend: mockResend };
      if (name === './logger') return { info: x => logs.push(x), error: x => logs.push(x) };
      throw Error(`Unexpected module ${name}`);
    }, module, exports: module.exports,
    process: { env: { RESEND_API_KEY: 'stub', MAIL_FROM_NAME: 'WA', MAIL_FROM_ADDRESS: 'noreply@example.com', MAIL_TO_ADDRESS: 'test@example.com' } }
  }, { filename: 'send_email.js' });
  return { sendEmail: module.exports.sendEmail, sent, logs };
}

function loadRoute(sendEmail) {
  const source = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
  const start = source.indexOf("app.post('/send-email', async (req, res) => {");
  const end = source.indexOf('// Root route to serve home.html for PWA', start);
  assert.ok(start > 0 && end > start, 'actual /send-email handler must be found');
  let route;
  const logs = [];
  vm.runInNewContext(source.slice(start, end), {
    app: { post(path, handler) { assert.equal(path, '/send-email'); route = handler; } },
    sendEmail,
    logger: { error: x => logs.push(x) }
  }, { filename: 'server.js:/send-email' });
  assert.equal(typeof route, 'function');
  return { route, logs };
}

async function invoke(route, body) {
  const output = { status: 200, data: null };
  const res = {
    status(code) { output.status = code; return this; },
    json(data) { output.data = JSON.parse(JSON.stringify(data)); return this; }
  };
  await route({ body }, res);
  return output;
}

const valid = { name: 'User', email: 'user@example.com', phone: '', subject: 'Hello', message: 'Line one\nLine two' };

test('valid Contact Us submission preserves success response and line breaks', async () => {
  const { sendEmail, sent } = loadEmail();
  const { route } = loadRoute(sendEmail);
  const response = await invoke(route, valid);
  assert.equal(response.status, 200);
  assert.deepEqual(response.data, { status: 'success', message: 'Thank you, User! Your message has been sent successfully.' });
  assert.equal(sent.length, 1);
  assert.match(sent[0].html, /Line one<br>Line two/);
  assert.match(sent[0].text, /Line one\nLine two/);
});

test('numeric message rejects before contacting email provider and hides TypeError', async () => {
  const { sendEmail, sent } = loadEmail();
  const { route } = loadRoute(sendEmail);
  const response = await invoke(route, { ...valid, message: 12345 });
  assert.equal(response.status, 400);
  assert.deepEqual(response.data, { status: 'error', message: 'All required fields must be filled.' });
  assert.equal(sent.length, 0);
});

test('malformed body and optional phone types reject safely', async () => {
  const { sendEmail, sent } = loadEmail();
  const { route } = loadRoute(sendEmail);
  for (const body of [undefined, null, { ...valid, name: '   ' }, { ...valid, phone: { unexpected: true } }, { ...valid, subject: [] }]) {
    const result = await invoke(route, body);
    assert.equal(result.status, 400);
    assert.equal(result.data.status, 'error');
  }
  assert.equal(sent.length, 0);
});

test('direct helper rejects nonstring message before reaching HTML template', async () => {
  const { sendEmail, sent } = loadEmail();
  await assert.rejects(sendEmail({ ...valid, message: 12345 }), /All required fields/);
  assert.equal(sent.length, 0);
});

test('email HTML escapes all contact fields but preserves plaintext', async () => {
  const { sendEmail, sent } = loadEmail();
  await sendEmail({ name: '<b>A&B</b>', email: '"a"@example.com', phone: '<img>', subject: '<script>x</script>', message: '<script>alert(1)</script>\nA&B' });
  assert.equal(sent.length, 1);
  assert.ok(!sent[0].html.includes('<script>'));
  assert.match(sent[0].html, /&lt;b&gt;A&amp;B&lt;\/b&gt;/);
  assert.match(sent[0].html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;<br>A&amp;B/);
  assert.match(sent[0].html, /&lt;img&gt;/);
  assert.match(sent[0].html, /&quot;a&quot;@example.com/);
  assert.match(sent[0].text, /<script>alert\(1\)<\/script>/);
});

test('unexpected provider failure returns generic message without disclosing exception', async () => {
  const { sendEmail, sent, logs } = loadEmail({ providerThrows: true });
  const { route, logs: routeLogs } = loadRoute(sendEmail);
  const response = await invoke(route, valid);
  assert.equal(response.status, 400); // preserve existing Contact Us error status contract
  assert.deepEqual(response.data, { status: 'error', message: 'Unable to send your message at this time.' });
  assert.ok(!JSON.stringify([...logs, ...routeLogs, response]).includes('SECRET PROVIDER'));
  assert.equal(sent.length, 0);
});

test('unexpected internal helper exception cannot leak raw error text', async () => {
  const { route, logs } = loadRoute(async () => { throw Error('INTERNAL_SECRET_TEST_MARKER'); });
  const response = await invoke(route, valid);
  assert.equal(response.status, 400);
  assert.equal(response.data.message, 'Unable to send your message at this time.');
  assert.ok(!JSON.stringify({ response, logs }).includes('INTERNAL_SECRET_TEST_MARKER'));
});
