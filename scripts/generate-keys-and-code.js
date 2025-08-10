#!/usr/bin/env node
/* 用法：
   node scripts/generate-keys-and-code.js gen-key
   node scripts/generate-keys-and-code.js sign --device <deviceId> --years 3 --plan lifetime --out code.txt
*/
const fs = require('fs');
const crypto = require('crypto');

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function parseArgs() {
  const args = process.argv.slice(2);
  const cmd = args[0];
  const opts = {};
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--device') opts.device = args[++i];
    else if (args[i] === '--years') opts.years = Number(args[++i] || '3');
    else if (args[i] === '--plan') opts.plan = args[++i];
    else if (args[i] === '--out') opts.out = args[++i];
    else if (args[i] === '--priv') opts.priv = args[++i];
  }
  return { cmd, opts };
}

function genKey() {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const privPem = privateKey.export({ type: 'pkcs1', format: 'pem' });
  const pubPem  = publicKey.export({ type: 'spki', format: 'pem' });
  fs.writeFileSync('private.pem', privPem);
  fs.writeFileSync('public.pem', pubPem);
  console.log('生成完成：private.pem / public.pem');
}

function signCode({ device, years = 3, plan = 'lifetime', out, priv }) {
  if (!device) throw new Error('缺少 --device');
  const privatePem = fs.readFileSync(priv || 'private.pem');
  const header = { alg: 'RS256', typ: 'JWS' };
  const now = Date.now();
  const expiresAt = now + years * 365 * 24 * 60 * 60 * 1000;
  const payload = { plan, deviceId: device, issuedAt: now, expiresAt, nonce: crypto.randomBytes(8).toString('hex') };
  const h = b64url(JSON.stringify(header));
  const p = b64url(JSON.stringify(payload));
  const data = Buffer.from(`${h}.${p}`);
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(data);
  signer.end();
  const signature = signer.sign(privatePem);
  const s = b64url(signature);
  const jws = `${h}.${p}.${s}`;
  if (out) { fs.writeFileSync(out, jws); console.log(`兑换码已写入 ${out}`); }
  else { console.log('兑换码：', jws); }
}

const { cmd, opts } = parseArgs();
if (cmd === 'gen-key') genKey();
else if (cmd === 'sign') signCode(opts);
else console.log('用法:\n  gen-key\n  sign --device <deviceId> [--years 3] [--plan lifetime] [--out code.txt] [--priv private.pem]');
