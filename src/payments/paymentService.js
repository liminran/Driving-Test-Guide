import { Linking, Platform } from 'react-native';
import { setPremiumStatus, PremiumPlans } from '../utils/premium';
import { getPaymentConfig } from '../config/payments';

/**
 * 说明：真实支付需后端统一下单与回调校验。
 * 客户端：createOrder -> open payUrl -> poll checkStatus -> markPaid
 */

export const PayChannels = {
  ALIPAY: 'alipay',
  WECHAT: 'wechat',
  PAYPAL: 'paypal',
};

export const ProductSkus = {
  PRO_MONTHLY: 'pro_monthly',
  PRO_YEARLY: 'pro_yearly',
  LIFETIME: 'lifetime',
};

export function skuToPlan(sku) {
  if (sku === ProductSkus.LIFETIME) return PremiumPlans.LIFETIME;
  if (sku === ProductSkus.PRO_YEARLY) return PremiumPlans.PRO_YEARLY;
  return PremiumPlans.PRO_MONTHLY;
}

export async function createOrder(channel, sku) {
  const cfg = getPaymentConfig();
  if (!cfg.createOrderUrl) throw new Error('缺少 createOrderUrl 配置');
  const resp = await fetch(cfg.createOrderUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channel, sku, platform: Platform.OS })
  });
  if (!resp.ok) throw new Error('创建订单失败');
  const data = await resp.json();
  if (!data?.orderId || !data?.payUrl) throw new Error('返回数据缺失');
  return data;
}

export async function pollOrderPaid(orderId, { intervalMs = 2000, timeoutMs = 180000 } = {}) {
  const cfg = getPaymentConfig();
  if (!cfg.checkStatusUrl) throw new Error('缺少 checkStatusUrl 配置');
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const resp = await fetch(`${cfg.checkStatusUrl}?orderId=${encodeURIComponent(orderId)}`);
    if (resp.ok) {
      const data = await resp.json();
      if (data?.status === 'PAID') return true;
      if (data?.status === 'FAILED') throw new Error('支付失败');
    }
    await new Promise(r => setTimeout(r, intervalMs));
  }
  throw new Error('支付验证超时');
}

export function buildPayUrl(channel, sku, extra = {}) {
  const base = channel === PayChannels.ALIPAY
    ? 'https://your-domain.com/pay/alipay?sku='
    : channel === PayChannels.WECHAT
    ? 'https://your-domain.com/pay/wechat?sku='
    : 'https://your-domain.com/pay/paypal?sku=';
  const params = new URLSearchParams({ sku, ...extra }).toString();
  return `${base}${encodeURIComponent(sku)}&${params}`;
}

export function buildPaypalMeUrl(amountCny = 299) {
  const cfg = getPaymentConfig();
  // 允许直接提供完整 paypal.me 链接；若无则简单拼接
  if (cfg.paypalMeUrl) return cfg.paypalMeUrl;
  return `https://paypal.me/yourname/${amountCny}`;
}

export async function launchPayment(channel, sku, extra = {}) {
  try {
    const order = await createOrder(channel, sku);
    if (order?.payUrl) await Linking.openURL(order.payUrl);
    return order;
  } catch (e) {
    // 渠道回退
    if (channel === PayChannels.PAYPAL) {
      const url = buildPaypalMeUrl(299);
      await Linking.openURL(url);
      return { orderId: undefined, payUrl: url };
    }
    const url = buildPayUrl(channel, sku, extra);
    await Linking.openURL(url);
    return { orderId: undefined, payUrl: url };
  }
}

export async function markPaidLocally(sku) {
  const now = Date.now();
  const plan = skuToPlan(sku);
  let expiresAt = undefined;
  if (plan === PremiumPlans.PRO_MONTHLY) {
    expiresAt = now + 30 * 24 * 60 * 60 * 1000;
  } else if (plan === PremiumPlans.PRO_YEARLY) {
    expiresAt = now + 365 * 24 * 60 * 60 * 1000;
  }
  return setPremiumStatus({ plan, activatedAt: now, ...(expiresAt ? { expiresAt } : {}), source: 'server_verified' });
}

export function getQrPayload(channel, sku, extra = {}) {
  return buildPayUrl(channel, sku, { via: 'qr', ...extra });
} 