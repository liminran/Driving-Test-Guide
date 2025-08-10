/* 离线签名兑换码验证（Web前端） */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getOrCreateDeviceId, PremiumPlans, setPremiumStatus } from './premium';

const USED_CODES_KEY = 'redeem-used-signed:v1';

export const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAiaEyZVlcKOJkcLm4e0yh
8+X0vE1XHEwu51VbAmHvmoLlCCyirUDplY1s7kY4EI/B9lEWxK9zaN8cua2dA6aL
t0xmlP7kJj4XVJEHpLnJVC5tPRVnOHL5BX1c4wBRD8BSGwm13W61pVjAh74ZxbVv
K31RgJfwZJ9uPNICCTErF7PGxuxTSwJieR/B+U3CBJv+JheiHgBTaqBLlBtbLtsM
Xq/sX69N8KzdiCcDqEtEgHjOfVPxvhM97xDkl2ZyVgagn9WgKVdhYpID+B2dmmIC
4uqMFsZtssSCR1LtypIuTo3syECiElcwBJD8cODq7fV6Hg+bbE3I9RqUOWGhL82H
pwIDAQAB
-----END PUBLIC KEY-----`;

function base64urlToUint8Array(base64url) {
  const pad = '='.repeat((4 - (base64url.length % 4)) % 4);
  const b64 = base64url.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const binary = typeof atob === 'function' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function base64ToUint8Array(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function pemToArrayBuffer(pem) {
  // 去掉头尾与所有空白
  const base64 = pem.replace(/-----BEGIN PUBLIC KEY-----/g, '')
    .replace(/-----END PUBLIC KEY-----/g, '')
    .replace(/\r|\n|\s/g, '');
  const bytes = base64ToUint8Array(base64);
  return bytes.buffer;
}

async function importRsaPublicKey(pem) {
  const keyData = pemToArrayBuffer(pem);
  const subtle = (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) || null;
  if (!subtle) throw new Error('当前浏览器不支持 WebCrypto（请使用 HTTPS 的 Chrome/Edge）');
  return await subtle.importKey('spki', keyData, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, true, ['verify']);
}

export async function verifySignedCodeAndActivate(code) {
  if (Platform.OS !== 'web') throw new Error('离线验签仅支持 Web 环境');
  if (!code || typeof code !== 'string') throw new Error('兑换码无效');
  const parts = code.trim().split('.');
  if (parts.length !== 3) throw new Error('兑换码格式不正确');
  const [hB64, pB64, sB64] = parts;

  const dec = new TextDecoder();
  let header, payload;
  try {
    header = JSON.parse(dec.decode(base64urlToUint8Array(hB64)));
    payload = JSON.parse(dec.decode(base64urlToUint8Array(pB64)));
  } catch (e) {
    throw new Error('兑换码解析失败');
  }
  if (header.alg !== 'RS256') throw new Error('不支持的签名算法');

  const key = await importRsaPublicKey(PUBLIC_KEY_PEM);
  const subtle = window.crypto.subtle;
  const sig = base64urlToUint8Array(sB64);
  const signedData = new TextEncoder().encode(`${hB64}.${pB64}`);
  const ok = await subtle.verify({ name: 'RSASSA-PKCS1-v1_5' }, key, sig, signedData);
  if (!ok) throw new Error('签名校验失败（公钥不匹配或码已损坏）');

  const now = Date.now();
  if (!payload || payload.plan !== 'lifetime') throw new Error('计划无效');
  if (typeof payload.issuedAt !== 'number' || typeof payload.expiresAt !== 'number') throw new Error('时间字段无效');
  if (now > payload.expiresAt) throw new Error('兑换码已过期');
  if (typeof payload.deviceId !== 'string' || !payload.deviceId) throw new Error('缺少设备ID');

  const localDeviceId = await getOrCreateDeviceId();
  if (payload.deviceId !== localDeviceId) throw new Error('该兑换码未绑定当前设备');

  const usedRaw = await AsyncStorage.getItem(USED_CODES_KEY);
  const used = usedRaw ? JSON.parse(usedRaw) : [];
  const codeId = `${payload.deviceId}:${payload.nonce || ''}:${payload.issuedAt}`;
  if (used.includes(codeId)) throw new Error('本设备已使用过该兑换码');

  await setPremiumStatus({ plan: PremiumPlans.LIFETIME, activatedAt: now, source: 'signed_code', codeId });
  await AsyncStorage.setItem(USED_CODES_KEY, JSON.stringify([...used, codeId]));
  return { ok: true, payload };
} 