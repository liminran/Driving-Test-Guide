import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform } from 'react-native';
import { verifySignedCodeAndActivate } from '../utils/premiumSigned';
import { restoreFromRedeemCode, getOrCreateDeviceId } from '../utils/premium';

export default function ActivationScreen({ navigation }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    (async () => {
      const id = await getOrCreateDeviceId();
      setDeviceId(id);
    })();
  }, []);

  const showError = (msg) => {
    setErrorMsg(msg || '激活失败，请检查兑换码');
    if (Platform.OS !== 'web') {
      Alert.alert('激活失败', msg || '请检查兑换码');
    } else {
      // Web 环境使用原生弹窗以确保一定可见
      try { window.alert(`激活失败：${msg || '请检查兑换码'}`); } catch (_) {}
    }
  };

  const handleActivate = async () => {
    setErrorMsg('');
    if (!code.trim()) {
      showError('请输入兑换码');
      return;
    }
    // 清洗：移除非 base64url 允许的字符，防止复制时带入中文标点/空白
    const cleaned = code.trim().replace(/[^A-Za-z0-9_\.-]/g, '');
    try {
      setLoading(true);
      if (Platform.OS === 'web') {
        try {
          await verifySignedCodeAndActivate(cleaned);
        } catch (e) {
          // 仅当是 FREE- 格式才回退
          if (/^FREE-\d{8}-[A-Z0-9]{6}$/i.test(cleaned)) {
            await restoreFromRedeemCode(cleaned);
          } else {
            throw e;
          }
        }
      } else {
        await restoreFromRedeemCode(cleaned);
      }
      if (Platform.OS !== 'web') {
        Alert.alert('成功', '激活成功，即将进入应用');
      }
      navigation.replace('Main');
    } catch (e) {
      console.error('激活失败:', e);
      showError(e?.message || '请检查兑换码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>请输入兑换码以激活</Text>
        <Text style={styles.deviceIdLabel}>本设备ID：</Text>
        <Text selectable style={styles.deviceIdValue}>{deviceId || '获取中...'}</Text>
        <TextInput
          placeholder="支持签名码/JWS，或 FREE-YYYYMMDD-XXXXXX"
          style={styles.input}
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
        />
        {!!errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
        <TouchableOpacity style={[styles.btn, loading && { opacity: 0.6 }]} onPress={handleActivate} disabled={loading}>
          <Text style={styles.btnText}>{loading ? '校验中...' : '激活'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7fb', alignItems: 'center', justifyContent: 'center' },
  card: { width: '88%', backgroundColor: '#fff', borderRadius: 12, padding: 20, elevation: 3, shadowOpacity: 0.08 },
  title: { fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 12 },
  deviceIdLabel: { color: '#666', marginBottom: 4 },
  deviceIdValue: { color: '#333', marginBottom: 12 },
  input: { height: 44, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, paddingHorizontal: 12, marginBottom: 8 },
  error: { color: '#d9534f', marginBottom: 8 },
  btn: { height: 44, backgroundColor: '#0b72e7', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: '600' }
}); 