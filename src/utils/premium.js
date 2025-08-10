import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Platform } from 'react-native';

const STORAGE_KEY = 'premium-status:v1';
const TRIAL_KEY = 'web-trial-start-at:v1';
const USED_CODES_KEY = 'redeem-used-codes:v1';

/**
 * 会员计划定义
 * - free: 免费（默认）
 * - pro_monthly: 连续包月
 * - pro_yearly: 连续包年
 * - lifetime: 终身版
 */
export const PremiumPlans = {
  FREE: 'free',
  PRO_MONTHLY: 'pro_monthly',
  PRO_YEARLY: 'pro_yearly',
  LIFETIME: 'lifetime',
};

/**
 * 获取当前会员状态对象
 * { plan: string, activatedAt: number, expiresAt?: number }
 */
export async function getPremiumStatus() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { plan: PremiumPlans.FREE };
    const parsed = JSON.parse(raw);
    return parsed || { plan: PremiumPlans.FREE };
  } catch (e) {
    return { plan: PremiumPlans.FREE };
  }
}

/**
 * 设置会员状态
 */
export async function setPremiumStatus(status) {
  const safe = status || { plan: PremiumPlans.FREE };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
  notifySubscribers();
  return safe;
}

/**
 * 是否为激活的会员（考虑过期）
 */
export async function isPremiumActive() {
  const s = await getPremiumStatus();
  if (!s || !s.plan || s.plan === PremiumPlans.FREE) return false;
  if (s.plan === PremiumPlans.LIFETIME) return true;
  if (!s.expiresAt) return false;
  return Date.now() < Number(s.expiresAt);
}

// Web 一天试用
export async function ensureWebTrialStarted() {
  if (Platform.OS !== 'web') return;
  const existed = await AsyncStorage.getItem(TRIAL_KEY);
  if (!existed) await AsyncStorage.setItem(TRIAL_KEY, String(Date.now()));
}

export async function isWebTrialActive() {
  if (Platform.OS !== 'web') return false;
  const startRaw = await AsyncStorage.getItem(TRIAL_KEY);
  if (!startRaw) return false;
  const startAt = Number(startRaw);
  const day = 24 * 60 * 60 * 1000;
  return Date.now() - startAt < day;
}

export async function getWebTrialInfo() {
  if (Platform.OS !== 'web') return { trialStartAt: null, expiresAt: null, remainingMs: 0 };
  const startRaw = await AsyncStorage.getItem(TRIAL_KEY);
  if (!startRaw) return { trialStartAt: null, expiresAt: null, remainingMs: 0 };
  const startAt = Number(startRaw);
  const expiresAt = startAt + 24 * 60 * 60 * 1000;
  const remainingMs = Math.max(0, expiresAt - Date.now());
  return { trialStartAt: startAt, expiresAt, remainingMs };
}

export async function isEntitled() {
  if (await isPremiumActive()) return true;
  if (await isWebTrialActive()) return true;
  return false;
}

// 强制激活判断（不允许试用）
export async function isActivated() {
  return isPremiumActive();
}

/**
 * 计算并生成一个本地设备ID（弱标识，仅用于线下兑换码方案）
 */
export async function getOrCreateDeviceId() {
  const key = 'device-id:v1';
  let id = await AsyncStorage.getItem(key);
  if (id) return id;
  id = `dev_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
  await AsyncStorage.setItem(key, id);
  return id;
}

/**
 * 使用兑换码恢复或开通会员（本地校验格式，真正校验应走服务端）
 * 兑换码格式建议：PLAN-YYYYMMDD-XXXXXX
 */
export async function restoreFromRedeemCode(code) {
  if (!code || typeof code !== 'string') {
    throw new Error('兑换码无效');
  }
  const trimmed = code.trim().toUpperCase();
  // 简单格式校验
  const match = trimmed.match(/^FREE-(\d{8})-([A-Z0-9]{6})$/);
  if (!match) {
    throw new Error('兑换码格式不正确，应为 FREE-YYYYMMDD-XXXXXX');
  }

  const issuedStr = match[1];
  const y = Number(issuedStr.slice(0, 4));
  const m = Number(issuedStr.slice(4, 6));
  const d = Number(issuedStr.slice(6, 8));
  const issuedAt = new Date(Date.UTC(y, m - 1, d)).getTime();
  const threeYears = 3 * 365 * 24 * 60 * 60 * 1000;
  if (isNaN(issuedAt) || Date.now() - issuedAt > threeYears) {
    throw new Error('兑换码已过期（超过3年有效期）');
  }

  const usedRaw = await AsyncStorage.getItem(USED_CODES_KEY);
  const used = usedRaw ? JSON.parse(usedRaw) : [];
  if (used.includes(trimmed)) {
    throw new Error('本设备已使用过该兑换码');
  }

  const now = Date.now();
  await setPremiumStatus({ plan: PremiumPlans.LIFETIME, activatedAt: now, source: 'redeem_code', code: trimmed });
  await AsyncStorage.setItem(USED_CODES_KEY, JSON.stringify([...used, trimmed]));
  return { ok: true };
}

// 订阅与通知（简易）
const subscribers = new Set();

export function subscribePremiumStatus(listener) {
  if (typeof listener !== 'function') return () => {};
  subscribers.add(listener);
  return () => subscribers.delete(listener);
}

function notifySubscribers() {
  subscribers.forEach((fn) => {
    try { fn(); } catch (_) {}
  });
}

// 当 App 回到前台时可触发一次校验（预留扩展位）
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    notifySubscribers();
  }
}); 