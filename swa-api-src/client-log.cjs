/**
 * Azure Functions (v3 model) adapter around the shared hardened handler in api/client-log.js.
 * Bundled into swa-api/client-log/index.js by scripts/build-swa-api.mjs.
 */
const handler = require('../api/client-log.js').default;

module.exports = async function clientLogFunction(context, req) {
  const out = { status: 200, headers: {}, body: undefined };
  const res = {
    setHeader(key, value) {
      out.headers[key] = value;
    },
    status(code) {
      out.status = code;
      return res;
    },
    json(payload) {
      out.headers['Content-Type'] = 'application/json; charset=utf-8';
      out.body = JSON.stringify(payload);
      return res;
    },
  };

  await handler(
    { method: req.method, headers: req.headers || {}, body: req.rawBody, socket: {} },
    res,
  );

  context.res = { status: out.status, headers: out.headers, body: out.body, isRaw: true };
};
