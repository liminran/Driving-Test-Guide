import Constants from 'expo-constants';

export function getPaymentConfig() {
  // expo SDK 49: Constants.expoConfig?.extra；旧版可能是 Constants.manifest?.extra
  const extra = (Constants?.expoConfig && Constants.expoConfig.extra) || (Constants?.manifest && Constants.manifest.extra) || {};
  const payments = extra.payments || {};
  return {
    createOrderUrl: payments.createOrderUrl || '',
    checkStatusUrl: payments.checkStatusUrl || '',
    paypalMeUrl: payments.paypalMeUrl || '',
    // 可扩展：通知回调、签名等
  };
} 