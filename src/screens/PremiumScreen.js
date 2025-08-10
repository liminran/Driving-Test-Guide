import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PremiumPlans, getPremiumStatus, isPremiumActive, restoreFromRedeemCode, ensureWebTrialStarted, getWebTrialInfo, getOrCreateDeviceId } from '../utils/premium';
import { PayChannels, ProductSkus, getQrPayload, launchPayment, markPaidLocally } from '../payments/paymentService';
import { createOrder, pollOrderPaid, skuToPlan } from '../payments/paymentService';
import { verifySignedCodeAndActivate } from '../utils/premiumSigned';

const PLANS = [
  {
    sku: ProductSkus.PRO_MONTHLY,
    title: '专业版（月度）',
    price: '¥18/月',
    desc: '无限错题解析、题目解析图片高清、离线缓存、优先更新',
    plan: PremiumPlans.PRO_MONTHLY,
  },
  {
    sku: ProductSkus.PRO_YEARLY,
    title: '专业版（年度）',
    price: '¥98/年',
    desc: '较月度更优惠，适合长期备考学习',
    plan: PremiumPlans.PRO_YEARLY,
  },
  {
    sku: ProductSkus.LIFETIME,
    title: '终身版',
    price: '¥299（限时，原价¥1899）',
    desc: '一次买断，永久使用全部高级功能',
    plan: PremiumPlans.LIFETIME,
  },
];

export default function PremiumScreen() {
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState({ plan: PremiumPlans.FREE });
  const [selectedSku, setSelectedSku] = useState(PLANS[0].sku);
  const [channel, setChannel] = useState(PayChannels.ALIPAY);
  const [redeemCode, setRedeemCode] = useState('');
  const [order, setOrder] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [trialInfo, setTrialInfo] = useState({ trialStartAt: null, expiresAt: null, remainingMs: 0 });
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    const init = async () => {
      await ensureWebTrialStarted();
      const s = await getPremiumStatus();
      const act = await isPremiumActive();
      setStatus(s);
      setActive(act);
      const id = await getOrCreateDeviceId();
      setDeviceId(id);
    };
    init();
  }, []);

  const selectedPlan = useMemo(() => PLANS.find(p => p.sku === selectedSku), [selectedSku]);
  const payUrl = useMemo(() => getQrPayload(channel, selectedSku, { platform: Platform.OS }), [channel, selectedSku]);

  const handlePay = async () => {
    try {
      // 创建订单
      const o = await createOrder(channel, selectedSku);
      setOrder(o);
      // 打开支付链接
      if (o?.payUrl) await launchPayment(channel, selectedSku, { platform: Platform.OS });
      // 开始轮询
      setVerifying(true);
      const paid = await pollOrderPaid(o.orderId, { intervalMs: 2000, timeoutMs: 180000 });
      if (paid) {
        await markPaidLocally(selectedSku);
        const s = await getPremiumStatus();
        const act = await isPremiumActive();
        setStatus(s);
        setActive(act);
        Alert.alert('开通成功', '已自动验证支付并开通高级权益');
      }
    } catch (e) {
      Alert.alert('支付/验证失败', e?.message || '请稍后再试');
    }
    finally { setVerifying(false); }
  };

  const handleMarkPaid = async () => {
    await markPaidLocally(selectedSku);
    const s = await getPremiumStatus();
    const act = await isPremiumActive();
    setStatus(s);
    setActive(act);
    Alert.alert('已激活', '本地已标记为已付费。生产环境请以服务端回调为准。');
  };

  const handleRedeem = async () => {
    try {
      // 尝试离线签名码
      if (Platform.OS === 'web') {
        try {
          await verifySignedCodeAndActivate(redeemCode);
        } catch (e) {
          // 回退旧FREE规则
          await restoreFromRedeemCode(redeemCode);
        }
      } else {
        await restoreFromRedeemCode(redeemCode);
      }
      const s = await getPremiumStatus();
      const act = await isPremiumActive();
      setStatus(s);
      setActive(act);
      setRedeemCode('');
      Alert.alert('兑换成功', '您的高级权益已开通');
    } catch (e) {
      Alert.alert('兑换失败', e?.message || '请检查兑换码');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>会员中心</Text>
          {active ? (
            <View style={styles.activeBadge}>
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
              <Text style={styles.activeText}>已解锁高级功能</Text>
            </View>
          ) : (
            <View style={styles.inactiveBadge}>
              <Ionicons name="lock-closed" size={18} color="#fff" />
              <Text style={styles.inactiveText}>未开通</Text>
            </View>
          )}
          <Text style={styles.currentPlan}>当前：{status?.plan || 'free'}</Text>
        </View>

        <Text style={styles.sectionTitle}>选择套餐</Text>
        <View style={styles.planList}>
          {PLANS.map(p => (
            <TouchableOpacity key={p.sku} style={[styles.planItem, selectedSku === p.sku && styles.planSelected]} onPress={() => setSelectedSku(p.sku)}>
              <Text style={styles.planTitle}>{p.title}</Text>
              <Text style={styles.planPrice}>{p.price}</Text>
              <Text style={styles.planDesc}>{p.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>支付方式</Text>
        <View style={styles.channelRow}>
          <TouchableOpacity style={[styles.channelBtn, channel === PayChannels.ALIPAY && styles.channelActive]} onPress={() => setChannel(PayChannels.ALIPAY)}>
            <Text style={styles.channelText}>支付宝</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.channelBtn, channel === PayChannels.WECHAT && styles.channelActive]} onPress={() => setChannel(PayChannels.WECHAT)}>
            <Text style={styles.channelText}>微信支付</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.channelBtn, channel === PayChannels.PAYPAL && styles.channelActive]} onPress={() => setChannel(PayChannels.PAYPAL)}>
            <Text style={styles.channelText}>PayPal</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.qrCard}>
          <Text style={styles.qrTitle}>扫码或跳转支付（买断原价¥1899，限时折扣¥299）</Text>
          <View style={styles.qrBox}>
            {Platform.OS === 'web' ? (
              <Image
                source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(order?.codeUrl || payUrl)}` }}
                style={{ width: 180, height: 180 }}
              />
            ) : (
              <Text selectable style={{ color: '#555', textAlign: 'center' }}>{order?.payUrl || payUrl}</Text>
            )}
          </View>
          <View style={styles.qrActions}>
            <TouchableOpacity style={styles.primaryBtn} onPress={handlePay}>
              <Text style={styles.primaryBtnText}>{verifying ? '验证中...' : '立即支付'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleMarkPaid}>
              <Text style={styles.secondaryBtnText}>我已完成支付</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>兑换码激活</Text>
        <Text style={{ color: '#666', marginBottom: 6 }}>本设备ID：{deviceId}</Text>
        <View style={styles.redeemRow}>
          <TextInput
            placeholder="输入兑换码（支持签名码/JWS，或 FREE-YYYYMMDD-XXXXXX）"
            value={redeemCode}
            onChangeText={setRedeemCode}
            style={styles.input}
          />
          <TouchableOpacity style={styles.primaryBtn} onPress={handleRedeem}>
            <Text style={styles.primaryBtnText}>兑换</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.benefits}>
          <Text style={styles.sectionTitle}>高级权益</Text>
          <Text style={styles.benefitItem}>• 大题量解锁与分类专项练习</Text>
          <Text style={styles.benefitItem}>• 高清图片与解析</Text>
          <Text style={styles.benefitItem}>• 错题本增强与统计分析</Text>
          <Text style={styles.benefitItem}>• 离线缓存题库</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scroll: { padding: 16 },
  header: { marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#0b72e7' },
  activeBadge: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#28a745', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  inactiveBadge: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#6c757d', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  activeText: { color: '#fff', marginLeft: 6 },
  inactiveText: { color: '#fff', marginLeft: 6 },
  currentPlan: { marginTop: 6, color: '#555' },
  sectionTitle: { marginTop: 18, marginBottom: 10, fontSize: 16, fontWeight: '700', color: '#333' },
  planList: { gap: 12 },
  planItem: { backgroundColor: '#fff', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#e8e8e8' },
  planSelected: { borderColor: '#0b72e7' },
  planTitle: { fontSize: 16, fontWeight: '600', color: '#222' },
  planPrice: { marginTop: 6, fontSize: 14, color: '#0b72e7' },
  planDesc: { marginTop: 6, fontSize: 13, color: '#666' },
  channelRow: { flexDirection: 'row', gap: 12 },
  channelBtn: { paddingVertical: 8, paddingHorizontal: 12, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, backgroundColor: '#fff' },
  channelActive: { borderColor: '#0b72e7' },
  channelText: { color: '#333' },
  qrCard: { marginTop: 10, backgroundColor: '#fff', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#e8e8e8' },
  qrTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  qrBox: { marginTop: 10, alignItems: 'center' },
  qrActions: { marginTop: 10, flexDirection: 'row', gap: 10 },
  primaryBtn: { backgroundColor: '#0b72e7', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  primaryBtnText: { color: '#fff', fontWeight: '600' },
  secondaryBtn: { backgroundColor: '#eef5ff', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  secondaryBtnText: { color: '#0b72e7', fontWeight: '600' },
  redeemRow: { marginTop: 10, flexDirection: 'row', gap: 10, alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, paddingHorizontal: 10, height: 40 },
  benefits: { marginTop: 10, backgroundColor: '#fff', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#e8e8e8' },
  benefitItem: { marginTop: 6, color: '#444' },
}); 